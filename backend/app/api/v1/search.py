from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from backend.app.core.database import get_db
from backend.app.models.models import Entity, Event, Document, Source
from backend.app.schemas.schemas import SearchResponse, SearchResultCard

router = APIRouter()

@router.get("", response_model=SearchResponse)
def global_search(
    q: str = Query("", description="Search term"),
    type_filter: Optional[str] = Query(None, description="entity, event, or document"),
    source_id: Optional[str] = Query(None, description="Filter by source ID"),
    db: Session = Depends(get_db)
):
    results: List[SearchResultCard] = []
    facets = {
        "object_type": {"entity": 0, "event": 0, "document": 0},
        "source": {}
    }

    sources = {s.id: s.name for s in db.query(Source).all()}
    search_term = f"%{q.strip()}%" if q else "%"

    if not type_filter or type_filter == "entity":
        entity_query = db.query(Entity).filter(
            Entity.is_canonical == True,
            or_(
                Entity.name.ilike(search_term),
                Entity.type.ilike(search_term)
            )
        )
        if source_id:
            entity_query = entity_query.filter(Entity.source_id == source_id)

        entities = entity_query.all()
        facets["object_type"]["entity"] = len(entities)

        for ent in entities:
            src_name = sources.get(ent.source_id, "Unknown Source")
            facets["source"][src_name] = facets["source"].get(src_name, 0) + 1
            results.append(SearchResultCard(
                id=ent.id,
                object_type="entity",
                title=ent.name,
                subtitle=f"Type: {ent.type.value if hasattr(ent.type, 'value') else ent.type}",
                description=f"Aliases: {', '.join(ent.aliases or [])}" if ent.aliases else "No aliases recorded",
                source_name=src_name,
                confidence=ent.confidence,
                date=ent.created_at,
                tags=[ent.type.value if hasattr(ent.type, 'value') else ent.type],
                properties=ent.properties or {}
            ))

    if not type_filter or type_filter == "event":
        event_query = db.query(Event).filter(
            or_(
                Event.title.ilike(search_term),
                Event.category.ilike(search_term),
                Event.description.ilike(search_term)
            )
        )
        if source_id:
            event_query = event_query.filter(Event.source_id == source_id)

        events = event_query.all()
        facets["object_type"]["event"] = len(events)

        for ev in events:
            src_name = sources.get(ev.source_id, "Unknown Source")
            facets["source"][src_name] = facets["source"].get(src_name, 0) + 1
            results.append(SearchResultCard(
                id=ev.id,
                object_type="event",
                title=ev.title,
                subtitle=f"Category: {ev.category or 'General'}",
                description=ev.description or "No description available",
                source_name=src_name,
                confidence=1.0,
                date=ev.date or ev.created_at,
                tags=[ev.category] if ev.category else [],
                properties=ev.properties or {}
            ))

    if not type_filter or type_filter == "document":
        doc_query = db.query(Document).filter(
            or_(
                Document.title.ilike(search_term),
                Document.content.ilike(search_term)
            )
        )
        if source_id:
            doc_query = doc_query.filter(Document.source_id == source_id)

        docs = doc_query.all()
        facets["object_type"]["document"] = len(docs)

        for doc in docs:
            src_name = sources.get(doc.source_id, "Unknown Source")
            facets["source"][src_name] = facets["source"].get(src_name, 0) + 1
            results.append(SearchResultCard(
                id=doc.id,
                object_type="document",
                title=doc.title,
                subtitle=f"File Type: {doc.file_type or 'Unknown'}",
                description=(doc.content[:200] + "...") if doc.content and len(doc.content) > 200 else doc.content,
                source_name=src_name,
                confidence=1.0,
                date=doc.extraction_date,
                tags=[doc.file_type] if doc.file_type else [],
                properties=doc.metadata_json or {}
            ))

    return SearchResponse(
        query=q,
        total_results=len(results),
        results=results,
        facets=facets
    )
