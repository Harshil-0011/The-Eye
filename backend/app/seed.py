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

FIRST_NAMES = ["Alexander", "Elena", "Marcus", "Hiroshi", "Rachel", "Viktor", "Kendra", "Arthur", "Sarah", "John", "David", "Sophia", "Lucas", "Aria", "Julian", "Claire", "Maximilian", "Sienna", "Gabriel", "Amara", "Dmitri", "Yuki", "Carlos", "Fatima", "Chen", "Astra", "Balthazar", "Evelyn", "Gideon", "Nadia"]
LAST_NAMES = ["Vance", "Rostova", "Wright", "Sato", "Tyrell", "Connor", "Shaw", "Pendelton", "Mercer", "Koval", "Davenport", "Lindqvist", "Zheng", "Al-Mansoor", "Moreau", "Vanguard", "Sterling", "Thorne", "Chen", "Dubois", "Volkov", "Tanaka", "Mendoza", "Hassan", "Zhao", "Vane", "Blackwood", "Vesper", "Sovereign", "Kramer"]
ORG_PREFIXES = ["Apex", "Cyberdyne", "Nexus", "Orbital", "Vanguard", "Aegis", "Quantum", "Hyperion", "Aether", "Sovereign", "Omni", "Helios", "Titan", "Spectra", "Zenith", "Chronos", "Atlas", "Aero", "Prometheus", "Valence"]
ORG_SUFFIXES = ["Systems", "Cybernetics", "AI Corporation", "Technologies", "Defence", "Dynamics", "Labs", "Group", "Solutions", "Networks", "Industries", "Holdings", "Capital", "Security", "Intelligence"]
ROLES = ["Chief Technology Officer", "Lead Research Scientist", "Executive VP", "Managing Director", "Director of Robotics", "Founder & CEO", "Head of Cryptography", "Aerospace Division Lead", "Chief Security Officer", "Financial Intelligence Director"]
CITIES = [
  {"name": "San Francisco", "lat": 37.7749, "lng": -122.4194},
  {"name": "Austin", "lat": 30.2672, "lng": -97.7431},
  {"name": "Seattle", "lat": 47.6062, "lng": -122.3321},
  {"name": "Denver", "lat": 39.7392, "lng": -104.9903},
  {"name": "London", "lat": 51.5074, "lng": -0.1278},
  {"name": "Zurich", "lat": 47.3769, "lng": 8.5417},
  {"name": "Tokyo", "lat": 35.6762, "lng": 139.6503},
  {"name": "Berlin", "lat": 52.5200, "lng": 13.4050},
  {"name": "Singapore", "lat": 1.3521, "lng": 103.8198},
  {"name": "Toronto", "lat": 43.6532, "lng": -79.3832}
]

RELATIONSHIP_TYPES = ["EMPLOYED_BY", "MEMBER_OF", "PARTNERS_WITH", "RESEARCH_COLLABORATION", "FOUNDED", "LEADS_PROJECT", "SECURITY_AUDIT", "WIRE_TRANSFER", "SHARED_INFRASTRUCTURE"]

def seed_database():
    print("Initializing Palantir-scale database schema...")
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

    print("Generating 5,000+ Palantir Foundry-scale intelligence records...")

    s1 = Source(name="Palantir Global Registry 2024", origin="global_registry.csv", reliability_rating=SourceReliability.HIGH, record_count=3500)
    s2 = Source(name="Palantir Operational Events Feed", origin="events_feed.json", reliability_rating=SourceReliability.HIGH, record_count=1000)
    s3 = Source(name="Financial Ledger & Wire Transfers", origin="wire_transfers.xlsx", reliability_rating=SourceReliability.HIGH, record_count=500)
    db.add_all([s1, s2, s3])
    db.commit()

    entities = []

    # 1. Generate 3500 Persons
    for i in range(3500):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        full_name = f"{first} {last}" if i > 50 else f"{first} {last} {i+1}"
        domain = f"{last.lower()}{random.randint(10,99)}.io"
        city_info = random.choice(CITIES)
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
                "city": city_info["name"],
                "lat": city_info["lat"] + random.uniform(-0.05, 0.05),
                "lng": city_info["lng"] + random.uniform(-0.05, 0.05),
                "risk_rating": random.choice(["LOW", "GUARDED", "ELEVATED", "HIGH", "SEVERE"]),
                "tax_id": f"US-{random.randint(1000000, 9999999)}"
            }
        )
        entities.append(e)

    # 2. Generate 1500 Organizations
    for i in range(1500):
        prefix = random.choice(ORG_PREFIXES)
        suffix = random.choice(ORG_SUFFIXES)
        org_name = f"{prefix} {suffix} {i+1}" if i > 100 else f"{prefix} {suffix}"
        domain = f"{prefix.lower()}{suffix.split()[0].lower()}{random.randint(1,99)}.com"
        city_info = random.choice(CITIES)
        e = Entity(
            source_id=s1.id,
            name=org_name,
            type=EntityType.ORGANIZATION,
            aliases=[f"{prefix} Inc", f"{prefix} Corp"],
            confidence=1.0,
            properties={
                "domain": domain,
                "sector": "Defense & Foundry Operations",
                "city": city_info["name"],
                "lat": city_info["lat"],
                "lng": city_info["lng"],
                "risk_rating": random.choice(["LOW", "GUARDED", "ELEVATED", "HIGH"])
            }
        )
        entities.append(e)

    db.add_all(entities)
    db.commit()

    saved_entities = db.query(Entity).all()
    persons = [e for e in saved_entities if e.type == EntityType.PERSON]
    orgs = [e for e in saved_entities if e.type == EntityType.ORGANIZATION]

    # 3. Generate 5000 Relationships
    print("Generating 5000 inter-entity links...")
    relationships = []
    for i in range(5000):
        p = random.choice(persons)
        o = random.choice(orgs)
        rel_type = random.choice(RELATIONSHIP_TYPES)
        r = Relationship(
            source_id=s1.id,
            source_entity_id=p.id,
            target_entity_id=o.id,
            type=rel_type,
            weight=round(random.uniform(0.75, 1.0), 2),
            evidence_link=f"foundry_ontology.csv#row={i+1}"
        )
        relationships.append(r)

    db.add_all(relationships)
    db.commit()

    # 4. Generate 2000 Events
    print("Generating 2000 operational events...")
    events = []
    base_date = datetime(2023, 1, 1)
    categories = ["Corporate", "Security", "Technical", "Defense", "Partnership", "Financial", "Geospatial Alert"]
    for i in range(2000):
        p = random.choice(persons)
        ev_date = base_date + timedelta(days=random.randint(0, 600))
        cat = random.choice(categories)
        ev = Event(
            source_id=s2.id,
            title=f"{p.name} - {cat} Strategic Operational Event #{i+1}",
            date=ev_date,
            category=cat,
            description=f"Strategic Palantir operational milestone involving {p.name} in {p.properties.get('city', 'Global')}.",
            entity_ids=[p.id]
        )
        events.append(ev)

    db.add_all(events)
    db.commit()

    # 5. Generate Candidate Merges
    print("Scoring entity resolution for Foundry candidates...")
    for target in persons[:15]:
        EntityResolver.run_resolution_for_entity(db, target)

    print(f"Palantir-scale database successfully seeded with {len(saved_entities)} Entities, {len(relationships)} Edges, and {len(events)} Events!")
    db.close()

if __name__ == "__main__":
    seed_database()
