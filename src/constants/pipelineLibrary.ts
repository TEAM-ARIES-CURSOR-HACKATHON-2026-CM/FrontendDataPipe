import type { BlockParams, BlockType } from '../types';

export type PipelineTemplateCategory = 'reporting' | 'controle' | 'agregation';

export interface PipelineTemplateStep {
  type: BlockType;
  params?: Partial<BlockParams>;
}

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  category: PipelineTemplateCategory;
  /** Indices des étapes reliées séquentiellement : [0→1], [1→2], … */
  links: Array<[number, number]>;
  steps: PipelineTemplateStep[];
}

export const PIPELINE_TEMPLATE_CATEGORIES: Record<
  PipelineTemplateCategory,
  { label: string; hint: string }
> = {
  reporting: { label: 'Reporting', hint: 'Tableaux et graphiques analyste' },
  controle: { label: 'Contrôle', hint: 'Filtres et règles métier' },
  agregation: { label: 'Agrégation', hint: 'Regroupements et indicateurs' },
};

/** Modèles prêts à l’emploi — importer ensuite un fichier source (CSV / JSON / SQL). */
export const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    id: 'montants-eleves-barres',
    name: 'Montants élevés par client',
    description:
      'Filtre les opérations > 5 000 €, agrège par client_id, graphique barres.',
    category: 'reporting',
    steps: [
      { type: 'csv' },
      { type: 'filter', params: { colonne: 'montant', operateur: '>', valeur: '5000' } },
      {
        type: 'group',
        params: { colonnes_group: 'client_id', agregation: 'sum', colonne_agr: 'montant' },
      },
      { type: 'bar_chart', params: { axeX: 'client_id', axeY: 'montant' } },
    ],
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  {
    id: 'releve-tableau',
    name: 'Relevé transactionnel',
    description: 'Affiche toutes les lignes importées dans un tableau.',
    category: 'reporting',
    steps: [{ type: 'csv' }, { type: 'table' }],
    links: [[0, 1]],
  },
  {
    id: 'repartition-type',
    name: 'Répartition par type d’opération',
    description: 'Graphique circulaire : type vs montant.',
    category: 'reporting',
    steps: [
      { type: 'csv' },
      { type: 'pie_chart', params: { axe_categorie: 'type', axe_valeur: 'montant' } },
    ],
    links: [[0, 1]],
  },
  {
    id: 'virements-recents',
    name: 'Virements récents',
    description: 'Filtre type = virement, tri par date décroissant, tableau.',
    category: 'controle',
    steps: [
      { type: 'csv' },
      { type: 'filter', params: { colonne: 'type', operateur: '=', valeur: 'virement' } },
      { type: 'sort', params: { colonne: 'date', ordre: 'desc' } },
      { type: 'table' },
    ],
    links: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  {
    id: 'montant-ht',
    name: 'Colonne montant HT',
    description: 'Ajoute montant_ht = montant / 1.2 puis tableau.',
    category: 'agregation',
    steps: [
      { type: 'csv' },
      { type: 'add_column', params: { nom_colonne: 'montant_ht', formule: 'montant / 1.2' } },
      { type: 'table' },
    ],
    links: [
      [0, 1],
      [1, 2],
    ],
  },
  {
    id: 'top-clients',
    name: 'Top clients (somme)',
    description: 'Regroupe par client, somme des montants, graphique barres.',
    category: 'agregation',
    steps: [
      { type: 'json' },
      {
        type: 'group',
        params: { colonnes_group: 'client_id', agregation: 'sum', colonne_agr: 'montant' },
      },
      { type: 'bar_chart', params: { axeX: 'client_id', axeY: 'montant' } },
    ],
    links: [
      [0, 1],
      [1, 2],
    ],
  },
  {
    id: 'sql-rapport',
    name: 'Rapport depuis SQL',
    description: 'Source SQL → filtre montant → tableau (script CREATE+INSERT).',
    category: 'controle',
    steps: [
      { type: 'sql' },
      { type: 'filter', params: { colonne: 'montant', operateur: '>', valeur: '1000' } },
      { type: 'table' },
    ],
    links: [
      [0, 1],
      [1, 2],
    ],
  },
];
