import type { BlockParams, BlockType, FilterOperator } from '../types';

/** Paramètres UI (français) → contrat backend Aries DataPipe (anglais). */
export function toApiParams(
  blockType: BlockType,
  params: BlockParams,
): Record<string, unknown> {
  switch (blockType) {
    case 'csv':
    case 'json':
    case 'sql':
      return {
        ...(params.file_id ? { file_id: params.file_id } : {}),
        ...(params.file ? { file: params.file } : {}),
      };

    case 'filter':
      return {
        column: params.colonne ?? '',
        operator: params.operateur ?? '>',
        value: params.valeur ?? '',
      };

    case 'group': {
      const groupCol = params.colonnes_group?.trim();
      return {
        group_columns: groupCol ? [groupCol] : [],
        aggregation: params.agregation ?? 'sum',
        agg_column: params.colonne_agr ?? '',
      };
    }

    case 'sort':
      return {
        column: params.colonne ?? '',
        order: params.ordre ?? 'asc',
      };

    case 'add_column':
      return {
        column_name: params.nom_colonne ?? '',
        formula: params.formule ?? '',
      };

    case 'table':
      return {};

    case 'bar_chart':
      return {
        x_key: params.axeX ?? '',
        y_key: params.axeY ?? '',
      };

    case 'pie_chart':
      return {
        category_key: params.axe_categorie ?? '',
        value_key: params.axe_valeur ?? '',
      };

    default:
      return { ...params };
  }
}

/** Réponse IA / backend → paramètres UI. */
export function fromApiParams(
  blockType: BlockType,
  raw: Record<string, unknown> | BlockParams | null | undefined,
): BlockParams {
  if (!raw || typeof raw !== 'object') return {};

  const p = raw as Record<string, unknown>;

  switch (blockType) {
    case 'csv':
    case 'json':
    case 'sql':
      return {
        file_id: String(p.file_id ?? p.fileId ?? ''),
        file: String(p.file ?? p.filename ?? ''),
      };

    case 'filter':
      return {
        colonne: String(p.colonne ?? p.column ?? ''),
        operateur: (p.operateur ?? p.operator ?? '>') as FilterOperator,
        valeur: String(p.valeur ?? p.value ?? ''),
      };

    case 'group': {
      const gc = p.colonnes_group ?? p.group_columns ?? p.group_by;
      const groupStr = Array.isArray(gc) ? String(gc[0] ?? '') : String(gc ?? '');
      return {
        colonnes_group: groupStr,
        agregation: (p.agregation ?? p.aggregation ?? 'sum') as BlockParams['agregation'],
        colonne_agr: String(p.colonne_agr ?? p.agg_column ?? ''),
      };
    }

    case 'sort':
      return {
        colonne: String(p.colonne ?? p.column ?? ''),
        ordre: (p.ordre ?? p.order ?? 'asc') as 'asc' | 'desc',
      };

    case 'add_column':
      return {
        nom_colonne: String(p.nom_colonne ?? p.column_name ?? p.new_column ?? ''),
        formule: String(p.formule ?? p.formula ?? ''),
      };

    case 'bar_chart':
      return {
        axeX: String(p.axeX ?? p.x_key ?? p.x_axis ?? p.xKey ?? ''),
        axeY: String(p.axeY ?? p.y_key ?? p.y_axis ?? p.yKey ?? ''),
      };

    case 'pie_chart':
      return {
        axe_categorie: String(
          p.axe_categorie ?? p.category_key ?? p.category_column ?? p.category ?? '',
        ),
        axe_valeur: String(
          p.axe_valeur ?? p.value_key ?? p.value_column ?? p.value ?? '',
        ),
      };

    case 'table':
      return {};

    default:
      return raw as BlockParams;
  }
}
