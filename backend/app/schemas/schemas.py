from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from backend.app.models.models import EntityType, SourceReliability, MergeStatus

class SourceBase(BaseModel):
    name: str
    origin: str
    license: Optional[str] = None
    reliability_rating: SourceReliability = SourceReliability.MEDIUM

class SourceCreate(SourceBase):
    pass

class SourceResponse(SourceBase):
    id: str
    created_at: datetime
    last_refresh: datetime
    record_count: int

    model_config = ConfigDict(from_attributes=True)

class EntityBase(BaseModel):
    name: str
    type: EntityType = EntityType.PERSON
    aliases: List[str] = []
    confidence: float = 1.0
    properties: Dict[str, Any] = {}

class EntityCreate(EntityBase):
    source_id: str

class EntityResponse(EntityBase):
    id: str
    source_id: str
    is_canonical: bool
    canonical_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RelationshipBase(BaseModel):
    source_entity_id: str
    target_entity_id: str
    type: str
    weight: float = 1.0
    evidence_link: Optional[str] = None
    properties: Dict[str, Any] = {}

class RelationshipCreate(RelationshipBase):
    source_id: str

class RelationshipResponse(RelationshipBase):
    id: str
    source_id: str
    first_seen: datetime

    model_config = ConfigDict(from_attributes=True)

class EventBase(BaseModel):
    title: str
    date: Optional[datetime] = None
    category: Optional[str] = None
    description: Optional[str] = None
    entity_ids: List[str] = []
    properties: Dict[str, Any] = {}

class EventCreate(EventBase):
    source_id: str

class EventResponse(EventBase):
    id: str
    source_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DocumentResponse(BaseModel):
    id: str
    source_id: str
    title: str
    hash: Optional[str] = None
    source_url: Optional[str] = None
    content: Optional[str] = None
    file_type: Optional[str] = None
    extraction_date: datetime
    metadata_json: Dict[str, Any] = {}

    model_config = ConfigDict(from_attributes=True)

class MergeRecordResponse(BaseModel):
    id: str
    target_entity_id: str
    source_entity_id: str
    status: MergeStatus
    score: float
    evidence: Dict[str, Any]
    created_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    confidence: float
    aliases: List[str]
    properties: Dict[str, Any]
    source_id: str

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str
    weight: float
    evidence: Optional[str] = None

class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class SearchResultCard(BaseModel):
    id: str
    object_type: str
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    source_name: Optional[str] = None
    confidence: float = 1.0
    date: Optional[datetime] = None
    tags: List[str] = []
    properties: Dict[str, Any] = {}

class SearchResponse(BaseModel):
    query: str
    total_results: int
    results: List[SearchResultCard]
    facets: Dict[str, Dict[str, int]]
