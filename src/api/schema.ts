/** Contrats OpenAPI — https://ahmed-x-18-aries-datapipe.hf.space/docs */
import type { BlockParams, BlockType } from '../types';

export interface UploadResponseApi {
  file_id: string;
  filename: string;
  columns: string[];
  row_count: number;
  preview: Record<string, unknown>[];
}

export interface PipelineNodeApi {
  id: string;
  type: BlockType;
  params?: BlockParams;
}

export interface PipelineEdgeApi {
  source: string;
  target: string;
}

export interface PipelineRequestApi {
  nodes: PipelineNodeApi[];
  edges: PipelineEdgeApi[];
  output_node_id?: string | null;
}

export interface PipelineResponseApi {
  result_type: 'table' | 'bar_chart' | 'pie_chart';
  data: Record<string, unknown>[];
  chart_spec?: Record<string, string> | null;
  row_count: number;
}

export interface GenerateRequestApi {
  description: string;
  columns?: string[] | null;
}

export interface GenerateResponseApi {
  code: string;
  block_type?: BlockType | null;
  params?: BlockParams | null;
}

export interface HealthResponseApi {
  status: string;
}

export type FastApiErrorBody = {
  detail?: string | { msg: string; loc?: (string | number)[] }[];
};
