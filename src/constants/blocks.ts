import type { BlockType, BlockParams } from '../types';

export interface BlockDefinition {
  type: BlockType;
  label: string;
  description: string;
  category: 'source' | 'transform' | 'viz';
  color: string;
  defaultParams: BlockParams;
}

/** Libellés alignés sur le cahier de conception (CSV, Filtre, Grouper, …). */
export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: 'csv',
    label: 'CSV',
    description: 'Charger un fichier CSV (transactions bancaires)',
    category: 'source',
    color: '#1a1a1a',
    defaultParams: { file: '' },
  },
  {
    type: 'filter',
    label: 'Filtre',
    description: 'colonne · opérateur · valeur',
    category: 'transform',
    color: '#333333',
    defaultParams: { colonne: 'montant', operateur: '>', valeur: '5000' },
  },
  {
    type: 'group',
    label: 'Grouper',
    description: 'colonnes · agrégation · colonne agrégée',
    category: 'transform',
    color: '#4a4a4a',
    defaultParams: {
      colonnes_group: 'client_id',
      agregation: 'sum',
      colonne_agr: 'montant',
    },
  },
  {
    type: 'sort',
    label: 'Trier',
    description: 'colonne · ordre (asc / desc)',
    category: 'transform',
    color: '#5c5c5c',
    defaultParams: { colonne: 'date', ordre: 'desc' },
  },
  {
    type: 'add_column',
    label: 'Ajouter colonne',
    description: 'nouvelle colonne · calcul simple',
    category: 'transform',
    color: '#666666',
    defaultParams: { nom_colonne: 'montant_ht', formule: 'montant / 1.2' },
  },
  {
    type: 'table',
    label: 'Afficher tableau',
    description: 'Visualisation en tableau',
    category: 'viz',
    color: '#1a1a1a',
    defaultParams: {},
  },
  {
    type: 'bar_chart',
    label: 'Graphique barres',
    description: 'axe X · axe Y',
    category: 'viz',
    color: '#2d2d2d',
    defaultParams: { axeX: 'client_id', axeY: 'montant' },
  },
  {
    type: 'pie_chart',
    label: 'Graphique circulaire',
    description: 'catégorie · valeur',
    category: 'viz',
    color: '#3d3d3d',
    defaultParams: { axe_categorie: 'type', axe_valeur: 'montant' },
  },
];

const TRANSFORM_LIST = ['filter', 'group', 'sort', 'add_column'] as const;
const VIZ_LIST = ['table', 'bar_chart', 'pie_chart'] as const;

export type TransformBlockTypeConst = (typeof TRANSFORM_LIST)[number];
export type VizBlockTypeConst = (typeof VIZ_LIST)[number];

export function isTransformType(t: BlockType): t is TransformBlockTypeConst {
  return (TRANSFORM_LIST as readonly string[]).includes(t);
}

export function isVizType(t: BlockType): t is VizBlockTypeConst {
  return (VIZ_LIST as readonly string[]).includes(t);
}

export function getBlockDef(type: BlockType) {
  return BLOCK_DEFINITIONS.find((b) => b.type === type)!;
}
