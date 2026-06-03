import { useState } from 'react';
import { exportReportingCsv, exportReportingExcel } from '../utils/exportReporting';

interface ExportDataButtonsProps {
  data: Record<string, unknown>[];
  className?: string;
}

export function ExportDataButtons({ data, className = '' }: ExportDataButtonsProps) {
  const [excelLoading, setExcelLoading] = useState(false);

  if (!data.length) return null;

  const handleExcel = async () => {
    setExcelLoading(true);
    try {
      await exportReportingExcel(data);
    } finally {
      setExcelLoading(false);
    }
  };

  return (
    <div className={`export-data-actions ${className}`.trim()}>
      <button
        type="button"
        className="btn btn--secondary btn--sm"
        onClick={() => exportReportingCsv(data)}
      >
        Exporter CSV
      </button>
      <button
        type="button"
        className="btn btn--secondary btn--sm"
        disabled={excelLoading}
        onClick={() => void handleExcel()}
      >
        {excelLoading ? 'Export…' : 'Exporter Excel'}
      </button>
    </div>
  );
}
