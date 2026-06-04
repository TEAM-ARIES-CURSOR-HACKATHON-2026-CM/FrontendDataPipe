import type { Edge, Node } from '@xyflow/react';
import type { BlockNodeData } from '../types';

export const PIPELINE_SNAPSHOT_VERSION = 1;
const SAVED_LIST_KEY = 'datapipe_saved_pipelines_v1';

export interface PipelineSnapshot {
  version: typeof PIPELINE_SNAPSHOT_VERSION;
  savedAt: string;
  nodes: Array<{
    id: string;
    position: { x: number; y: number };
    data: BlockNodeData;
  }>;
  edges: Array<{ id: string; source: string; target: string }>;
}

export interface SavedPipelineRecord {
  id: string;
  name: string;
  savedAt: string;
  snapshot: PipelineSnapshot;
}

export function serializePipeline(nodes: Node[], edges: Edge[]): PipelineSnapshot {
  return {
    version: PIPELINE_SNAPSHOT_VERSION,
    savedAt: new Date().toISOString(),
    nodes: nodes.map((n) => ({
      id: n.id,
      position: n.position,
      data: n.data as BlockNodeData,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
  };
}

export function deserializePipeline(
  snapshot: PipelineSnapshot,
): { nodes: Node[]; edges: Edge[] } | string {
  if (snapshot.version !== PIPELINE_SNAPSHOT_VERSION) {
    return 'Version de sauvegarde non supportée.';
  }
  if (!snapshot.nodes?.length) return 'Pipeline vide.';

  const nodes: Node[] = snapshot.nodes.map((n) => ({
    id: n.id,
    type: 'block',
    position: n.position,
    data: n.data,
  }));

  const edges: Edge[] = (snapshot.edges ?? []).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'pipeline',
  }));

  return { nodes, edges };
}

function readSavedList(): SavedPipelineRecord[] {
  try {
    const raw = localStorage.getItem(SAVED_LIST_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as SavedPipelineRecord[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeSavedList(list: SavedPipelineRecord[]): void {
  localStorage.setItem(SAVED_LIST_KEY, JSON.stringify(list));
}

export function listSavedPipelines(): SavedPipelineRecord[] {
  return readSavedList().sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}

export function saveNamedPipeline(
  name: string,
  nodes: Node[],
  edges: Edge[],
): SavedPipelineRecord {
  const trimmed = name.trim() || 'Pipeline sans nom';
  const record: SavedPipelineRecord = {
    id: `save-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: trimmed,
    savedAt: new Date().toISOString(),
    snapshot: serializePipeline(nodes, edges),
  };
  const list = readSavedList();
  list.push(record);
  writeSavedList(list);
  return record;
}

export function deleteSavedPipeline(id: string): boolean {
  const list = readSavedList();
  const next = list.filter((r) => r.id !== id);
  if (next.length === list.length) return false;
  writeSavedList(next);
  return true;
}

export function downloadPipelineJson(nodes: Node[], edges: Edge[], filename?: string): void {
  const payload = serializePipeline(nodes, edges);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `datapipe-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parsePipelineFileText(text: string): PipelineSnapshot | string {
  try {
    const parsed = JSON.parse(text) as PipelineSnapshot;
    if (!parsed.version || !parsed.nodes) return 'Fichier JSON invalide.';
    return parsed;
  } catch {
    return 'Impossible de lire le fichier JSON.';
  }
}
