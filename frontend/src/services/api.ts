import { GraphData, SearchResponse, Entity, MergeRecord, Source, Document, EventItem } from '../types';

const API_BASE = '/api/v1';

// Rich High-Tech Futuristic Fallback Intelligence Dataset
const FALLBACK_GRAPH: GraphData = {
  nodes: [
    { id: 'ent-1', label: 'Alexander Vance', type: 'PERSON', confidence: 0.98, aliases: ['Alex Vance', 'A. Vance'], properties: { title: 'Chief Technology Officer', email: 'alex.vance@cyberdyne.io', city: 'San Francisco', tax_id: 'US-8839201' }, source_id: 'src-1' },
    { id: 'ent-2', label: 'Cyberdyne Systems', type: 'ORGANIZATION', confidence: 1.0, aliases: ['Cyberdyne Inc'], properties: { domain: 'cyberdyne.io', sector: 'Artificial Intelligence & Robotics' }, source_id: 'src-1' },
    { id: 'ent-3', label: 'Dr. Sarah Connor', type: 'PERSON', confidence: 0.95, aliases: ['Sarah Connor'], properties: { role: 'Lead Research Scientist', tax_id: 'US-4439102' }, source_id: 'src-1' },
    { id: 'ent-4', label: 'Apex Cybernetics', type: 'ORGANIZATION', confidence: 0.92, aliases: ['Apex Cyber'], properties: { domain: 'apexcyber.com', city: 'Austin' }, source_id: 'src-2' },
    { id: 'ent-5', label: 'Elena Rostova', type: 'PERSON', confidence: 0.88, aliases: ['E. Rostova'], properties: { title: 'Executive Vice President', email: 'elena.rostova@apexcyber.com' }, source_id: 'src-2' },
    { id: 'ent-6', label: 'Nexus AI Corporation', type: 'ORGANIZATION', confidence: 0.94, aliases: ['Nexus AI'], properties: { domain: 'nexusai.global', sector: 'Quantum Computing' }, source_id: 'src-2' },
    { id: 'ent-7', label: 'Dr. Hiroshi Sato', type: 'PERSON', confidence: 0.91, aliases: ['Hiro Sato'], properties: { title: 'Founder & Chief Scientist', email: 'hiroshi.sato@nexusai.global' }, source_id: 'src-2' },
    { id: 'ent-8', label: 'Orbital Technologies', type: 'ORGANIZATION', confidence: 0.90, aliases: ['Orbital Tech'], properties: { domain: 'orbitaltech.space', sector: 'Satellite Transmission' }, source_id: 'src-3' },
    { id: 'ent-9', label: 'Captain Rachel Tyrell', type: 'PERSON', confidence: 0.89, aliases: ['R. Tyrell'], properties: { title: 'Aerospace Division Lead' }, source_id: 'src-3' },
    { id: 'ent-10', label: 'Vanguard Defence', type: 'ORGANIZATION', confidence: 0.93, aliases: ['Vanguard Sec'], properties: { domain: 'vanguardsec.org', city: 'London' }, source_id: 'src-3' },
    { id: 'ent-11', label: 'Viktor Vance', type: 'PERSON', confidence: 0.90, aliases: ['V. Vance'], properties: { title: 'Managing Director' }, source_id: 'src-3' },
    { id: 'ent-12', label: 'Aegis Dynamics', type: 'ORGANIZATION', confidence: 0.96, aliases: ['Aegis Dyn'], properties: { domain: 'aegisdyn.com', city: 'Zurich' }, source_id: 'src-3' },
  ],
  edges: [
    { id: 'rel-1', source: 'ent-1', target: 'ent-2', type: 'EMPLOYED_BY', weight: 1.0, evidence: 'companies.csv#row=1' },
    { id: 'rel-2', source: 'ent-3', target: 'ent-2', type: 'MEMBER_OF', weight: 0.9, evidence: 'companies.csv#row=3' },
    { id: 'rel-3', source: 'ent-5', target: 'ent-4', type: 'EMPLOYED_BY', weight: 1.0, evidence: 'companies.csv#row=6' },
    { id: 'rel-4', source: 'ent-2', target: 'ent-4', type: 'PARTNERS_WITH', weight: 0.85, evidence: 'briefing.html#p=1' },
    { id: 'rel-5', source: 'ent-7', target: 'ent-6', type: 'FOUNDED', weight: 1.0, evidence: 'companies.csv#row=10' },
    { id: 'rel-6', source: 'ent-2', target: 'ent-6', type: 'RESEARCH_COLLABORATION', weight: 0.88, evidence: 'briefing.html#p=1' },
    { id: 'rel-7', source: 'ent-9', target: 'ent-8', type: 'LEADS_DIVISION', weight: 0.95, evidence: 'companies.csv#row=13' },
    { id: 'rel-8', source: 'ent-6', target: 'ent-8', type: 'DATA_TRANSMISSION', weight: 0.80, evidence: 'events.json#item=4' },
    { id: 'rel-9', source: 'ent-11', target: 'ent-10', type: 'DIRECTS', weight: 1.0, evidence: 'companies.csv#row=16' },
    { id: 'rel-10', source: 'ent-10', target: 'ent-12', type: 'SECURITY_AUDIT', weight: 0.90, evidence: 'briefing.html#p=3' },
  ]
};

const FALLBACK_ENTITIES: Entity[] = FALLBACK_GRAPH.nodes.map(n => ({
  id: n.id,
  source_id: n.source_id,
  name: n.label,
  type: n.type,
  aliases: n.aliases,
  confidence: n.confidence,
  is_canonical: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  properties: n.properties
}));

