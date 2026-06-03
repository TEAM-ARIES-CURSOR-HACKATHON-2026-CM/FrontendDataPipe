interface DataTableProps {
  data: Record<string, unknown>[];
  onExportCsv?: () => void;
}

export function DataTable({ data, onExportCsv }: DataTableProps) {
  if (!data.length) {
    return <p className="empty-result">Aucune donnée à afficher.</p>;
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="data-table-wrap">
      {onExportCsv && (
        <button type="button" className="btn btn--secondary btn--sm" onClick={onExportCsv}>
          Exporter CSV
        </button>
      )}
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 200).map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col}>{String(row[col] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 200 && (
          <p className="panel-hint">… {data.length - 200} lignes supplémentaires</p>
        )}
      </div>
    </div>
  );
}
