import sys
import os
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.core.database import Base, engine, SessionLocal
from backend.app.models.models import (
    Source, Entity, Relationship, Event, Document, MergeRecord,
    EntityType, SourceReliability
)
from backend.app.services.entity_resolution import EntityResolver

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    db.query(MergeRecord).delete()
    db.query(Relationship).delete()
    db.query(Event).delete()
    db.query(Document).delete()
    db.query(Entity).delete()
    db.query(Source).delete()
    db.commit()

    print("Creating Sources...")
    s1 = Source(
        name="Corporate Registry 2024",
        origin="corporate_registry.csv",
        license="Public Domain",
        reliability_rating=SourceReliability.HIGH,
        record_count=12
    )
    s2 = Source(
        name="Tech Leak Intelligence Digest",
        origin="tech_leak_pdf.pdf",
        license="Restricted Analysis",
        reliability_rating=SourceReliability.MEDIUM,
        record_count=5
    )
    db.add_all([s1, s2])
    db.commit()

    print("Creating Canonical Entities...")
    e1 = Entity(
        source_id=s1.id,
        name="Alexander Vance",
        type=EntityType.PERSON,
        aliases=["Alex Vance", "A. Vance"],
        confidence=0.98,
        properties={"title": "Chief Technology Officer", "email": "alex.vance@cyberdyne.io"}
    )
    e2 = Entity(
        source_id=s1.id,
        name="Cyberdyne Systems",
        type=EntityType.ORGANIZATION,
        aliases=["Cyberdyne Inc"],
        confidence=1.0,
        properties={"domain": "cyberdyne.io", "sector": "Artificial Intelligence"}
    )
    e3 = Entity(
        source_id=s1.id,
        name="Dr. Sarah Connor",
        type=EntityType.PERSON,
        aliases=["Sarah Connor"],
        confidence=0.95,
        properties={"role": "Lead Researcher", "field": "Robotics"}
    )
    e4 = Entity(
        source_id=s2.id,
        name="A. Vance",
        type=EntityType.PERSON,
        aliases=["Alex Vance"],
        confidence=0.85,
        properties={"email": "alex.vance@cyberdyne.io"}
    )
    e5 = Entity(
        source_id=s2.id,
        name="Project Titan",
        type=EntityType.PRODUCT,
        aliases=["Titan AI"],
        confidence=0.90,
        properties={"status": "Active Development"}
    )
    db.add_all([e1, e2, e3, e4, e5])
    db.commit()

    print("Creating Relationships...")
    r1 = Relationship(
        source_id=s1.id,
        source_entity_id=e1.id,
        target_entity_id=e2.id,
        type="EMPLOYED_BY",
        weight=1.0,
        evidence_link="corporate_registry.csv#line=14"
    )
    r2 = Relationship(
        source_id=s1.id,
        source_entity_id=e3.id,
        target_entity_id=e2.id,
        type="MEMBER_OF",
        weight=0.9,
        evidence_link="corporate_registry.csv#line=22"
    )
    r3 = Relationship(
        source_id=s2.id,
        source_entity_id=e1.id,
        target_entity_id=e5.id,
        type="LEADS_PROJECT",
        weight=1.0,
        evidence_link="tech_leak_pdf.pdf#page=3"
    )
    db.add_all([r1, r2, r3])
    db.commit()

    print("Creating Events & Documents...")
    ev1 = Event(
        source_id=s1.id,
        title="Cyberdyne Systems Q1 Technology Keynote",
        date=datetime(2024, 3, 15),
        category="Corporate",
        description="Public announcement of next-generation autonomous software framework.",
        entity_ids=[e1.id, e2.id]
    )
    doc1 = Document(
        source_id=s2.id,
        title="Tech Leak Intelligence Briefing #409",
        file_type="PDF",
        content="Confidential report indicating that Alexander Vance is leading Project Titan under Cyberdyne Systems supervision.",
        source_url="http://internal-repo.local/briefing-409.pdf"
    )
    db.add_all([ev1, doc1])
    db.commit()

    print("Running Entity Resolution Engine for candidates...")
    EntityResolver.run_resolution_for_entity(db, e1)

    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
