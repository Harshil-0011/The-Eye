from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models.models import MergeRecord, MergeStatus
from backend.app.schemas.schemas import MergeRecordResponse
from backend.app.services.entity_resolution import EntityResolver

router = APIRouter()

@router.get("", response_model=List[MergeRecordResponse])
def list_review_queue(
    status: Optional[str] = Query("PROPOSED"),
    db: Session = Depends(get_db)
):
    query = db.query(MergeRecord)
    if status:
        query = query.filter(MergeRecord.status == status)
    return query.order_by(MergeRecord.score.desc()).all()

@router.post("/{merge_id}/accept")
def accept_merge(merge_id: str, db: Session = Depends(get_db)):
    merge_rec = db.query(MergeRecord).filter(MergeRecord.id == merge_id).first()
    if not merge_rec:
        raise HTTPException(status_code=404, detail="Merge proposal not found")

    EntityResolver.execute_merge(db, merge_rec.target_entity_id, merge_rec.source_entity_id)
    merge_rec.status = MergeStatus.APPROVED
    db.commit()

    return {"message": "Merge accepted successfully", "merge_id": merge_id}

@router.post("/{merge_id}/reject")
def reject_merge(merge_id: str, db: Session = Depends(get_db)):
    merge_rec = db.query(MergeRecord).filter(MergeRecord.id == merge_id).first()
    if not merge_rec:
        raise HTTPException(status_code=404, detail="Merge proposal not found")

    merge_rec.status = MergeStatus.REJECTED
    db.commit()

    return {"message": "Merge rejected successfully", "merge_id": merge_id}

@router.post("/{merge_id}/unmerge")
def unmerge_record(merge_id: str, db: Session = Depends(get_db)):
    success = EntityResolver.unmerge(db, merge_id)
    if not success:
        raise HTTPException(status_code=400, detail="Could not reverse merge")

    return {"message": "Merge successfully reverted", "merge_id": merge_id}
