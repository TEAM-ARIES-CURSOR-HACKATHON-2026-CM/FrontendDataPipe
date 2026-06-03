import type { PipelineResult } from '../types';
import { DataTable } from './charts/DataTable';
import { BarChartView } from './charts/BarChartView';
import { PieChartView } from './charts/PieChartView';

interface ExecutionPanelProps {
  fileName: string | null;
  columns: string[];
  loading: boolean;
  error: string | null;
  result: PipelineResult | null;
  onUpload: (file: File) => void;
  onRun: () => void;
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
  a.download = 'datapipe-resultat.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function ExecutionPanel({
  fileName,
  columns,
  loading,
  error,
  result,
  onUpload,
  onRun,
}: ExecutionPanelProps) {
  return (
    <section className="execution">
      <div className="execution__toolbar">
        <label className="btn btn--secondary file-btn">
          {fileName ? fileName : 'Choisir CSV'}
          <input
            type="file"
            accept=".csv"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
            }}
          />
        </label>
        {columns.length > 0 && (
          <span className="execution__meta">{columns.length} colonnes détectées</span>
        )}
        <button type="button" className="btn btn--primary" onClick={onRun} disabled={loading || !fileName}>
          {loading ? 'Exécution…' : 'Exécuter le pipeline'}
        </button>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="execution__result">
        {!result && !error && (
          <p className="panel-hint">
            Pipeline de démo : CSV → Filtre (montant &gt; 5000) → Grouper → Graphique barres
          </p>
        )}
        {result?.result_type === 'table' && (
          <DataTable data={result.data} onExportCsv={() => exportCsv(result.data)} />
        )}
        {result?.result_type === 'bar_chart' && (
          <BarChartView
            data={result.data}
            xKey={result.chart?.xKey ?? 'client_id'}
            yKey={result.chart?.yKey ?? 'montant'}
          />
        )}
        {result?.result_type === 'pie_chart' && (
          <PieChartView
            data={result.data}
            categoryKey={result.chart?.categoryKey ?? 'type'}
            valueKey={result.chart?.valueKey ?? 'montant'}
          />
        )}
      </div>
    </section>
  );
}
