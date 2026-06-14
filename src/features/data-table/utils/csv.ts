import type { Employee } from '../types';

export function exportToCsv(rows: Employee[], filename: string) {
  const headers = ['Name', 'Email', 'Department', 'Salary', 'Start Date'];

  const csvRows = rows.map((r) =>
    [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.email}"`,
      `"${r.department}"`,
      r.salary,
      r.startDate,
    ].join(','),
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
