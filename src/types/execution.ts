/** Étapes affichées pendant l’exécution du pipeline. */
export type PipelineRunPhase = 'pipeline' | 'chart';

export function runPhaseLabel(phase: PipelineRunPhase): string {
  return phase === 'chart'
    ? 'Finalisation du graphique…'
    : 'Traitement Pandas sur le moteur ETL…';
}

export function runPhaseProgress(phase: PipelineRunPhase): number {
  return phase === 'chart' ? 78 : 42;
}
