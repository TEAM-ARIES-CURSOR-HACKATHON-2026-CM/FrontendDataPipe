/** Identité métier — secteur bancaire & FinTech */
export const BRAND = {
  name: 'DataPipe',
  tagline: 'ETL visuel pour analystes bancaires',
  sector: 'Banque · FinTech · Data Engineering',
  productLine: 'Pipeline transactionnel & reporting',
} as const;

/** Pastilles discrètes — rappel du domaine finance / banque */
export const FINANCE_BADGES = ['Transactions', 'Reporting', 'Conformité'] as const;

export const SOURCE_FORMATS_LABEL = 'CSV, JSON ou SQL';

export const PALETTE_CATEGORIES = {
  source: { title: 'Sources données', hint: `${SOURCE_FORMATS_LABEL} — journaux et exports` },
  transform: { title: 'Contrôles & agrégations', hint: 'Filtres, regroupements, calculs' },
  viz: { title: 'Reporting analyste', hint: 'Tableaux et graphiques métier' },
} as const;

export const DEMO_PIPELINE_LABELS = {
  csv: 'CSV',
  filter: 'Filtre',
  group: 'Grouper',
  bar_chart: 'Graphique barres',
} as const;
