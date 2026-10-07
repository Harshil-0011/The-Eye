export type EntityType = 'PERSON' | 'ORGANIZATION' | 'PRODUCT' | 'TOPIC' | 'LOCATION' | 'OTHER';

export interface Entity {
  id: string;
  source_id: string;
  name: string;
  type: EntityType;
  aliases: string[];
  confidence: number;
  is_canonical: boolean;
  canonical_id?: string;
  created_at: string;
  updated_at: string;
  properties: Record<string, any>;
}

export interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  confidence: number;
  aliases: string[];
  properties: Record<string, any>;
  source_id: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
  evidence?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SearchResultCard {
  id: string;
  object_type: 'entity' | 'event' | 'document';
  title: string;
  subtitle?: string;
  description?: string;
  source_name?: string;
  confidence: number;
  date?: string;
  tags: string[];
  properties: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  total_results: number;
  results: SearchResultCard[];
  facets: {
    object_type: Record<string, number>;
    source: Record<string, number>;
  };
}

export interface MergeRecord {
  id: string;
  target_entity_id: string;
  source_entity_id: string;
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'REVERTED';
  score: number;
  evidence: Record<string, any>;
  created_at: string;
  resolved_at?: string;
}

export interface Source {
  id: string;
  name: string;
  origin: string;
  license?: string;
  reliability_rating: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';
  created_at: string;
  last_refresh: string;
  record_count: number;
}

export interface Document {
  id: string;
  source_id: string;
  title: string;
  hash?: string;
  source_url?: string;
  content?: string;
  file_type?: string;
  extraction_date: string;
  metadata_json: Record<string, any>;
}

export interface EventItem {
  id: string;
  source_id: string;
  title: string;
  date?: string;
  category?: string;
  description?: string;
  entity_ids: string[];
  properties: Record<string, any>;
  created_at: string;
}
