import sys
import os
import json
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.core.database import Base, engine, SessionLocal
from backend.app.models.models import (
    Source, Entity, Relationship, Event, Document, MergeRecord,
    EntityType, SourceReliability
)
from backend.app.services.extractors import FileExtractor
from backend.app.services.entity_resolution import EntityResolver

def seed_database():
    print("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Purging previous database records...")
    db.query(MergeRecord).delete()
    db.query(Relationship).delete()
    db.query(Event).delete()
    db.query(Document).delete()
    db.query(Entity).delete()
    db.query(Source).delete()
    db.commit()

    sample_dir = os.path.join(os.path.dirname(__file__), "sample_data")

    # 1. Ingest Corporate Registry CSV
    csv_path = os.path.join(sample_dir, "companies.csv")
    s1 = Source(
        name="Corporate Registry 2024",
        origin="companies.csv",
        license="Public Domain",
        reliability_rating=SourceReliability.HIGH
    )
    db.add(s1)
    db.commit()

    created_entities = {}
    if os.path.exists(csv_path):
        with open(csv_path, "rb") as f:
            rows = FileExtractor.extract_csv(f.read())
            s1.record_count = len(rows)
            for row in rows:
                ent = Entity(
                    source_id=s1.id,
                    name=row["name"],
                    type=EntityType(row.get("type", "PERSON")),
                    confidence=0.98 if row["name"] in ["Alexander Vance", "Cyberdyne Systems", "Apex Cybernetics"] else 0.85,
                    properties={
                        "role": row.get("role"),
                        "email": row.get("email"),
                        "domain": row.get("domain"),
                        "city": row.get("city")
                    }
                )
                db.add(ent)
                db.flush()
                created_entities[ent.name] = ent

    # 2. Ingest Events JSON
    json_path = os.path.join(sample_dir, "events.json")
    s2 = Source(
        name="Global Tech Events Feed",
        origin="events.json",
        license="Open Intelligence",
        reliability_rating=SourceReliability.HIGH
    )
    db.add(s2)
    db.commit()

    if os.path.exists(json_path):
        with open(json_path, "rb") as f:
            ev_list = FileExtractor.extract_json(f.read())
            s2.record_count = len(ev_list)
            for item in ev_list:
                linked_id = created_entities.get(item.get("entity_name"))
                ev = Event(
                    source_id=s2.id,
                    title=item["title"],
                    date=datetime.strptime(item["date"], "%Y-%m-%d") if "date" in item else datetime.utcnow(),
                    category=item.get("category", "General"),
                    description=item.get("description"),
                    entity_ids=[linked_id.id] if linked_id else []
                )
                db.add(ev)

    # 3. Ingest Briefing HTML Document
    html_path = os.path.join(sample_dir, "briefing.html")
    s3 = Source(
        name="Global Tech Intelligence Briefing",
        origin="briefing.html",
        license="Restricted Analysis",
        reliability_rating=SourceReliability.MEDIUM,
        record_count=1
    )
    db.add(s3)
    db.commit()

    if os.path.exists(html_path):
        with open(html_path, "rb") as f:
            parsed_html = FileExtractor.extract_html(f.read())
            doc = Document(
                source_id=s3.id,
                title=parsed_html["title"],
                content=parsed_html["text"],
                file_type="HTML"
            )
            db.add(doc)

    # Create Explicit Canonical Relationships
    vance = created_entities.get("Alexander Vance")
    cyberdyne = created_entities.get("Cyberdyne Systems")
    sarah = created_entities.get("Dr. Sarah Connor")
    apex = created_entities.get("Apex Cybernetics")
    elena = created_entities.get("Elena Rostova")

    if vance and cyberdyne:
        r1 = Relationship(source_id=s1.id, source_entity_id=vance.id, target_entity_id=cyberdyne.id, type="EMPLOYED_BY", weight=1.0)
        db.add(r1)
    if sarah and cyberdyne:
        r2 = Relationship(source_id=s1.id, source_entity_id=sarah.id, target_entity_id=cyberdyne.id, type="MEMBER_OF", weight=0.9)
        db.add(r2)
    if elena and apex:
        r3 = Relationship(source_id=s1.id, source_entity_id=elena.id, target_entity_id=apex.id, type="EMPLOYED_BY", weight=1.0)
        db.add(r3)
    if cyberdyne and apex:
        r4 = Relationship(source_id=s1.id, source_entity_id=cyberdyne.id, target_entity_id=apex.id, type="PARTNERS_WITH", weight=0.85)
        db.add(r4)

    db.commit()

    print("Running Entity Resolution Engine to score and generate merge candidates...")
    if vance:
        EntityResolver.run_resolution_for_entity(db, vance)
    if elena:
        EntityResolver.run_resolution_for_entity(db, elena)

    print("Database seeding completed successfully with real sample data!")
    db.close()

if __name__ == "__main__":
    seed_database()
