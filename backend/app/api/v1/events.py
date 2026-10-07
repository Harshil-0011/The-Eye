from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models.models import Event, Entity, Source
from backend.app.schemas.schemas import EventResponse

router = APIRouter()

@router.get("", response_model=List[EventResponse])
def list_events(
    category: Optional[str] = Query(None),
    entity_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    if category and category != "ALL":
        query = query.filter(Event.category == category)

    events = query.order_by(Event.date.desc()).offset(skip).limit(limit).all()

    if entity_id:
        events = [e for e in events if entity_id in (e.entity_ids or [])]

    return events

@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: str, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    return ev
