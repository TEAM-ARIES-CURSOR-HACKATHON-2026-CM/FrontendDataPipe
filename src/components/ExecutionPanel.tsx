import type { PipelineResult, PipelineRunMeta } from '../types';
import type { PipelineRunPhase } from '../types/execution';
import { runPhaseLabel, runPhaseProgress } from '../types/execution';
import { SOURCE_FORMATS_LABEL } from '../constants/branding';
import { formatRunMetrics } from '../utils/pipelineStats';
import { ResultsPanel } from './ResultsPanel';

interface ExecutionPanelProps {
  sourceLinked: boolean;
  sourceFileName: string | null;
  loading: boolean;
  runPhase: PipelineRunPhase | null;
  result: PipelineResult | null;
  runMeta: PipelineRunMeta | null;
  resultsOpen: boolean;
  onRun: () => void;
  onToggleResults: () => void;
}

export function ExecutionPanel({
  sourceLinked,
  sourceFileName,
  loading,
  runPhase,
  result,
  runMeta,
  resultsOpen,
  onRun,
  onToggleResults,
}: ExecutionPanelProps) {
  const hasResults = Boolean(result);
  const progressPct = runPhase ? runPhaseProgress(runPhase) : 0;

  return (
    <div className="execution-zone">
      {resultsOpen && hasResults && (
        <ResultsPanel result={result} runMeta={runMeta} onClose={onToggleResults} />
      )}

      <div className="execution-dock" data-tour="execution">
        <div className="execution-dock__info">
          <span className="execution-dock__label">Pipeline</span>
          <span className="execution-dock__hint">
            {sourceLinked ? (
              <>
                Source : <strong>{sourceFileName}</strong>
              </>
            ) : (
              <>Importez un fichier ({SOURCE_FORMATS_LABEL}) via le bloc source</>
            )}
          </span>
          {runMeta && !loading && (
            <span className="execution-dock__perf">{formatRunMetrics(runMeta)}</span>
          )}
        </div>

        <div className="execution-dock__actions-col">
          <div className="execution-dock__actions">
            {hasResults && (
              <button
                type="button"
                className={`btn btn--secondary ${resultsOpen ? 'btn--secondary-active' : ''}`}
                onClick={onToggleResults}
              >
                {resultsOpen ? 'Masquer résultats' : 'Voir résultats'}
              </button>
            )}
            <button
              type="button"
              className="btn btn--primary"
              onClick={onRun}
              disabled={loading || !sourceLinked}
            >
              {loading ? 'Traitement…' : 'Valider le pipeline'}
            </button>
          </div>
          {sourceLinked && (
            <p className="execution-dock__shortcut">
              <kbd>Ctrl</kbd>+<kbd>Entrée</kbd> pour exécuter
              <span className="execution-dock__shortcut-mac"> · ⌘+Entrée sur Mac</span>
            </p>
          )}
        </div>
      </div>

      {loading && runPhase && (
        <div className="execution-dock__progress" role="status" aria-live="polite">
          <span className="execution-dock__progress-label">{runPhaseLabel(runPhase)}</span>
          <div
            className="execution-dock__progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPct}
          >
            <div
              className="execution-dock__progress-bar execution-dock__progress-bar--active"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
