from sqlalchemy.orm import Session
from rapidfuzz import distance, fuzz
from typing import List, Dict, Any, Tuple
from datetime import datetime
from backend.app.models.models import Entity, MergeRecord, MergeStatus, Relationship

class EntityResolver:
    AUTO_MERGE_THRESHOLD = 0.88
    PROPOSE_MERGE_THRESHOLD = 0.65

    @staticmethod
    def normalize_name(name: str) -> str:
        if not name:
            return ""
        cleaned = name.lower().strip()
        cleaned = cleaned.replace(".", "").replace(",", "").replace("-", " ")
        return " ".join(cleaned.split())

    @classmethod
    def calculate_similarity(cls, entity_a: Entity, entity_b: Entity) -> Tuple[float, Dict[str, Any]]:
        evidence = {}

        name_a = cls.normalize_name(entity_a.name)
        name_b = cls.normalize_name(entity_b.name)

        jw_score = distance.JaroWinkler.similarity(name_a, name_b)
        evidence["name_jaro_winkler"] = round(jw_score, 3)

        token_score = fuzz.token_sort_ratio(name_a, name_b) / 100.0
        evidence["token_sort_ratio"] = round(token_score, 3)

        base_name_score = max(jw_score, token_score)

        alias_match = 0.0
        aliases_a = set(cls.normalize_name(a) for a in (entity_a.aliases or []))
        aliases_b = set(cls.normalize_name(b) for b in (entity_b.aliases or []))
        if aliases_a and aliases_b:
            shared_aliases = aliases_a.intersection(aliases_b)
            if shared_aliases:
                alias_match = 1.0
                evidence["shared_aliases"] = list(shared_aliases)

        if name_a in aliases_b or name_b in aliases_a:
            alias_match = max(alias_match, 0.9)
            evidence["name_in_aliases"] = True

        id_score = 0.0
        props_a = entity_a.properties or {}
        props_b = entity_b.properties or {}
        shared_props = []

        for key in ["email", "domain", "phone", "tax_id", "ssn"]:
            val_a = props_a.get(key)
            val_b = props_b.get(key)
            if val_a and val_b and str(val_a).lower().strip() == str(val_b).lower().strip():
                id_score = 1.0
                shared_props.append(f"{key}:{val_a}")

        if shared_props:
            evidence["shared_identifiers"] = shared_props

        if id_score == 1.0 and base_name_score >= 0.5:
            final_score = 0.95
        elif alias_match >= 0.9:
            final_score = max(base_name_score, 0.85)
        else:
            final_score = base_name_score

        if entity_a.type != entity_b.type and entity_a.type != "OTHER" and entity_b.type != "OTHER":
            final_score *= 0.7
            evidence["type_mismatch"] = f"{entity_a.type} vs {entity_b.type}"

        evidence["final_score"] = round(final_score, 3)
        return final_score, evidence

    @classmethod
    def run_resolution_for_entity(cls, db: Session, target_entity: Entity) -> List[MergeRecord]:
        if not target_entity.is_canonical:
            return []

        candidates = db.query(Entity).filter(
            Entity.id != target_entity.id,
            Entity.is_canonical == True
        ).all()

        created_proposals = []

        for candidate in candidates:
            score, evidence = cls.calculate_similarity(target_entity, candidate)

            if score >= cls.PROPOSE_MERGE_THRESHOLD:
                existing = db.query(MergeRecord).filter(
                    ((MergeRecord.target_entity_id == target_entity.id) & (MergeRecord.source_entity_id == candidate.id)) |
                    ((MergeRecord.target_entity_id == candidate.id) & (MergeRecord.source_entity_id == target_entity.id))
                ).first()

                if not existing:
                    merge_rec = MergeRecord(
                        target_entity_id=target_entity.id,
                        source_entity_id=candidate.id,
                        status=MergeStatus.APPROVED if score >= cls.AUTO_MERGE_THRESHOLD else MergeStatus.PROPOSED,
                        score=score,
                        evidence=evidence
                    )
                    db.add(merge_rec)
                    db.flush()

                    if score >= cls.AUTO_MERGE_THRESHOLD:
                        cls.execute_merge(db, target_entity.id, candidate.id)

                    created_proposals.append(merge_rec)

        db.commit()
        return created_proposals

    @classmethod
    def execute_merge(cls, db: Session, primary_id: str, secondary_id: str):
        primary = db.query(Entity).filter(Entity.id == primary_id).first()
        secondary = db.query(Entity).filter(Entity.id == secondary_id).first()

        if not primary or not secondary:
            return

        secondary.is_canonical = False
        secondary.canonical_id = primary.id

        existing_aliases = set(primary.aliases or [])
        existing_aliases.add(secondary.name)
        for a in (secondary.aliases or []):
            existing_aliases.add(a)
        primary.aliases = list(existing_aliases)

        merged_props = dict(secondary.properties or {})
        merged_props.update(primary.properties or {})
        primary.properties = merged_props

        db.query(Relationship).filter(Relationship.source_entity_id == secondary.id).update(
            {"source_entity_id": primary.id}
        )
        db.query(Relationship).filter(Relationship.target_entity_id == secondary.id).update(
            {"target_entity_id": primary.id}
        )

        db.commit()

    @classmethod
    def unmerge(cls, db: Session, merge_record_id: str):
        merge_rec = db.query(MergeRecord).filter(MergeRecord.id == merge_record_id).first()
        if not merge_rec:
            return False

        secondary = db.query(Entity).filter(Entity.id == merge_rec.source_entity_id).first()
        if secondary:
            secondary.is_canonical = True
            secondary.canonical_id = None

        merge_rec.status = MergeStatus.REVERTED
        merge_rec.resolved_at = datetime.utcnow()
        db.commit()
        return True
