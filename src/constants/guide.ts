import { BRAND } from './branding';

export type GuideSectionId =
  | 'start'
  | 'canvas'
  | 'palette'
  | 'params'
  | 'run'
  | 'copilot'
  | 'rag';

export interface GuideTip {
  title: string;
  detail: string;
  shortcut?: string;
}

export interface GuideSection {
  id: GuideSectionId;
  title: string;
  subtitle: string;
  icon: GuideSectionId;
  tips: GuideTip[];
}

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'start',
    title: 'Démarrage rapide',
    subtitle: 'Votre premier pipeline en 4 gestes',
    icon: 'start',
    tips: [
      { title: 'Glisser un bloc CSV', detail: 'Depuis la palette gauche, déposez « CSV » sur le canevas.' },
      { title: 'Importer les transactions', detail: 'Sélectionnez le nœud CSV → panneau droit → choisir un fichier.' },
      { title: 'Enchaîner les blocs', detail: 'Filtre → Grouper → Graphique : reliez les ● entre chaque bloc.' },
      { title: 'Valider', detail: 'Barre du bas → « Valider le pipeline » (ou Ctrl+Entrée) pour afficher le reporting.' },
      {
        title: 'Sauvegardes & modèles',
        detail:
          'En bas de la palette : enregistrez votre flux ou chargez un modèle métier (filtres, agrégations, graphiques).',
      },
    ],
  },
  {
    id: 'canvas',
    title: 'Canevas',
    subtitle: 'Composer et naviguer dans le flux',
    icon: 'canvas',
    tips: [
      { title: 'Relier les blocs', detail: 'Tirez depuis le ● à droite vers le ● à gauche du bloc suivant.', shortcut: 'Glisser' },
      { title: 'Déplacer la vue', detail: 'Molette pour faire défiler · glisser le fond pour vous déplacer.', shortcut: 'Molette' },
      { title: 'Zoom', detail: 'Ctrl + molette pour zoomer avant ou arrière.', shortcut: 'Ctrl + molette' },
      { title: 'Sélection & suppression', detail: 'Clic sur un nœud pour le configurer · Suppr pour le retirer.', shortcut: 'Suppr' },
    ],
  },
  {
    id: 'palette',
    title: 'Palette',
    subtitle: 'Sources, transformations, visualisations',
    icon: 'palette',
    tips: [
      { title: 'Trois familles de blocs', detail: 'Sources (CSV, JSON, SQL), transformations et reporting (tableau, graphiques).' },
      { title: 'Ajouter au pipeline', detail: 'Glissez-déposez un bloc sur le canevas.', shortcut: 'Drag & drop' },
      { title: 'Bibliothèque', detail: 'Bouton « Sauvegardes & modèles » : 7 pipelines types banque prêts à personnaliser.' },
      { title: 'Masquer la palette', detail: 'Icônes mise en page dans l’en-tête pour gagner de l’espace.' },
    ],
  },
  {
    id: 'params',
    title: 'Paramètres',
    subtitle: 'Règles métier par bloc',
    icon: 'params',
    tips: [
      { title: 'Panneau contextuel', detail: 'Chaque nœud sélectionné affiche ses champs métier.' },
      {
        title: 'Largeur du panneau',
        detail: 'Tirez la barre verticale entre le canevas et les paramètres pour agrandir l’aperçu des données.',
        shortcut: 'Glisser',
      },
      {
        title: 'Import & aperçu',
        detail:
          'Après import, les colonnes et un extrait des lignes s’affichent sous le bloc source — le schéma alimente aussi le copilote.',
      },
      { title: 'Ajouter colonne', detail: 'Assistant intégré : listes + formule générée.' },
    ],
  },
  {
    id: 'run',
    title: 'Exécution',
    subtitle: 'Résultats & export',
    icon: 'run',
    tips: [
      {
        title: 'Lancer le pipeline',
        detail: '« Valider le pipeline » ou Ctrl+Entrée envoie le graphe au moteur Pandas.',
        shortcut: 'Ctrl+Entrée',
      },
      {
        title: 'Métriques',
        detail: 'Après validation : nombre de lignes, transformations et durée sous les résultats.',
      },
      { title: 'Consulter les résultats', detail: 'Tableau, barres ou secteurs — panneau repliable en bas.' },
      { title: 'Exporter', detail: 'CSV ou Excel depuis le reporting.' },
    ],
  },
  {
    id: 'copilot',
    title: 'Copilote IA',
    subtitle: 'Règles en français → blocs Pandas',
    icon: 'copilot',
    tips: [
      { title: 'Ouvrir le copilote', detail: 'Bouton « Copilote » — décrivez une règle en langage naturel.' },
      { title: 'Génération automatique', detail: 'Ex. « Filtre les virements > 5 000 € » → blocs sur le canevas.' },
      { title: 'Code visible', detail: 'Le code Pandas généré reste consultable pour audit.' },
    ],
  },
  {
    id: 'rag',
    title: 'Assistant documents',
    subtitle: 'RAG sur PDF, TXT, Markdown',
    icon: 'rag',
    tips: [
      { title: 'Bulle en bas à droite', detail: 'Chat pour notes internes et documentation réglementaire.' },
      { title: 'Joindre un fichier', detail: 'Épingle dans la zone de saisie — puis questions en français.', shortcut: 'Épingle' },
      { title: 'Sources citées', detail: 'Réponses avec extraits du document (traçabilité).' },
    ],
  },
];

