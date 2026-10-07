from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from backend.app.core.database import get_db
from backend.app.models.models import Entity, Relationship
from backend.app.schemas.schemas import GraphData, GraphNode, GraphEdge

router = APIRouter()

@router.get("", response_model=GraphData)
def get_graph_data(
    rel_type: Optional[str] = Query(None, description="Filter edges by relationship type"),
    limit: int = Query(100, description="Max nodes to fetch"),
    db: Session = Depends(get_db)
):
    entities = db.query(Entity).filter(Entity.is_canonical == True).limit(limit).all()
    entity_ids = {e.id for e in entities}

    rel_query = db.query(Relationship).filter(
        Relationship.source_entity_id.in_(entity_ids),
        Relationship.target_entity_id.in_(entity_ids)
    )
    if rel_type:
        rel_query = rel_query.filter(Relationship.type == rel_type)

    relationships = rel_query.all()

    nodes = [
        GraphNode(
            id=e.id,
            label=e.name,
            type=e.type.value if hasattr(e.type, 'value') else str(e.type),
            confidence=e.confidence,
            aliases=e.aliases or [],
            properties=e.properties or {},
            source_id=e.source_id
        ) for e in entities
    ]

    edges = [
        GraphEdge(
            id=r.id,
            source=r.source_entity_id,
            target=r.target_entity_id,
            type=r.type,
            weight=r.weight,
            evidence=r.evidence_link
        ) for r in relationships
    ]

    return GraphData(nodes=nodes, edges=edges)

@router.get("/neighbors/{entity_id}", response_model=GraphData)
def get_entity_neighbors(
    entity_id: str,
    depth: int = Query(1, ge=1, le=3),
    db: Session = Depends(get_db)
):
    visited_entities = set()
    frontier = {entity_id}
    collected_rels = []

    for _ in range(depth):
        if not frontier:
            break

        visited_entities.update(frontier)

        rels = db.query(Relationship).filter(
            (Relationship.source_entity_id.in_(frontier)) |
            (Relationship.target_entity_id.in_(frontier))
        ).all()

        next_frontier = set()
        for r in rels:
            collected_rels.append(r)
            if r.source_entity_id not in visited_entities:
                next_frontier.add(r.source_entity_id)
            if r.target_entity_id not in visited_entities:
                next_frontier.add(r.target_entity_id)

        frontier = next_frontier

    visited_entities.update(frontier)

    entities = db.query(Entity).filter(Entity.id.in_(visited_entities)).all()
    unique_rels_map = {r.id: r for r in collected_rels}

    nodes = [
        GraphNode(
            id=e.id,
            label=e.name,
            type=e.type.value if hasattr(e.type, 'value') else str(e.type),
            confidence=e.confidence,
            aliases=e.aliases or [],
            properties=e.properties or {},
            source_id=e.source_id
        ) for e in entities
    ]

    edges = [
        GraphEdge(
            id=r.id,
            source=r.source_entity_id,
            target=r.target_entity_id,
            type=r.type,
            weight=r.weight,
            evidence=r.evidence_link
        ) for r in unique_rels_map.values()
    ]

    return GraphData(nodes=nodes, edges=edges)
