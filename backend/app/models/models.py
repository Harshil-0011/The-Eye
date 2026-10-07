import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Float, DateTime, ForeignKey, Table, Enum, JSON, Integer, Boolean
)
from sqlalchemy.orm import relationship
import enum
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class EntityType(str, enum.Enum):
    PERSON = "PERSON"
    ORGANIZATION = "ORGANIZATION"
    PRODUCT = "PRODUCT"
    TOPIC = "TOPIC"
    LOCATION = "LOCATION"
    OTHER = "OTHER"

class SourceReliability(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    UNVERIFIED = "UNVERIFIED"

class MergeStatus(str, enum.Enum):
    PROPOSED = "PROPOSED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    REVERTED = "REVERTED"

class Source(Base):
    __tablename__ = "sources"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    license = Column(String, nullable=True)
    reliability_rating = Column(Enum(SourceReliability), default=SourceReliability.MEDIUM)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_refresh = Column(DateTime, default=datetime.utcnow)
    record_count = Column(Integer, default=0)

    entities = relationship("Entity", back_populates="source", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="source", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="source", cascade="all, delete-orphan")
    relationships = relationship("Relationship", back_populates="source", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    source_id = Column(String, ForeignKey("sources.id"), nullable=False)
    title = Column(String, nullable=False)
    hash = Column(String, nullable=True, index=True)
    source_url = Column(String, nullable=True)
    content = Column(Text, nullable=True)
    file_type = Column(String, nullable=True)
    extraction_date = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(JSON, default=dict)

    source = relationship("Source", back_populates="documents")

class Entity(Base):
    __tablename__ = "entities"

    id = Column(String, primary_key=True, default=generate_uuid)
    source_id = Column(String, ForeignKey("sources.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    type = Column(Enum(EntityType), default=EntityType.PERSON, index=True)
    aliases = Column(JSON, default=list)
    confidence = Column(Float, default=1.0)
    canonical_id = Column(String, nullable=True, index=True)
    is_canonical = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    properties = Column(JSON, default=dict)

    source = relationship("Source", back_populates="entities")

    outgoing_relationships = relationship("Relationship", foreign_keys="Relationship.source_entity_id", back_populates="source_entity", cascade="all, delete-orphan")
    incoming_relationships = relationship("Relationship", foreign_keys="Relationship.target_entity_id", back_populates="target_entity", cascade="all, delete-orphan")

class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(String, primary_key=True, default=generate_uuid)
    source_id = Column(String, ForeignKey("sources.id"), nullable=False)
    source_entity_id = Column(String, ForeignKey("entities.id"), nullable=False, index=True)
    target_entity_id = Column(String, ForeignKey("entities.id"), nullable=False, index=True)
    type = Column(String, nullable=False, index=True)
    weight = Column(Float, default=1.0)
    first_seen = Column(DateTime, default=datetime.utcnow)
    evidence_link = Column(String, nullable=True)
    properties = Column(JSON, default=dict)

    source = relationship("Source", back_populates="relationships")
    source_entity = relationship("Entity", foreign_keys=[source_entity_id], back_populates="outgoing_relationships")
    target_entity = relationship("Entity", foreign_keys=[target_entity_id], back_populates="incoming_relationships")

class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=generate_uuid)
    source_id = Column(String, ForeignKey("sources.id"), nullable=False)
    title = Column(String, nullable=False)
    date = Column(DateTime, nullable=True, index=True)
    category = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    entity_ids = Column(JSON, default=list)
    properties = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    source = relationship("Source", back_populates="events")

class MergeRecord(Base):
    __tablename__ = "merge_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    target_entity_id = Column(String, ForeignKey("entities.id"), nullable=False)
    source_entity_id = Column(String, ForeignKey("entities.id"), nullable=False)
    status = Column(Enum(MergeStatus), default=MergeStatus.PROPOSED)
    score = Column(Float, nullable=False)
    evidence = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class IngestionJob(Base):
    __tablename__ = "ingestion_jobs"

    id = Column(String, primary_key=True, default=generate_uuid)
    source_name = Column(String, nullable=False)
    source_type = Column(String, nullable=False)
    status = Column(String, default="PENDING")
    records_processed = Column(Integer, default=0)
    logs = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
