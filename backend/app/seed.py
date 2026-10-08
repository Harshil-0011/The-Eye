import sys
import os
import random
from datetime import datetime, timedelta

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.core.database import Base, engine, SessionLocal
from backend.app.models.models import (
    Source, Entity, Relationship, Event, Document, MergeRecord,
    EntityType, SourceReliability, MergeStatus
)
from backend.app.services.entity_resolution import EntityResolver

FIRST_NAMES = ["Alexander", "Elena", "Marcus", "Hiroshi", "Rachel", "Viktor", "Kendra", "Arthur", "Sarah", "John", "David", "Sophia", "Lucas", "Aria", "Julian", "Claire", "Maximilian", "Sienna", "Gabriel", "Amara"]
LAST_NAMES = ["Vance", "Rostova", "Wright", "Sato", "Tyrell", "Connor", "Shaw", "Pendelton", "Mercer", "Koval", "Davenport", "Lindqvist", "Zheng", "Al-Mansoor", "Moreau", "Vanguard", "Sterling", "Thorne", "Chen", "Dubois"]
ORG_PREFIXES = ["Apex", "Cyberdyne", "Nexus", "Orbital", "Vanguard", "Aegis", "Quantum", "Hyperion", "Aether", "Sovereign", "Omni", "Helios", "Titan", "Spectra", "Zenith", "Chronos"]
ORG_SUFFIXES = ["Systems", "Cybernetics", "AI Corporation", "Technologies", "Defence", "Dynamics", "Labs", "Group", "Solutions", "Networks", "Industries", "Holdings"]
ROLES = ["Chief Technology Officer", "Lead Research Scientist", "Executive VP", "Managing Director", "Director of Robotics", "Founder & CEO", "Head of Cryptography", "Aerospace Division Lead"]
CITIES = ["San Francisco", "Austin", "Seattle", "Denver", "London", "Zurich", "Tokyo", "Berlin", "Singapore", "Toronto"]

RELATIONSHIP_TYPES = ["EMPLOYED_BY", "MEMBER_OF", "PARTNERS_WITH", "RESEARCH_COLLABORATION", "FOUNDED", "LEADS_PROJECT", "SECURITY_AUDIT"]

def seed_database():
    print("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Purging existing database records...")
    db.query(MergeRecord).delete()
    db.query(Relationship).delete()
    db.query(Event).delete()
    db.query(Document).delete()
    db.query(Entity).delete()
    db.query(Source).delete()
    db.commit()

    print("Generating 1000+ canonical intelligence records...")

    s1 = Source(name="Global Registry 2024", origin="global_registry.csv", reliability_rating=SourceReliability.HIGH, record_count=600)
    s2 = Source(name="Global Events Digest", origin="events_feed.json", reliability_rating=SourceReliability.HIGH, record_count=300)
    s3 = Source(name="Intelligence Document Briefings", origin="intel_docs.html", reliability_rating=SourceReliability.MEDIUM, record_count=100)
    db.add_all([s1, s2, s3])
    db.commit()

    entities = []

    # 1. Generate 700 Persons
    for i in range(700):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        full_name = f"{first} {last}"
        domain = f"{last.lower()}.io"
        city = random.choice(CITIES)
        e = Entity(
            source_id=s1.id,
            name=full_name,
            type=EntityType.PERSON,
            aliases=[f"{first[0]}. {last}", f"{first} {last[0]}."],
            confidence=round(random.uniform(0.85, 1.0), 2),
            properties={
                "role": random.choice(ROLES),
                "email": f"{first.lower()}.{last.lower()}@{domain}",
                "domain": domain,
                "city": city,
                "tax_id": f"US-{random.randint(1000000, 9999999)}"
            }
        )
        entities.append(e)

    # 2. Generate 300 Organizations
    for i in range(300):
        prefix = random.choice(ORG_PREFIXES)
        suffix = random.choice(ORG_SUFFIXES)
        org_name = f"{prefix} {suffix} {i+1}" if i > 50 else f"{prefix} {suffix}"
        domain = f"{prefix.lower()}{suffix.split()[0].lower()}.com"
        e = Entity(
            source_id=s1.id,
            name=org_name,
            type=EntityType.ORGANIZATION,
            aliases=[f"{prefix} Inc", f"{prefix} Corp"],
            confidence=1.0,
            properties={
                "domain": domain,
                "sector": "High-Tech & Intelligence",
                "city": random.choice(CITIES)
            }
        )
        entities.append(e)

    db.add_all(entities)
    db.commit()

    # Refetch saved entities
    saved_entities = db.query(Entity).all()
    persons = [e for e in saved_entities if e.type == EntityType.PERSON]
    orgs = [e for e in saved_entities if e.type == EntityType.ORGANIZATION]

    # 3. Generate 1200 Relationships
    print("Generating 1200 inter-entity edges...")
    relationships = []
    for i in range(1200):
        p = random.choice(persons)
        o = random.choice(orgs)
        rel_type = random.choice(RELATIONSHIP_TYPES)
        r = Relationship(
            source_id=s1.id,
            source_entity_id=p.id,
            target_entity_id=o.id,
            type=rel_type,
            weight=round(random.uniform(0.75, 1.0), 2),
            evidence_link=f"registry.csv#row={i+1}"
        )
        relationships.append(r)

    db.add_all(relationships)
    db.commit()

    # 4. Generate 200 Events
    print("Generating 200 chronological events...")
    events = []
    base_date = datetime(2023, 1, 1)
    categories = ["Corporate", "Security", "Technical", "Defense", "Partnership"]
    for i in range(200):
        p = random.choice(persons)
        ev_date = base_date + timedelta(days=random.randint(0, 500))
        cat = random.choice(categories)
        ev = Event(
            source_id=s2.id,
            title=f"{p.name} - {cat} Strategic Milestone #{i+1}",
            date=ev_date,
            category=cat,
            description=f"Strategic operational milestone involving {p.name} in {p.properties.get('city', 'Global')}.",
            entity_ids=[p.id]
        )
        events.append(ev)

    db.add_all(events)
    db.commit()

    # 5. Generate Candidate Merges
    print("Scoring entity resolution for initial candidates...")
    for target in persons[:10]:
        EntityResolver.run_resolution_for_entity(db, target)

    print(f"Database successfully seeded with {len(saved_entities)} Entities, {len(relationships)} Edges, and {len(events)} Events!")
    db.close()

if __name__ == "__main__":
    seed_database()
