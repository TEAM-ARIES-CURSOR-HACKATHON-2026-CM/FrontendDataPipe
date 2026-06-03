import type { BlockParams, PipelineResult } from '../types';

export interface BarChartKeys {
  xKey: string;
  yKey: string;
}

export interface PieChartKeys {
  categoryKey: string;
  valueKey: string;
}

function firstRowKeys(data: Record<string, unknown>[]): string[] {
  return data[0] ? Object.keys(data[0]) : [];
}

function isNumericValue(v: unknown): boolean {
  if (typeof v === 'number' && !Number.isNaN(v)) return true;
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return true;
  return false;
}

function firstNumericKey(data: Record<string, unknown>[], keys: string[]): string | undefined {
  const row = data[0];
  if (!row) return undefined;
  return keys.find((k) => isNumericValue(row[k]));
}

export function resolveBarChartKeys(result: PipelineResult): BarChartKeys {
  const keys = firstRowKeys(result.data);
  const row = result.data[0] ?? {};
  const xKey = result.chart?.xKey ?? keys.find((k) => typeof row[k] === 'string') ?? keys[0] ?? 'x';
  const yKey =
    result.chart?.yKey ??
    firstNumericKey(result.data, keys) ??
    keys.find((k) => k !== xKey) ??
    keys[1] ??
    'y';
  return { xKey, yKey };
}

/** Réponse /pie_chart backend : lignes name/value souvent null — reconstruction nécessaire. */
export function isBrokenPieResponse(data: Record<string, unknown>[]): boolean {
  if (!data.length) return true;
  const keys = firstRowKeys(data);
  if (!keys.includes('name') || !keys.includes('value')) return false;
  return data.every(
    (row) =>
      (row.name == null || row.name === '') &&
      (row.value == null || row.value === '' || Number(row.value) === 0),
  );
}

export function getPieParamsFromNode(params: BlockParams): PieChartKeys | null {
  const categoryKey = params.axe_categorie?.trim();
  const valueKey = params.axe_valeur?.trim();
  if (!categoryKey || !valueKey) return null;
  return { categoryKey, valueKey };
}

/** Construit des points { name, value } depuis les colonnes source (agrège les doublons). */
export function buildPieFromSourceData(
  sourceData: Record<string, unknown>[],
  categoryKey: string,
  valueKey: string,
): Record<string, unknown>[] {
  const totals = new Map<string, number>();

  for (const row of sourceData) {
    const label = String(row[categoryKey] ?? '—');
    const amount = Number(row[valueKey]);
    if (!Number.isFinite(amount)) continue;
    totals.set(label, (totals.get(label) ?? 0) + amount);
  }

  return [...totals.entries()]
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));
}

export function resolvePieChartKeys(result: PipelineResult): PieChartKeys {
  const keys = firstRowKeys(result.data);

  if (
    keys.includes('name') &&
    keys.includes('value') &&
    !isBrokenPieResponse(result.data)
  ) {
    return { categoryKey: 'name', valueKey: 'value' };
  }

  const row = result.data[0] ?? {};
  const categoryKey =
    result.chart?.categoryKey ??
    keys.find((k) => typeof row[k] === 'string') ??
    keys[0] ??
    'name';
  const valueKey =
    result.chart?.valueKey ??
    firstNumericKey(result.data, keys) ??
    keys.find((k) => k !== categoryKey) ??
    keys[1] ??
    'value';

  return { categoryKey, valueKey };
}

/** Lignes valides pour un graphique circulaire (valeurs numériques). */
export function filterPieRows(
  data: Record<string, unknown>[],
  categoryKey: string,
  valueKey: string,
): Record<string, unknown>[] {
  return data
    .map((row) => {
      const rawVal = row[valueKey] ?? row.value;
      const num = typeof rawVal === 'number' ? rawVal : Number(rawVal);
      return {
        ...row,
        [categoryKey]: row[categoryKey] ?? row.name ?? '—',
        [valueKey]: Number.isFinite(num) ? num : 0,
      };
    })
    .filter((row) => Number(row[valueKey]) > 0);
}

/**
 * Corrige une réponse pie_chart dont le backend renvoie name/value null.
 * Le backend n’accepte en sortie que des nœuds de visualisation : on relance
 * le pipeline en remplaçant temporairement le pie par un nœud « table ».
 */
export async function repairPieChartResult(
  result: PipelineResult,
  options: {
    vizNodeId: string;
    pieParams: PieChartKeys;
    fetchTableOutput: () => Promise<PipelineResult>;
  },
): Promise<PipelineResult> {
  if (result.result_type !== 'pie_chart' || !isBrokenPieResponse(result.data)) {
    return result;
  }

  try {
    const sourceResult = await options.fetchTableOutput();
    const pieData = buildPieFromSourceData(
      sourceResult.data,
      options.pieParams.categoryKey,
      options.pieParams.valueKey,
    );

    if (!pieData.length) return result;

    return {
      ...result,
      data: pieData,
      chart: { categoryKey: 'name', valueKey: 'value' },
      row_count: pieData.length,
    };
  } catch {
    return result;
  }
}
