import type { PipelineResult } from '../types';
import {
  filterPieRows,
  resolveBarChartKeys,
  resolvePieChartKeys,
} from '../utils/chartData';
import { ExportDataButtons } from './ExportDataButtons';
import { DataTable } from './charts/DataTable';
import { BarChartView } from './charts/BarChartView';
import { PieChartView } from './charts/PieChartView';

interface ResultsPanelProps {
  result: PipelineResult | null;
  onClose: () => void;
}

export function ResultsPanel({ result, onClose }: ResultsPanelProps) {
  if (!result) return null;

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
        {result?.result_type === 'table' && (
          <div className="results-panel__block">
            <p className="result-label">Relevé des opérations</p>
            <DataTable data={result.data} />
          </div>
        )}

        {result?.result_type === 'bar_chart' && barKeys && result.data.length > 0 && (
          <div className="results-panel__block results-panel__block--chart">
            <p className="result-label">Graphique barres</p>
            <ExportDataButtons data={result.data} className="export-data-actions--chart" />
            <BarChartView data={result.data} xKey={barKeys.xKey} yKey={barKeys.yKey} />
          </div>
        )}

        {result?.result_type === 'pie_chart' && pieKeys && pieData.length > 0 && (
          <div className="results-panel__block results-panel__block--chart">
            <p className="result-label">Graphique circulaire</p>
            <ExportDataButtons data={pieData} className="export-data-actions--chart" />
            <PieChartView
              data={pieData}
              categoryKey={pieKeys.categoryKey}
              valueKey={pieKeys.valueKey}
            />
          </div>
        )}

        {result?.result_type === 'pie_chart' && pieData.length === 0 && result.data.length > 0 && (
          <div className="results-panel__block">
            <p className="panel-hint">
              Impossible d’afficher le graphique circulaire. Vérifiez les axes Catégorie et Valeur dans les
              paramètres du bloc, ou ajoutez un bloc Grouper en amont.
            </p>
            <DataTable data={result.data} />
          </div>
        )}

        {result?.result_type === 'pie_chart' && pieData.length === 0 && result.data.length === 0 && (
          <p className="panel-hint">Aucune donnée à afficher pour ce graphique.</p>
        )}

        {result?.result_type === 'bar_chart' && result.data.length === 0 && (
          <p className="panel-hint">Aucune donnée à afficher pour ce graphique.</p>
        )}
      </div>
    </section>
  );
}
