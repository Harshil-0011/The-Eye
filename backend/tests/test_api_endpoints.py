from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.main import app
from backend.app.core.database import Base, get_db
from backend.app.models.models import Source, Entity, Relationship, EntityType

engine = create_engine("sqlite:///./test_suite.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    src = Source(name="API Suite Source", origin="suite_test.csv")
    db.add(src)
    db.commit()

    e1 = Entity(id="suite-1", source_id=src.id, name="Sarah Connor", type=EntityType.PERSON)
    e2 = Entity(id="suite-2", source_id=src.id, name="Cyberdyne", type=EntityType.ORGANIZATION)
    db.add_all([e1, e2])
    db.commit()

    rel = Relationship(id="suite-rel-1", source_id=src.id, source_entity_id="suite-1", target_entity_id="suite-2", type="INVESTIGATES")
    db.add(rel)
    db.commit()
    db.close()

    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_health():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_search():
    res = client.get("/api/v1/search?q=Sarah")
    assert res.status_code == 200
    assert res.json()["total_results"] == 1

def test_graph():
    res = client.get("/api/v1/graph")
    assert res.status_code == 200
    assert len(res.json()["nodes"]) == 2
