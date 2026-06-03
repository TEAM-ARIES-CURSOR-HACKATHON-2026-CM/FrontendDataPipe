import type { PipelineResult } from '../types';
import { SOURCE_FORMATS_LABEL } from '../constants/branding';
import { ResultsPanel } from './ResultsPanel';

interface ExecutionPanelProps {
  sourceLinked: boolean;
  sourceFileName: string | null;
  loading: boolean;
  result: PipelineResult | null;
  resultsOpen: boolean;
  onRun: () => void;
  onToggleResults: () => void;
}

export function ExecutionPanel({
  sourceLinked,
  sourceFileName,
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
            disabled={loading || !sourceLinked}
          >
            {loading ? 'Traitement…' : 'Valider le pipeline'}
          </button>
        </div>
      </div>
    </div>
  );
}