const FALLBACK_EVENTS: EventItem[] = [
  { id: 'ev-1', source_id: 'src-1', title: 'Project Titan AI Autonomous Neural Summit', date: '2024-03-15T00:00:00Z', category: 'Corporate', description: 'Public demonstration of next-generation autonomous artificial intelligence framework led by CTO Alexander Vance.', entity_ids: ['ent-1', 'ent-2'], properties: {}, created_at: new Date().toISOString() },
  { id: 'ev-2', source_id: 'src-2', title: 'Apex Cybernetics Global Defense Acquisition', date: '2024-04-10T00:00:00Z', category: 'Defense', description: 'Multi-year autonomous logistics defense contract signed by Executive VP Elena Rostova.', entity_ids: ['ent-4', 'ent-5'], properties: {}, created_at: new Date().toISOString() },
  { id: 'ev-3', source_id: 'src-2', title: 'Nexus AI Quantum Processing Milestone', date: '2024-05-02T00:00:00Z', category: 'Technical', description: 'Breakthrough 10,000-qubit stability achieved under direction of Founder Dr. Hiroshi Sato.', entity_ids: ['ent-6', 'ent-7'], properties: {}, created_at: new Date().toISOString() },
  { id: 'ev-4', source_id: 'src-3', title: 'Orbital Tech Satellite Mesh Activation', date: '2024-05-22T00:00:00Z', category: 'Aerospace', description: 'Low-Earth orbit satellite communications grid activated by Captain Rachel Tyrell.', entity_ids: ['ent-8', 'ent-9'], properties: {}, created_at: new Date().toISOString() },
  { id: 'ev-5', source_id: 'src-3', title: 'Vanguard Defence Security Protocol Accord', date: '2024-06-18T00:00:00Z', category: 'Security', description: 'International maritime security accord ratified by Managing Director Viktor Vance.', entity_ids: ['ent-10', 'ent-11'], properties: {}, created_at: new Date().toISOString() },
  { id: 'ev-6', source_id: 'src-3', title: 'Aegis Dynamics Cryptographic Breakthrough Announcement', date: '2024-07-04T00:00:00Z', category: 'Security', description: 'Zero-knowledge proof encryption standard published by Dr. Arthur Pendelton.', entity_ids: ['ent-12'], properties: {}, created_at: new Date().toISOString() },
];

const FALLBACK_SOURCES: Source[] = [
  { id: 'src-1', name: 'Corporate Registry 2024', origin: 'companies.csv', license: 'Public Domain', reliability_rating: 'HIGH', created_at: new Date().toISOString(), last_refresh: new Date().toISOString(), record_count: 20 },
  { id: 'src-2', name: 'Global Tech Events Feed', origin: 'events.json', license: 'Open Intelligence', reliability_rating: 'HIGH', created_at: new Date().toISOString(), last_refresh: new Date().toISOString(), record_count: 6 },
  { id: 'src-3', name: 'Global Tech Intelligence Briefing', origin: 'briefing.html', license: 'Restricted Analysis', reliability_rating: 'MEDIUM', created_at: new Date().toISOString(), last_refresh: new Date().toISOString(), record_count: 1 },
];

const FALLBACK_DOCUMENTS: Document[] = [
  { id: 'doc-1', source_id: 'src-3', title: 'Global Intelligence Briefing #500', file_type: 'HTML', content: 'An official intelligence digest confirming cross-organizational collaboration between Cyberdyne Systems, Apex Cybernetics, Nexus AI Corporation, and Orbital Technologies.\n\nKey personnel involved include Chief Technology Officer Alexander Vance, Dr. Sarah Connor, Executive VP Elena Rostova, Dr. Hiroshi Sato, Captain Rachel Tyrell, and Viktor Vance.\n\nSecurity clearance verified under Aegis Dynamics Cryptographic Framework.', extraction_date: new Date().toISOString(), metadata_json: {} }
];

const FALLBACK_REVIEW: MergeRecord[] = [
  { id: 'merge-1', target_entity_id: 'Alexander Vance', source_entity_id: 'Alex Vance', status: 'PROPOSED', score: 0.91, evidence: { name_jaro_winkler: 0.94, shared_identifiers: ['email:alex.vance@cyberdyne.io', 'tax_id:US-8839201'] }, created_at: new Date().toISOString() },
  { id: 'merge-2', target_entity_id: 'Elena Rostova', source_entity_id: 'E. Rostova', status: 'PROPOSED', score: 0.86, evidence: { token_sort_ratio: 0.88, shared_identifiers: ['email:elena.rostova@apexcyber.com', 'tax_id:US-1102938'] }, created_at: new Date().toISOString() },
  { id: 'merge-3', target_entity_id: 'Dr. Hiroshi Sato', source_entity_id: 'Hiro Sato', status: 'PROPOSED', score: 0.84, evidence: { name_in_aliases: true, shared_identifiers: ['email:hiroshi.sato@nexusai.global'] }, created_at: new Date().toISOString() },
  { id: 'merge-4', target_entity_id: 'Captain Rachel Tyrell', source_entity_id: 'R. Tyrell', status: 'PROPOSED', score: 0.82, evidence: { name_in_aliases: true, shared_identifiers: ['email:rachel.tyrell@orbitaltech.space'] }, created_at: new Date().toISOString() },
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
    const results = FALLBACK_ENTITIES.filter(e => e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q)).map(e => ({
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
      entity_types: { PERSON: 7, ORGANIZATION: 5 }
    };
  }
}
