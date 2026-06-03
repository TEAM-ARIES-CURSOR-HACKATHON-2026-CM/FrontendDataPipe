import type { BlockParams, BlockType, FilterOperator } from '../types';

export interface ParsedBlock {
  blockType: BlockType;
  params: BlockParams;
}

const FILTER_OPS = new Set(['>', '<', '=', '!=', '>=', '<=']);

function normalizeOperator(op: string): FilterOperator {
  if (op === '==') return '=';
  return op as FilterOperator;
}

function parseFilterConditions(code: string): BlockParams[] {
  const conditions: BlockParams[] = [];
  const seen = new Set<string>();

  const cmpRe =
    /df\s*\[\s*['"](\w+)['"]\s*\]\s*(==|!=|>=|<=|>|<)\s*(?:['"]([^'"]+)['"]|([\d.]+))/g;
  let match: RegExpExecArray | null;
  while ((match = cmpRe.exec(code)) !== null) {
    const colonne = match[1];
    const operateur = normalizeOperator(match[2]);
    const valeur = match[3] ?? match[4] ?? '';
    const key = `${colonne}:${operateur}:${valeur}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (FILTER_OPS.has(operateur)) {
      conditions.push({ colonne, operateur, valeur: String(valeur) });
    }
  }

  const containsRe =
    /df\s*\[\s*['"](\w+)['"]\s*\]\.str\.contains\s*\(\s*['"]([^'"]+)['"]/g;
  while ((match = containsRe.exec(code)) !== null) {
    const key = `${match[1]}:contains:${match[2]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    conditions.push({ colonne: match[1], operateur: 'contains', valeur: match[2] });
  }

  return conditions;
}

function parseGroup(code: string): ParsedBlock | null {
  const match = code.match(
    /groupby\s*\(\s*['"](\w+)['"]\s*\)(?:\s*\[\s*['"](\w+)['"]\s*\])?\s*\.(sum|mean|count)\s*\(\s*\)/,
  );
  if (!match) return null;
  return {
    blockType: 'group',
    params: {
      colonnes_group: match[1],
      colonne_agr: match[2] ?? 'montant',
      agregation: match[3] as BlockParams['agregation'],
    },
  };
}

function parseSort(code: string): ParsedBlock | null {
  const match = code.match(
    /sort_values\s*\(\s*(?:by\s*=\s*)?['"](\w+)['"]\s*(?:,\s*ascending\s*=\s*(True|False))?/,
  );
  if (!match) return null;
  const ascending = match[2] !== 'False';
  return {
    blockType: 'sort',
    params: {
      colonne: match[1],
      ordre: ascending ? 'asc' : 'desc',
    },
  };
}

function parseAddColumn(code: string): ParsedBlock | null {
  // Indexation booléenne (filtre) — pas une affectation de colonne
  if (/df\s*\[\s*(?:\(\s*)?df\s*\[/.test(code)) return null;

  const match = code.match(
    /df\s*\[\s*['"](\w+)['"]\s*\]\s*=(?!=)\s*(.+?)(?:\s*$|\s*;)/,
  );
  if (!match) return null;

  const formule = match[2].trim().replace(/,\s*$/, '');
  // Reste d'une comparaison == mal détectée
  if (formule.startsWith('=')) return null;

  return {
    blockType: 'add_column',
    params: {
      nom_colonne: match[1],
      formule,
    },
  };
}

function inferFromDescription(description: string, schema: string[]): ParsedBlock[] {
  const text = description.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

  if (/\b(grouper|group|agreger|agregation)\b/.test(text)) {
    const col =
      schema.find((c) => text.includes(c.toLowerCase())) ??
      schema.find((c) => /agence|client|type|categorie/.test(c)) ??
      schema[0];
    const aggCol = schema.find((c) => /montant|amount|valeur|sum/.test(c.toLowerCase())) ?? 'montant';
    return [
      {
        blockType: 'group',
        params: { colonnes_group: col, colonne_agr: aggCol, agregation: 'sum' },
      },
    ];
  }

  if (/\b(trier|tri|sort)\b/.test(text)) {
    const col =
      schema.find((c) => text.includes(c.toLowerCase())) ??
      schema.find((c) => /date|montant/.test(c.toLowerCase())) ??
      schema[0];
    const desc = /\b(decroissant|desc|dernier)\b/.test(text);
    return [{ blockType: 'sort', params: { colonne: col, ordre: desc ? 'desc' : 'asc' } }];
  }

  if (/\b(filtre|filter|garder|exclure|superieur|inferieur|egal)\b/.test(text)) {
    const col =
      schema.find((c) => text.includes(c.toLowerCase())) ??
      schema.find((c) => /montant|type|agence/.test(c.toLowerCase())) ??
      'montant';
    const numMatch = text.match(/(\d+(?:[.,]\d+)?)/);
    const valeur = numMatch ? numMatch[1].replace(',', '.') : '0';
    const sup = /\b(superieur|sup|plus|>|>=)\b/.test(text);
    const inf = /\b(inferieur|inf|moins|<|<=)\b/.test(text);
    const operateur: FilterOperator = inf ? '<' : sup ? '>' : '>';
    return [{ blockType: 'filter', params: { colonne: col, operateur, valeur } }];
  }

  if (/\b(colonne|ajouter|formule|calculer)\b/.test(text)) {
    return [
      {
        blockType: 'add_column',
        params: { nom_colonne: 'nouvelle_colonne', formule: 'montant' },
      },
    ];
  }

  return [];
}

/** Convertit la réponse IA (description + code Pandas) en blocs du canevas. */
export function aiResponseToBlocks(
  description: string,
  code: string,
  schema: string[] = [],
): ParsedBlock[] {
  const normalized = code.trim();
  if (!normalized) return inferFromDescription(description, schema);

  const blocks: ParsedBlock[] = [];

  const group = parseGroup(normalized);
  if (group) return [group];

  const sort = parseSort(normalized);
  if (sort) return [sort];

  const filters = parseFilterConditions(normalized);
  if (filters.length > 0) {
    return filters.map((params) => ({ blockType: 'filter' as const, params }));
  }

  const addCol = parseAddColumn(normalized);
  if (addCol && !normalized.includes('groupby') && !normalized.includes('sort_values')) {
    return [addCol];
  }

  const fromDescription = inferFromDescription(description, schema);
  if (fromDescription.length > 0) return fromDescription;

  return blocks;
}

/** @deprecated Utiliser aiResponseToBlocks */
export function pandasCodeToBlocks(code: string): ParsedBlock[] {
  return aiResponseToBlocks('', code, []);
}
