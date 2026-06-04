import { BRAND, FINANCE_BADGES } from './branding';

/** Une fois par onglet / session navigateur (sessionStorage). */
export const INTRO_SESSION_KEY = 'datapipe_intro_session_seen';

export const INTRO_FEATURES = [
  {
    id: 'visual',
    icon: '◇',
    title: 'Pipeline visuel',
    detail: 'Glissez, reliez et exécutez des flux ETL sans écrire de code.',
  },
  {
    id: 'copilot',
    icon: '✦',
    title: 'Copilote IA',
    detail: 'Décrivez une règle en français → blocs Pandas sur le canevas.',
  },
  {
    id: 'rag',
    icon: '◉',
    title: 'Assistant documents',
    detail: 'Interrogez vos PDF et procédures avec sources citées.',
  },
  {
    id: 'reporting',
    icon: '▶',
    title: 'Reporting analyste',
    detail: 'Tableaux, barres, secteurs et export CSV en un clic.',
  },
  {
    id: 'library',
    icon: '⎘',
    title: 'Modèles & sauvegardes',
    detail:
      'En bas de la palette : bibliothèque de pipelines métier et enregistrement de vos flux.',
  },
] as const;

export const INTRO_STEPS = [
  'Importer un CSV transactionnel',
  'Composer filtres & agrégations',
  'Valider et publier le reporting',
] as const;

export { BRAND, FINANCE_BADGES };

/** Afficher l’accueil tant que l’utilisateur n’a pas quitté l’intro dans cette session. */
export function shouldShowIntro(): boolean {
  try {
    return !sessionStorage.getItem(INTRO_SESSION_KEY);
  } catch {
    return true;
  }
}

/** Mémoriser pour la session en cours (nouvel onglet ou navigateur relancé → réaffichage). */
export function markIntroSeen(): void {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}
