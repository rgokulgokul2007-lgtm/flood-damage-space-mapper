import { BoundingBox, AnalysisMetrics, SituationReport } from '../types';

// Default VITE_API_BASE_URL to '' (relative path '/api') if undefined
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export interface AnalysisResponse {
  success: boolean;
  timestamp: string;
  engine: string;
  metrics: AnalysisMetrics;
  layers: {
    floodGeoJson: GeoJSON.FeatureCollection;
    roadNetworkGeoJson: GeoJSON.FeatureCollection;
  };
  error?: string;
}

export async function fetchSatelliteData(bbox: BoundingBox, preDate: string, postDate: string, incidentPreset: string) {
  const res = await fetch(`${API_BASE_URL}/api/fetch-satellite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bbox, preDate, postDate, incidentPreset }),
  });
  if (!res.ok) throw new Error(`Satellite fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchOsmData(bbox: BoundingBox) {
  const res = await fetch(`${API_BASE_URL}/api/fetch-osm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bbox }),
  });
  if (!res.ok) throw new Error(`OSM fetch failed: ${res.statusText}`);
  return res.json();
}

export async function runSpaceAnalysis(
  bbox: BoundingBox,
  preDate: string,
  postDate: string,
  incidentPreset: string
): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bbox, preDate, postDate, incidentPreset }),
  });
  if (!res.ok) throw new Error(`Analysis failed: ${res.statusText}`);
  return res.json();
}

export async function generateAiSitRep(
  metrics: AnalysisMetrics,
  metadata: {
    incidentName: string;
    locationName: string;
    preEventDate: string;
    postEventDate: string;
    bbox: BoundingBox;
  }
): Promise<{ success: boolean; report: SituationReport; generatedWithAI: boolean; model: string }> {
  const res = await fetch(`${API_BASE_URL}/api/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metrics, metadata }),
  });
  if (!res.ok) throw new Error(`Report generation failed: ${res.statusText}`);
  return res.json();
}

export async function fetchAuditHistory() {
  const res = await fetch(`${API_BASE_URL}/api/history`);
  if (!res.ok) throw new Error(`Audit history fetch failed: ${res.statusText}`);
  return res.json();
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  groundingSources?: Array<{ title: string; uri: string }>;
  searchQueries?: string[];
}

export async function sendChatMessage(
  messages: Array<{ role: string; content: string }>,
  context: any
): Promise<{ success: boolean; reply: string; searchGrounding?: { queries: string[]; sources: Array<{ title: string; uri: string }> }; model?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.statusText}`);
  return res.json();
}
