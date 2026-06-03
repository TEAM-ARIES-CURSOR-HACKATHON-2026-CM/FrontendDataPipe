/** Identité métier — secteur bancaire & FinTech */
export const BRAND = {
  name: 'DataPipe',
  tagline: 'ETL visuel pour analystes bancaires',
  sector: 'Banque · FinTech · Data Engineering',
  productLine: 'Pipeline transactionnel & reporting',
} as const;

/** Pastilles discrètes — rappel du domaine finance / banque */
export const FINANCE_BADGES = ['Transactions', 'Reporting', 'Conformité'] as const;

export const PALETTE_CATEGORIES = {
  source: { title: 'Sources données', hint: 'Journaux, exports core banking' },
  transform: { title: 'Contrôles & agrégations', hint: 'Filtres, regroupements, calculs' },
  viz: { title: 'Reporting analyste', hint: 'Tableaux et graphiques métier' },
} as const;

export const USAGE_GUIDE = {
  title: 'Comment utiliser DataPipe',
  sections: [
    {
      title: 'Canevas',
      items: [
        'Relier les blocs : tirer depuis le point ● à droite vers le ● à gauche du bloc suivant.',
        'Molette = déplacer le canevas (↔ ↕).',
        'Ctrl + molette = zoom avant / arrière.',
        'Glisser le fond pour vous déplacer dans le pipeline.',
        'Cliquer un nœud pour le sélectionner ; clic sur le fond pour désélectionner.',
        'Supprimer un nœud : touche Suppr ou Retour arrière, ou bouton « Supprimer ce bloc » dans Paramètres.',
      ],
    },
    {
      title: 'Palette (gauche)',
      items: [
        'Onglets Sources, Transform. et Viz pour choisir une catégorie de blocs.',
        'Glisser un bloc sur le canevas pour l’ajouter au pipeline.',
      ],
    },
    {
      title: 'Paramètres (droite)',
      items: [
        'Sélectionnez un nœud pour afficher ses paramètres métier.',
        'Pour un bloc CSV : importer le fichier dans ce panneau avant d’exécuter.',
      ],
    },
    {
      title: 'Exécution (bas)',
      items: [
        'Valider le pipeline pour lancer le traitement et afficher tableau ou graphique.',
        'Un CSV doit être lié au nœud source avant l’exécution.',
      ],
    },
    {
      title: 'Barre de navigation',
      items: [
        'Icônes de mise en page : afficher ou masquer palette, résultats et paramètres.',
        'Copilote : décrire une règle en français pour générer du code Pandas.',
      ],
    },
  ],
} as const;

export const DEMO_PIPELINE_LABELS = {
  csv: 'CSV',
  filter: 'Filtre',
  group: 'Grouper',
  bar_chart: 'Graphique barres',
} as const;
