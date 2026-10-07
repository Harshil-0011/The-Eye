import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.core.database import Base
from backend.app.models.models import (
    Source, Entity, Relationship, Event, Document, MergeRecord, EntityType, SourceReliability
)

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_create_models(db_session):
    source = Source(
        name="Test Feed",
        origin="test_data.csv",
        license="MIT",
        reliability_rating=SourceReliability.HIGH
    )
    db_session.add(source)
    db_session.commit()
    db_session.refresh(source)

    assert source.id is not None

    entity1 = Entity(
        source_id=source.id,
        name="John Doe",
        type=EntityType.PERSON,
        aliases=["J. Doe"]
    )
    entity2 = Entity(
        source_id=source.id,
        name="Acme Corp",
        type=EntityType.ORGANIZATION
    )
    db_session.add_all([entity1, entity2])
    db_session.commit()

    rel = Relationship(
        source_id=source.id,
        source_entity_id=entity1.id,
        target_entity_id=entity2.id,
        type="EMPLOYED_BY"
    )
    db_session.add(rel)
    db_session.commit()

    assert rel.id is not None
    assert rel.source_entity.name == "John Doe"
    assert rel.target_entity.name == "Acme Corp"
