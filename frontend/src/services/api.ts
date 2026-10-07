import { GraphData, SearchResponse, Entity, MergeRecord, Source, Document, EventItem } from '../types';

const API_BASE = '/api/v1';

export async function searchGlobal(query: string, typeFilter?: string, sourceId?: string): Promise<SearchResponse> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (typeFilter) params.append('type_filter', typeFilter);
  if (sourceId) params.append('source_id', sourceId);

  const res = await fetch(`${API_BASE}/search?${params.toString()}`);
  return res.json();
}

export async function fetchGraphData(relType?: string): Promise<GraphData> {
  const params = new URLSearchParams();
  if (relType) params.append('rel_type', relType);

  const res = await fetch(`${API_BASE}/graph?${params.toString()}`);
  return res.json();
}

export async function fetchNeighborGraph(entityId: string, depth = 1): Promise<GraphData> {
  const res = await fetch(`${API_BASE}/graph/neighbors/${entityId}?depth=${depth}`);
  return res.json();
}

export async function fetchEntities(): Promise<Entity[]> {
  const res = await fetch(`${API_BASE}/entities`);
  return res.json();
}

export async function fetchEntityById(id: string): Promise<Entity> {
  const res = await fetch(`${API_BASE}/entities/${id}`);
  return res.json();
}

export async function deleteEntity(id: string): Promise<void> {
  await fetch(`${API_BASE}/entities/${id}`, { method: 'DELETE' });
}

export async function fetchReviewQueue(status = 'PROPOSED'): Promise<MergeRecord[]> {
  const res = await fetch(`${API_BASE}/review?status=${status}`);
  return res.json();
}

export async function acceptMerge(mergeId: string): Promise<void> {
  await fetch(`${API_BASE}/review/${mergeId}/accept`, { method: 'POST' });
}

export async function rejectMerge(mergeId: string): Promise<void> {
  await fetch(`${API_BASE}/review/${mergeId}/reject`, { method: 'POST' });
}

export async function fetchSources(): Promise<Source[]> {
  const res = await fetch(`${API_BASE}/ingestion/sources`);
  return res.json();
}

export async function fetchDocuments(): Promise<Document[]> {
  const res = await fetch(`${API_BASE}/documents`);
  return res.json();
}

export async function fetchEvents(category?: string, entityId?: string): Promise<EventItem[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (entityId) params.append('entity_id', entityId);
  const res = await fetch(`${API_BASE}/events?${params.toString()}`);
  return res.json();
}

export async function fetchAnalyticsSummary(): Promise<any> {
  const res = await fetch(`${API_BASE}/analytics/summary`);
  return res.json();
}
