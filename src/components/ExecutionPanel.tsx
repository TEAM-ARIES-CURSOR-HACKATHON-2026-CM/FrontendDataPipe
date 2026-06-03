import type { PipelineResult } from '../types';
import { ResultsPanel } from './ResultsPanel';

interface ExecutionPanelProps {
  csvLinked: boolean;
  csvFileName: string | null;
  loading: boolean;
  result: PipelineResult | null;
  resultsOpen: boolean;
  onRun: () => void;
  onToggleResults: () => void;
}

export function ExecutionPanel({
  csvLinked,
  csvFileName,
  loading,
  result,
  resultsOpen,
  onRun,
  onToggleResults,
}: ExecutionPanelProps) {
  const hasResults = Boolean(result);

  return (
    <div className="execution-zone">
      {resultsOpen && hasResults && (
        <ResultsPanel result={result} onClose={onToggleResults} />
      )}

      <div className="execution-dock">
        <div className="execution-dock__info">
          <span className="execution-dock__label">Pipeline</span>
          <span className="execution-dock__hint">
            {csvLinked ? (
              <>
                Source : <strong>{csvFileName}</strong>
              </>
            ) : (
              <>Importez un CSV via le nœud sélectionné</>
            )}
          </span>
        </div>

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
            disabled={loading || !csvLinked}
          >
            {loading ? 'Traitement…' : 'Valider le pipeline'}
          </button>
        </div>
      </div>
    </div>
  );
}
