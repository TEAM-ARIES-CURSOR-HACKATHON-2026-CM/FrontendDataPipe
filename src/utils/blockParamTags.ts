import type { BlockType } from '../types';

/** Étiquettes courtes pour la palette (paramètres du cahier de conception). */
export function getBlockParamTags(type: BlockType): string[] {
  switch (type) {
    case 'csv':
      return ['fichier'];
    case 'filter':
      return ['colonne', 'opérateur', 'valeur'];
    case 'group':
      return ['grouper', 'agrégation', 'colonne'];
    case 'sort':
      return ['colonne', 'ordre'];
    case 'add_column':
      return ['nom', 'formule'];
    case 'table':
      return ['tableau'];
    case 'bar_chart':
      return ['axe X', 'axe Y'];
    case 'pie_chart':
      return ['catégorie', 'valeur'];
    default:
      return [];
  }
}
