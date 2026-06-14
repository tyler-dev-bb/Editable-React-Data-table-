import type { ColumnConfig } from '../types';

export function exportToCsv<T extends { id: string }>(
  rows: T[],
  columns: ColumnConfig<T>[],
  filename: string,
) {
  const exportable = columns.filter((c) => c.exportable !== false);
  const headers = exportable.map((c) => c.header);

  const csvRows = rows.map((row) =>
    exportable
      .map((col) => {
        const value = row[col.accessorKey];
        const str = String(value ?? '');
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(','),
  );

  const csv = [headers.join(','), ...csvRows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
