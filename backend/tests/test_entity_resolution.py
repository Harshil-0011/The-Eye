import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.core.database import Base
from backend.app.models.models import Source, Entity, EntityType, MergeRecord, MergeStatus
from backend.app.services.entity_resolution import EntityResolver

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

def test_calculate_similarity_exact_and_fuzzy():
    e1 = Entity(name="Alexander Smith", type=EntityType.PERSON)
    e2 = Entity(name="Alex Smith", type=EntityType.PERSON, aliases=["Alexander Smith"])

    score, evidence = EntityResolver.calculate_similarity(e1, e2)
    assert score > 0.8
    assert "name_jaro_winkler" in evidence

def test_unmerge_reverses_merge(db_session):
    src = Source(name="Test Source", origin="file.csv")
    db_session.add(src)
    db_session.commit()

    e1 = Entity(source_id=src.id, name="John Jonathan Doe", type=EntityType.PERSON)
    e2 = Entity(source_id=src.id, name="John Jonathan Doe", type=EntityType.PERSON)
    db_session.add_all([e1, e2])
    db_session.commit()

    proposals = EntityResolver.run_resolution_for_entity(db_session, e1)
    assert len(proposals) == 1
    merge_rec = proposals[0]

    success = EntityResolver.unmerge(db_session, merge_rec.id)
    assert success is True

    db_session.refresh(e2)
    assert e2.is_canonical is True
    assert merge_rec.status == MergeStatus.REVERTED
