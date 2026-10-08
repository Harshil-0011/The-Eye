import { GraphData, SearchResponse, Entity, MergeRecord, Source, Document, EventItem } from '../types';

const API_BASE = '/api/v1';

// Static Fallback Data for GitHub Pages & Offline Demos
const FALLBACK_GRAPH: GraphData = {
  nodes: [
    { id: 'ent-1', label: 'Alexander Vance', type: 'PERSON', confidence: 0.98, aliases: ['Alex Vance', 'A. Vance'], properties: { title: 'Chief Technology Officer', email: 'alex.vance@cyberdyne.io' }, source_id: 'src-1' },
    { id: 'ent-2', label: 'Cyberdyne Systems', type: 'ORGANIZATION', confidence: 1.0, aliases: ['Cyberdyne Inc'], properties: { domain: 'cyberdyne.io', sector: 'Artificial Intelligence' }, source_id: 'src-1' },
    { id: 'ent-3', label: 'Dr. Sarah Connor', type: 'PERSON', confidence: 0.95, aliases: ['Sarah Connor'], properties: { role: 'Lead Robotics Researcher' }, source_id: 'src-1' },
    { id: 'ent-4', label: 'Apex Cybernetics', type: 'ORGANIZATION', confidence: 0.92, aliases: ['Apex Cyber'], properties: { domain: 'apexcyber.com', city: 'Austin' }, source_id: 'src-2' },
    { id: 'ent-5', label: 'Elena Rostova', type: 'PERSON', confidence: 0.88, aliases: ['E. Rostova'], properties: { title: 'Executive Vice President' }, source_id: 'src-2' },
  ],
  edges: [
    { id: 'rel-1', source: 'ent-1', target: 'ent-2', type: 'EMPLOYED_BY', weight: 1.0, evidence: 'corporate_registry.csv#line=14' },
    { id: 'rel-2', source: 'ent-3', target: 'ent-2', type: 'MEMBER_OF', weight: 0.9, evidence: 'corporate_registry.csv#line=22' },
    { id: 'rel-3', source: 'ent-5', target: 'ent-4', type: 'EMPLOYED_BY', weight: 1.0, evidence: 'companies.csv#line=5' },
    { id: 'rel-4', source: 'ent-2', target: 'ent-4', type: 'PARTNERS_WITH', weight: 0.85, evidence: 'briefing.html#p=2' },
  ]
};

const FALLBACK_ENTITIES: Entity[] = [
  { id: 'ent-1', source_id: 'src-1', name: 'Alexander Vance', type: 'PERSON', aliases: ['Alex Vance', 'A. Vance'], confidence: 0.98, is_canonical: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), properties: { title: 'Chief Technology Officer', email: 'alex.vance@cyberdyne.io' } },
  { id: 'ent-2', source_id: 'src-1', name: 'Cyberdyne Systems', type: 'ORGANIZATION', aliases: ['Cyberdyne Inc'], confidence: 1.0, is_canonical: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), properties: { domain: 'cyberdyne.io', sector: 'Artificial Intelligence' } },
  { id: 'ent-3', source_id: 'src-1', name: 'Dr. Sarah Connor', type: 'PERSON', aliases: ['Sarah Connor'], confidence: 0.95, is_canonical: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), properties: { role: 'Lead Robotics Researcher' } },
  { id: 'ent-4', source_id: 'src-2', name: 'Apex Cybernetics', type: 'ORGANIZATION', aliases: ['Apex Cyber'], confidence: 0.92, is_canonical: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), properties: { domain: 'apexcyber.com', city: 'Austin' } },
  { id: 'ent-5', source_id: 'src-2', name: 'Elena Rostova', type: 'PERSON', aliases: ['E. Rostova'], confidence: 0.88, is_canonical: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), properties: { title: 'Executive Vice President' } },
];

const FALLBACK_EVENTS: EventItem[] = [
  { id: 'ev-1', source_id: 'src-1', title: 'Cyberdyne Autonomous AI Framework Unveiling', date: '2024-03-15T00:00:00Z', category: 'Corporate', description: 'Public demonstration of next-gen neural network model led by Alexander Vance.', entity_ids: ['ent-1', 'ent-2'], properties: {}, created_at: new Date().toISOString() },
  { id: 'ev-2', source_id: 'src-2', title: 'Apex Cybernetics Strategic Defense Partnership', date: '2024-04-10T00:00:00Z', category: 'Partnership', description: 'Multi-year defense technology contract signed by Elena Rostova.', entity_ids: ['ent-4', 'ent-5'], properties: {}, created_at: new Date().toISOString() },
  { id: 'ev-3', source_id: 'src-1', title: 'Titan AI Joint Technical Summit', date: '2024-05-22T00:00:00Z', category: 'Technical', description: 'Joint summit between Cyberdyne and Apex technical committees.', entity_ids: ['ent-1', 'ent-4'], properties: {}, created_at: new Date().toISOString() },
];

