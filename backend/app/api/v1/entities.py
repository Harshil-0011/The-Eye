from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.models.models import Entity, Relationship
from backend.app.schemas.schemas import EntityResponse

router = APIRouter()

@router.get("", response_model=List[EntityResponse])
def list_entities(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    canonical_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    query = db.query(Entity)
    if canonical_only:
        query = query.filter(Entity.is_canonical == True)
    return query.offset(skip).limit(limit).all()

@router.get("/{entity_id}", response_model=EntityResponse)
def get_entity(entity_id: str, db: Session = Depends(get_db)):
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    return entity

@router.delete("/{entity_id}")
def delete_entity_with_derived_purge(entity_id: str, db: Session = Depends(get_db)):
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")

    db.query(Relationship).filter(
        (Relationship.source_entity_id == entity_id) | (Relationship.target_entity_id == entity_id)
    ).delete(synchronize_session=False)

    db.delete(entity)
    db.commit()
    return {"message": f"Entity {entity_id} and all derived relationships purged."}
