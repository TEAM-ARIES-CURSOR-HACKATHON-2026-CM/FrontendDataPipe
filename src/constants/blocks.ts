import type { BlockType, BlockParams } from '../types';

export interface BlockDefinition {
  type: BlockType;
  label: string;
  description: string;
  category: 'source' | 'transform' | 'viz';
  color: string;
  defaultParams: BlockParams;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: 'csv',
    label: 'CSV',
    description: 'Charger un fichier CSV',
    category: 'source',
    color: '#3b82f6',
    defaultParams: { file: '' },
  },
  {
    type: 'filter',
    label: 'Filtre',
    description: 'Filtrer les lignes',
    category: 'transform',
    color: '#8b5cf6',
    defaultParams: { colonne: 'montant', operateur: '>', valeur: '5000' },
  },
  {
    type: 'group',
    label: 'Grouper',
    description: 'Agrégation par colonnes',
    category: 'transform',
    color: '#a855f7',
    defaultParams: {
      colonnes_group: 'client_id',
      agregation: 'sum',
      colonne_agr: 'montant',
    },
  },
  {
    type: 'sort',
    label: 'Trier',
    description: 'Trier le DataFrame',
    category: 'transform',
    color: '#d946ef',
    defaultParams: { colonne: 'date', ordre: 'desc' },
  },
  {
    type: 'add_column',
    label: 'Colonne',
    description: 'Ajouter une colonne calculée',
    category: 'transform',
    color: '#ec4899',
    defaultParams: { nom_colonne: 'montant_ht', formule: 'montant / 1.2' },
  },
  {
    type: 'table',
    label: 'Tableau',
    description: 'Afficher les données',
    category: 'viz',
    color: '#10b981',
    defaultParams: {},
  },
  {
    type: 'bar_chart',
    label: 'Barres',
    description: 'Graphique à barres',
    category: 'viz',
    color: '#f59e0b',
    defaultParams: { axeX: 'client_id', axeY: 'montant' },
  },
  {
    type: 'pie_chart',
    label: 'Circulaire',
    description: 'Graphique circulaire',
    category: 'viz',
    color: '#ef4444',
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