const FALLBACK_SOURCES: Source[] = [
  { id: 'src-1', name: 'Corporate Registry 2024', origin: 'companies.csv', license: 'Public Domain', reliability_rating: 'HIGH', created_at: new Date().toISOString(), last_refresh: new Date().toISOString(), record_count: 7 },
  { id: 'src-2', name: 'Global Tech Events Feed', origin: 'events.json', license: 'Open Intelligence', reliability_rating: 'HIGH', created_at: new Date().toISOString(), last_refresh: new Date().toISOString(), record_count: 3 },
  { id: 'src-3', name: 'Global Tech Intelligence Briefing', origin: 'briefing.html', license: 'Restricted Analysis', reliability_rating: 'MEDIUM', created_at: new Date().toISOString(), last_refresh: new Date().toISOString(), record_count: 1 },
];

const FALLBACK_DOCUMENTS: Document[] = [
  { id: 'doc-1', source_id: 'src-3', title: 'Global Intelligence Briefing #104', file_type: 'HTML', content: 'An official intelligence digest confirming that Cyberdyne Systems and Apex Cybernetics have initiated cross-organization research on Project Titan.\n\nLead Researcher Dr. Sarah Connor and Chief Technology Officer Alexander Vance are appointed co-chairs.', extraction_date: new Date().toISOString(), metadata_json: {} }
];

const FALLBACK_REVIEW: MergeRecord[] = [
  { id: 'merge-1', target_entity_id: 'Alexander Vance', source_entity_id: 'Alex Vance', status: 'PROPOSED', score: 0.88, evidence: { name_jaro_winkler: 0.91, shared_identifiers: ['email:alex.vance@cyberdyne.io'] }, created_at: new Date().toISOString() },
  { id: 'merge-2', target_entity_id: 'Elena Rostova', source_entity_id: 'E. Rostova', status: 'PROPOSED', score: 0.82, evidence: { token_sort_ratio: 0.85, shared_identifiers: ['email:elena.rostova@apexcyber.com'] }, created_at: new Date().toISOString() },
];

export async function searchGlobal(query: string, typeFilter?: string, sourceId?: string): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (typeFilter) params.append('type_filter', typeFilter);
    if (sourceId) params.append('source_id', sourceId);

    const res = await fetch(`${API_BASE}/search?${params.toString()}`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    const q = query.toLowerCase();
    const results = FALLBACK_ENTITIES.filter(e => e.name.toLowerCase().includes(q)).map(e => ({
      id: e.id,
      object_type: 'entity' as const,
      title: e.name,
      subtitle: `Type: ${e.type}`,
      description: `Aliases: ${e.aliases.join(', ')}`,
      source_name: 'Corporate Registry 2024',
      confidence: e.confidence,
      date: e.created_at,
      tags: [e.type],
      properties: e.properties
    }));

    return {
      query,
      total_results: results.length,
      results,
      facets: {
        object_type: { entity: results.length, event: 0, document: 0 },
        source: { 'Corporate Registry 2024': results.length }
      }
    };
  }
}

export async function fetchGraphData(relType?: string): Promise<GraphData> {
  try {
    const params = new URLSearchParams();
    if (relType) params.append('rel_type', relType);
    const res = await fetch(`${API_BASE}/graph?${params.toString()}`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    return FALLBACK_GRAPH;
  }
}

export async function fetchNeighborGraph(entityId: string, depth = 1): Promise<GraphData> {
  try {
    const res = await fetch(`${API_BASE}/graph/neighbors/${entityId}?depth=${depth}`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    return FALLBACK_GRAPH;
  }
}

export async function fetchEntities(): Promise<Entity[]> {
  try {
    const res = await fetch(`${API_BASE}/entities`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    return FALLBACK_ENTITIES;
  }
}

export async function fetchEntityById(id: string): Promise<Entity> {
  try {
    const res = await fetch(`${API_BASE}/entities/${id}`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    return FALLBACK_ENTITIES.find(e => e.id === id) || FALLBACK_ENTITIES[0];
  }
}

export async function deleteEntity(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/entities/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Offline mode: simulated entity deletion');
  }
}

export async function fetchReviewQueue(status = 'PROPOSED'): Promise<MergeRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/review?status=${status}`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    return FALLBACK_REVIEW;
  }
}

export async function acceptMerge(mergeId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/review/${mergeId}/accept`, { method: 'POST' });
  } catch (err) {
    console.warn('Offline mode: simulated merge accept');
  }
}

export async function rejectMerge(mergeId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/review/${mergeId}/reject`, { method: 'POST' });
  } catch (err) {
    console.warn('Offline mode: simulated merge reject');
  }
}

export async function fetchSources(): Promise<Source[]> {
  try {
    const res = await fetch(`${API_BASE}/ingestion/sources`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    return FALLBACK_SOURCES;
  }
}

export async function fetchDocuments(): Promise<Document[]> {
  try {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    return FALLBACK_DOCUMENTS;
  }
}

export async function fetchEvents(category?: string, entityId?: string): Promise<EventItem[]> {
  try {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (entityId) params.append('entity_id', entityId);
    const res = await fetch(`${API_BASE}/events?${params.toString()}`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    return FALLBACK_EVENTS;
  }
}

export async function fetchAnalyticsSummary(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    return {
      total_entities: FALLBACK_ENTITIES.length,
      total_relationships: FALLBACK_GRAPH.edges.length,
      total_sources: FALLBACK_SOURCES.length,
      total_events: FALLBACK_EVENTS.length,
      entity_types: { PERSON: 3, ORGANIZATION: 2 }
    };
  }
}
