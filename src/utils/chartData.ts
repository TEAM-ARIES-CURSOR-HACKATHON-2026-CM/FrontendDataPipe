import type { PipelineResult } from '../types';

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

export function resolvePieChartKeys(result: PipelineResult): PieChartKeys {
  const keys = firstRowKeys(result.data);

  if (keys.includes('name') && keys.includes('value')) {
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
    .map((row) => ({
      ...row,
      [categoryKey]: row[categoryKey] ?? row.name ?? '—',
      [valueKey]: Number(row[valueKey] ?? row.value) || 0,
    }))
    .filter((row) => Number(row[valueKey]) > 0);
}
