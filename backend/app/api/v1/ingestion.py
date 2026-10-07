from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from backend.app.core.database import get_db
from backend.app.models.models import Source, Entity, Event, Document, SourceReliability
from backend.app.services.extractors import FileExtractor, SchemaMapper
from backend.app.services.entity_resolution import EntityResolver
from backend.app.schemas.schemas import SourceResponse

router = APIRouter()

@router.get("/sources", response_model=List[SourceResponse])
def list_sources(db: Session = Depends(get_db)):
    return db.query(Source).all()

@router.post("/preview")
async def preview_file(file: UploadFile = File(...)):
    content = await file.read()
    filename = file.filename or "unknown"

    if filename.endswith(".csv"):
        records = FileExtractor.extract_csv(content)
    elif filename.endswith(".json"):
        records = FileExtractor.extract_json(content)
    elif filename.endswith(".xlsx") or filename.endswith(".xls"):
        records = FileExtractor.extract_excel(content)
    elif filename.endswith(".html") or filename.endswith(".htm"):
        extracted = FileExtractor.extract_html(content)
        records = [{"title": extracted["title"], "content": extracted["text"]}]
    elif filename.endswith(".pdf"):
        extracted = FileExtractor.extract_pdf(content)
        records = [{"title": filename, "content": extracted["text"]}]
    else:
        records = [{"raw": content.decode('utf-8', errors='ignore')}]

    inferred_mapping = SchemaMapper.infer_column_types(records[:10])
    return {
        "filename": filename,
        "record_count": len(records),
        "sample": records[:5],
        "inferred_mapping": inferred_mapping
    }

@router.post("/upload")
async def process_file_ingestion(
    file: UploadFile = File(...),
    source_name: str = Form(...),
    reliability: str = Form("MEDIUM"),
    mapping_json: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    content = await file.read()
    filename = file.filename or "uploaded_file"

    source = Source(
        name=source_name,
        origin=filename,
        reliability_rating=SourceReliability(reliability) if reliability in SourceReliability.__members__ else SourceReliability.MEDIUM
    )
    db.add(source)
    db.commit()
    db.refresh(source)

    mapping = json.loads(mapping_json) if mapping_json else {}

    records = []
    if filename.endswith(".csv"):
        records = FileExtractor.extract_csv(content)
    elif filename.endswith(".json"):
        records = FileExtractor.extract_json(content)
    elif filename.endswith(".xlsx") or filename.endswith(".xls"):
        records = FileExtractor.extract_excel(content)
    elif filename.endswith(".html") or filename.endswith(".htm"):
        extracted = FileExtractor.extract_html(content)
        doc = Document(source_id=source.id, title=extracted["title"], content=extracted["text"], file_type="HTML")
        db.add(doc)
    elif filename.endswith(".pdf"):
        extracted = FileExtractor.extract_pdf(content)
        doc = Document(source_id=source.id, title=filename, content=extracted["text"], file_type="PDF")
        db.add(doc)

    entities_created = 0
    events_created = 0

    if records:
        if not mapping:
            mapping = SchemaMapper.infer_column_types(records)

        for rec in records:
            ents, evs = SchemaMapper.map_record_to_canonical(rec, mapping)
            for e_data in ents:
                ent = Entity(
                    source_id=source.id,
                    name=e_data["name"],
                    type=e_data["type"],
                    aliases=e_data.get("aliases", []),
                    properties=e_data.get("properties", {})
                )
                db.add(ent)
                db.flush()
                entities_created += 1
                EntityResolver.run_resolution_for_entity(db, ent)

            for ev_data in evs:
                ev = Event(
                    source_id=source.id,
                    title=ev_data["title"],
                    category=ev_data.get("category"),
                    properties=ev_data.get("properties", {})
                )
                db.add(ev)
                events_created += 1

    source.record_count = len(records) or 1
    db.commit()

    return {
        "status": "success",
        "source_id": source.id,
        "records_processed": source.record_count,
        "entities_created": entities_created,
        "events_created": events_created
    }
