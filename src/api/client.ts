import type { Edge, Node } from '@xyflow/react';
import type { BlockNodeData, PipelineResult } from '../types';
import { getApiBaseUrl } from './config';
import { toApiParams } from './paramsMapping';
import type {
  FastApiErrorBody,
  HealthResponseApi,
  PipelineRequestApi,
  PipelineResponseApi,
  UploadResponseApi,
} from './schema';

const API_BASE = getApiBaseUrl();

async function parseError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as FastApiErrorBody;
  const { detail } = body;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d) => d.msg).join(' · ');
  }
  return res.statusText || `Erreur HTTP ${res.status}`;
}

function mapChartSpec(spec?: Record<string, string> | null): PipelineResult['chart'] {
  if (!spec) return undefined;
  return {
    xKey: spec.xKey ?? spec.x_key ?? spec.x_axis ?? spec.axeX ?? spec.x,
    yKey: spec.yKey ?? spec.y_key ?? spec.y_axis ?? spec.axeY ?? spec.y,
    categoryKey:
      spec.categoryKey ??
      spec.category_key ??
      spec.nameKey ??
      spec.axe_categorie ??
      spec.category,
    valueKey:
      spec.valueKey ?? spec.value_key ?? spec.axe_valeur ?? spec.value,
  };
}

function normalizePipelineResponse(raw: PipelineResponseApi): PipelineResult {
  return {
    result_type: raw.result_type,
    data: raw.data ?? [],
    chart: mapChartSpec(raw.chart_spec),
    row_count: raw.row_count,
  };
}

/** Construit le corps POST /pipeline conforme à l’OpenAPI (sans file_id racine). */
export function buildPipelineRequest(
  nodes: Node[],
  edges: Edge[],
  outputNodeId?: string,
): PipelineRequestApi {
  return {
    nodes: nodes.map((n) => {
      const d = n.data as BlockNodeData;
      return {
        id: n.id,
        type: d.blockType,
        params: toApiParams(d.blockType, d.params ?? {}),
      };
    }),
    edges: edges.map((e) => ({
      source: e.source,
      target: e.target,
    })),
    output_node_id: outputNodeId ?? null,
  };
}

export async function checkHealth(): Promise<HealthResponseApi> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<HealthResponseApi>;
}

export async function uploadCsv(
  file: File,
): Promise<{ file_id: string; columns: string[]; filename?: string; row_count?: number }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as UploadResponseApi;
  return {
    file_id: data.file_id,
    columns: data.columns ?? [],
    filename: data.filename,
    row_count: data.row_count,
  };
}

export async function runPipeline(payload: PipelineRequestApi): Promise<PipelineResult> {
  const res = await fetch(`${API_BASE}/pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const raw = (await res.json()) as PipelineResponseApi;
  return normalizePipelineResponse(raw);
}

export { API_BASE };
