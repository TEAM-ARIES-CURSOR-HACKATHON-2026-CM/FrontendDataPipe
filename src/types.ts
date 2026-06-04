export type BlockType =
  | 'csv'
  | 'json'
  | 'sql'
  | 'filter'
  | 'group'
  | 'sort'
  | 'add_column'
  | 'table'
  | 'bar_chart'
  | 'pie_chart';

export type TransformBlockType = 'filter' | 'group' | 'sort' | 'add_column';
export type VizBlockType = 'table' | 'bar_chart' | 'pie_chart';

export type FilterOperator = '>' | '<' | '=' | '!=' | 'contains';

export interface BlockParams {
  file?: string;
  /** Identifiant renvoyé par POST /upload — lié au nœud source (CSV / JSON / SQL) */
  file_id?: string;
  colonne?: string;
  operateur?: FilterOperator;
  valeur?: string;
  colonnes_group?: string;
  agregation?: 'sum' | 'mean' | 'count';
  colonne_agr?: string;
  ordre?: 'asc' | 'desc';
  nom_colonne?: string;
  formule?: string;
  axeX?: string;
  axeY?: string;
  axe_categorie?: string;
  axe_valeur?: string;
}

export interface BlockNodeData {
  label: string;
  blockType: BlockType;
  params: BlockParams;
  [key: string]: unknown;
}

export interface PipelineNodePayload {
  id: string;
  type: BlockType;
  params: BlockParams;
}

export interface PipelineEdgePayload {
  source: string;
  target: string;
}

export interface PipelinePayload {
  nodes: PipelineNodePayload[];
  edges: PipelineEdgePayload[];
  output_node_id?: string;
}

export type ResultType = 'table' | 'bar_chart' | 'pie_chart';

export interface PipelineResult {
  result_type: ResultType;
  data: Record<string, unknown>[];
  chart?: { xKey?: string; yKey?: string; categoryKey?: string; valueKey?: string };
  row_count?: number;
  error?: string;
}

/** Métadonnées affichées après validation du pipeline. */
export interface PipelineRunMeta {
  durationMs: number;
  rowCount: number;
  transformCount: number;
}

