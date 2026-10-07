from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.models import Entity, Relationship, Source, Event

router = APIRouter()

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    total_entities = db.query(Entity).filter(Entity.is_canonical == True).count()
    total_relationships = db.query(Relationship).count()
    total_sources = db.query(Source).count()
    total_events = db.query(Event).count()

    entities = db.query(Entity).filter(Entity.is_canonical == True).all()
    type_counts = {}
    for e in entities:
        t = e.type.value if hasattr(e.type, 'value') else str(e.type)
        type_counts[t] = type_counts.get(t, 0) + 1

    return {
        "total_entities": total_entities,
        "total_relationships": total_relationships,
        "total_sources": total_sources,
        "total_events": total_events,
        "entity_types": type_counts
    }