/** Sélecteurs DOM pour le parcours guidé (spotlight). */
export const TOUR_TARGET_SELECTORS = {
  'header-brand': '[data-tour="header-brand"]',
  palette: '[data-tour="palette"]',
  canvas: '[data-tour="canvas"]',
  params: '[data-tour="params"]',
  execution: '[data-tour="execution"]',
  'header-nav': '[data-tour="header-nav"]',
  copilot: '[data-tour="copilot-nav"]',
  'copilot-drawer': '[data-tour="copilot-drawer"]',
  rag: '[data-tour="rag-fab"]',
  help: '[data-tour="help-nav"]',
} as const;

export type TourTargetId = keyof typeof TOUR_TARGET_SELECTORS;

export type OnboardingAction =
  | 'none'
  | 'show-palette'
  | 'show-params'
  | 'show-run'
  | 'show-all-panels'
  | 'close-copilot'
  | 'close-rag'
  | 'open-copilot'
  | 'open-rag';

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface SpotlightTourStep {
  id: string;
  title: string;
  description: string;
  /** Cible à surligner ; null = carte centrée (intro du tour). */
  target: TourTargetId | null;
  placement: TourPlacement;
  prepare?: OnboardingAction[];
}

export const SPOTLIGHT_TOUR_STEPS: SpotlightTourStep[] = [
  {
    id: 'welcome',
    title: `Bienvenue dans l’atelier ${BRAND.name}`,
    description:
      'Nous allons parcourir chaque zone de l’interface et voir ce qu’elle permet de faire. Suivez les encadrés lumineux.',
    target: null,
    placement: 'center',
    prepare: ['show-all-panels', 'close-copilot', 'close-rag'],
  },
  {
    id: 'brand',
    title: 'En-tête · Identité & navigation',
    description:
      'Le bandeau rappelle le contexte bancaire / FinTech. À droite : mise en page, Accueil, Aide, Copilote.',
    target: 'header-brand',
    placement: 'bottom',
    prepare: ['show-all-panels', 'close-copilot', 'close-rag'],
  },
  {
    id: 'layout',
    title: 'Mise en page',
    description:
      'Ces trois icônes affichent ou masquent la palette (gauche), la zone d’exécution (bas) et les paramètres (droite).',
    target: 'header-nav',
    placement: 'bottom',
    prepare: ['show-all-panels', 'close-copilot', 'close-rag'],
  },
  {
    id: 'palette',
    title: 'Palette · Blocs ETL',
    description:
      'Sources (CSV), transformations (filtre, grouper, trier, colonne calculée) et visualisations (tableau, graphiques). Glissez un bloc sur le canevas.',
    target: 'palette',
    placement: 'right',
    prepare: ['show-palette', 'close-copilot', 'close-rag'],
  },
  {
    id: 'canvas',
    title: 'Canevas · Pipeline visuel',
    description:
      'Construisez le flux en reliant les blocs (● droite → ● gauche). Molette = déplacer · Ctrl + molette = zoom · Suppr = supprimer un nœud.',
    target: 'canvas',
    placement: 'top',
    prepare: ['show-all-panels', 'close-copilot', 'close-rag'],
  },
  {
    id: 'params',
    title: 'Paramètres · Règles métier',
    description:
      'Cliquez un nœud pour modifier colonnes, seuils, formules. Sur le bloc CSV : importez votre fichier — les colonnes détectées alimentent l’IA.',
    target: 'params',
    placement: 'left',
    prepare: ['show-params', 'close-copilot', 'close-rag'],
  },
  {
    id: 'execution',
    title: 'Exécution · Valider & reporter',
    description:
      '« Valider le pipeline » (Ctrl+Entrée) lance Pandas. Métriques lignes / durée affichées ; export CSV ou Excel.',
    target: 'execution',
    placement: 'top',
    prepare: ['show-run', 'close-copilot', 'close-rag'],
  },
  {
    id: 'copilot',
    title: 'Copilote IA · Langage naturel',
    description:
      'Décrivez une règle en français (ex. grouper par agence). DataPipe génère le code Pandas et ajoute les blocs sur le canevas.',
    target: 'copilot-drawer',
    placement: 'left',
    prepare: ['open-copilot', 'close-rag'],
  },
  {
    id: 'rag',
    title: 'Assistant documents · RAG',
    description:
      'Indexez PDF / TXT / MD via l’épingle, posez des questions sur vos procédures. Les réponses citent les sources utilisées.',
    target: 'rag',
    placement: 'left',
    prepare: ['close-copilot', 'open-rag'],
  },
  {
    id: 'help',
    title: 'Aide · Guide détaillé',
    description:
      'Retrouvez à tout moment le guide par zone, le parcours interactif, ou rouvrez cette présentation via Accueil.',
    target: 'help',
    placement: 'bottom',
    prepare: ['close-copilot', 'close-rag', 'show-all-panels'],
  },
  {
    id: 'done',
    title: 'Vous êtes prêt',
    description:
      'Importez transactions.csv, composez un flux, validez le pipeline. Bon hackathon.',
    target: null,
    placement: 'center',
    prepare: ['close-copilot', 'close-rag', 'show-all-panels'],
  },
];

/** @deprecated Utiliser SPOTLIGHT_TOUR_STEPS */
export const ONBOARDING_STEPS = SPOTLIGHT_TOUR_STEPS;

export const ONBOARDING_STORAGE_KEY = 'datapipe_onboarding_spotlight_v1';

export const USAGE_GUIDE = {
  title: 'Comment utiliser DataPipe',
  sections: GUIDE_SECTIONS.map((s) => ({
    title: s.title,
    items: s.tips.map((t) => `${t.title} : ${t.detail}`),
  })),
} as const;
