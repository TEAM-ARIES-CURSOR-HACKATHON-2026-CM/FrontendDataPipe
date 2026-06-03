const DEFAULT_CSV_NAME = 'datapipe-reporting.csv';
const DEFAULT_XLSX_NAME = 'datapipe-reporting.xlsx';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportReportingCsv(
  data: Record<string, unknown>[],
  filename = DEFAULT_CSV_NAME,
): void {
  if (!data.length) return;
  const cols = Object.keys(data[0]);
  const lines = [
    cols.join(','),
    ...data.map((row) =>
      cols.map((c) => {
        const v = String(row[c] ?? '');
        return v.includes(',') || v.includes('"') || v.includes('\n')
          ? `"${v.replace(/"/g, '""')}"`
          : v;
      }).join(','),
    ),
  ];
  const blob = new Blob(['\uFEFF', lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, filename);
}

/** Exporte les lignes du reporting au format Excel (.xlsx). */
export async function exportReportingExcel(
  data: Record<string, unknown>[],
  filename = DEFAULT_XLSX_NAME,
): Promise<void> {
  if (!data.length) return;
  const XLSX = await import('xlsx');
  const sheet = XLSX.utils.json_to_sheet(data);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Reporting');
  XLSX.writeFile(book, filename);
}
