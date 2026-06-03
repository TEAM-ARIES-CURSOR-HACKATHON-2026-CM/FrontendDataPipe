import type { PipelineResult } from '../types';
import {
  filterPieRows,
  resolveBarChartKeys,
  resolvePieChartKeys,
} from '../utils/chartData';
import { DataTable } from './charts/DataTable';
import { BarChartView } from './charts/BarChartView';
import { PieChartView } from './charts/PieChartView';

interface ResultsPanelProps {
  result: PipelineResult | null;
  error: string | null;
  onClose: () => void;
}

function exportCsv(data: Record<string, unknown>[]) {
  if (!data.length) return;
  const cols = Object.keys(data[0]);
  const lines = [
    cols.join(','),
    ...data.map((row) =>
      cols.map((c) => {
        const v = String(row[c] ?? '');
        return v.includes(',') ? `"${v.replace(/"/g, '""')}"` : v;
      }).join(','),
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'datapipe-reporting.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function ResultsPanel({ result, error, onClose }: ResultsPanelProps) {
  if (!result && !error) return null;

  const barKeys = result?.result_type === 'bar_chart' ? resolveBarChartKeys(result) : null;
  const pieKeys = result?.result_type === 'pie_chart' ? resolvePieChartKeys(result) : null;
  const pieData =
    result?.result_type === 'pie_chart' && pieKeys
      ? filterPieRows(result.data, pieKeys.categoryKey, pieKeys.valueKey)
      : [];

  return (
    <section className="results-panel" aria-label="Résultats du pipeline">
      <header className="results-panel__head">
        <div>
          <h3 className="results-panel__title">Résultats</h3>
          {result?.row_count != null && (
            <p className="results-panel__meta">{result.row_count} lignes · pipeline validé</p>
          )}
        </div>
        <button type="button" className="results-panel__close" onClick={onClose} aria-label="Réduire">
          Réduire ▾
        </button>
      </header>

      <div className="results-panel__body">
        {error && <div className="alert alert--error">{error}</div>}

        {result?.result_type === 'table' && (
          <div className="results-panel__block">
            <p className="result-label">Relevé des opérations</p>
            <DataTable data={result.data} onExportCsv={() => exportCsv(result.data)} />
          </div>
        )}

        {result?.result_type === 'bar_chart' && barKeys && result.data.length > 0 && (
          <div className="results-panel__block results-panel__block--chart">
            <p className="result-label">Graphique barres</p>
            <BarChartView data={result.data} xKey={barKeys.xKey} yKey={barKeys.yKey} />
          </div>
        )}

        {result?.result_type === 'pie_chart' && pieKeys && pieData.length > 0 && (
          <div className="results-panel__block results-panel__block--chart">
            <p className="result-label">Graphique circulaire</p>
            <PieChartView
              data={pieData}
              categoryKey={pieKeys.categoryKey}
              valueKey={pieKeys.valueKey}
            />
          </div>
        )}

        {result?.result_type === 'pie_chart' && pieData.length === 0 && (
          <p className="panel-hint">
            Données insuffisantes pour le graphique. Essayez un bloc Grouper avant la visualisation.
          </p>
        )}

        {result?.result_type === 'bar_chart' && result.data.length === 0 && (
          <p className="panel-hint">Aucune donnée à afficher pour ce graphique.</p>
        )}
      </div>
    </section>
  );
}
