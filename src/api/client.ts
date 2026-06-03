import type { GenerateResponse, PipelinePayload, PipelineResult } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export async function uploadCsv(file: File): Promise<{ file_id: string; columns: string[] }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail?: string }).detail ?? 'Échec du téléversement');
  }
  return res.json();
}

export async function runPipeline(payload: PipelinePayload): Promise<PipelineResult> {
  const res = await fetch(`${API_BASE}/pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error((body as { detail?: string }).detail ?? 'Échec de l\'exécution');
  }
  return body as PipelineResult;
}

export async function generateTransformation(description: string): Promise<GenerateResponse> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error((body as { detail?: string }).detail ?? 'Échec de la génération IA');
  }
  return body as GenerateResponse;
}
