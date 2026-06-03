import type { BlockParams, BlockType } from '../types';
import { describeAddColumnHuman } from './addColumnFormula';

const AGG_LABELS: Record<string, string> = {
  sum: 'somme',
  mean: 'moyenne',
  count: 'compte',
};

/** Résumé des paramètres affiché sur chaque nœud (cahier de conception). */
export function getNodeParamLines(
  blockType: BlockType,
  params: BlockParams,
  columns: string[] = [],
): string[] {
  switch (blockType) {
    case 'csv':
      return params.file_id
        ? [`file: ${params.file ?? '—'}`, 'statut: lié']
        : ['file: (cliquer → importer)'];
    case 'filter':
      return [
        `colonne: ${params.colonne ?? '—'}`,
        `op: ${params.operateur ?? '>'}`,
        `valeur: ${params.valeur ?? '—'}`,
      ];
    case 'group':
      return [
        `grouper: ${params.colonnes_group ?? '—'}`,
        `agrégation: ${AGG_LABELS[params.agregation ?? 'sum'] ?? params.agregation}`,
        `colonne: ${params.colonne_agr ?? '—'}`,
      ];
    case 'sort':
      return [
        `colonne: ${params.colonne ?? '—'}`,
        `ordre: ${params.ordre === 'desc' ? 'décroissant' : 'croissant'}`,
      ];
    case 'add_column':
      return [
        `nom: ${params.nom_colonne ?? '—'}`,
        `calcul: ${describeAddColumnHuman(params, columns)}`,
      ];
    case 'table':
      return ['sortie: tableau'];
    case 'bar_chart':
      return [`axe X: ${params.axeX ?? '—'}`, `axe Y: ${params.axeY ?? '—'}`];
    case 'pie_chart':
      return [
        `catégorie: ${params.axe_categorie ?? '—'}`,
        `valeur: ${params.axe_valeur ?? '—'}`,
      ];
    default:
      return [];
  }
}
