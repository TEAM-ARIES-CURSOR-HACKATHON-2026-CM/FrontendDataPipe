interface SourceDataPreviewProps {
  columns: string[];
  preview: Record<string, unknown>[];
  rowCount?: number;
}

const MAX_PREVIEW_ROWS = 10;

export function SourceDataPreview({ columns, preview, rowCount }: SourceDataPreviewProps) {
  if (!columns.length) return null;

  const rows = preview.slice(0, MAX_PREVIEW_ROWS);
  const total = rowCount ?? preview.length;

  return (
    <div className="source-preview" aria-label="Aperçu des données importées">
      <p className="source-preview__title">
        Schéma détecté
        {total > 0 && (
          <span className="source-preview__count">
            {' '}
            · {total} ligne{total > 1 ? 's' : ''}
          </span>
        )}
      </p>
      <ul className="source-preview__columns">
        {columns.map((col) => (
          <li key={col} className="source-preview__col">
            {col}
          </li>
        ))}
      </ul>
      {rows.length > 0 && (
        <div className="source-preview__table-wrap">
          <table className="source-preview__table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col}>{String(row[col] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {total > MAX_PREVIEW_ROWS && (
            <p className="source-preview__more">
              … {total - MAX_PREVIEW_ROWS} ligne{total - MAX_PREVIEW_ROWS > 1 ? 's' : ''}{' '}
              supplémentaire{total - MAX_PREVIEW_ROWS > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
