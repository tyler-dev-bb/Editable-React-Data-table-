import type { ColumnConfig } from '../types';

type Props<T extends { id: string }> = {
  value: unknown;
  column: ColumnConfig<T>;
  row: T;
  isEditing: boolean;
  shouldFocus: boolean;
  onChange: (field: keyof T, value: unknown) => void;
};

export function EditableCell<T extends { id: string }>({
  value,
  column,
  row,
  isEditing,
  shouldFocus,
  onChange,
}: Props<T>) {
  if (!isEditing) {
    if (column.cell) {
      return <>{column.cell(value, row)}</>;
    }
    if (column.type === 'number') {
      return <span>{(value as number)?.toLocaleString()}</span>;
    }
    return <span>{String(value ?? '')}</span>;
  }

  const currentValue = value;

  if (column.editCell) {
    return (
      <>
        {column.editCell(currentValue, row, (v) =>
          onChange(column.accessorKey, v),
        )}
      </>
    );
  }

  if (column.type === 'select' && column.options) {
    return (
      <select
        className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={String(currentValue ?? '')}
        onChange={(e) => onChange(column.accessorKey, e.target.value)}
        ref={(el) => {
          if (shouldFocus) el?.focus();
        }}
      >
        <option value="">Select...</option>
        {column.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (column.type === 'number') {
    return (
      <input
        className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        type="number"
        value={Number(currentValue ?? 0)}
        onChange={(e) => onChange(column.accessorKey, Number(e.target.value))}
        ref={(el) => {
          if (shouldFocus) el?.focus();
        }}
      />
    );
  }

  if (column.type === 'date') {
    return (
      <input
        className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        type="date"
        value={String(currentValue ?? '')}
        onChange={(e) => onChange(column.accessorKey, e.target.value)}
        ref={(el) => {
          if (shouldFocus) el?.focus();
        }}
      />
    );
  }

  return (
    <input
      className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      type="text"
      value={String(currentValue ?? '')}
      onChange={(e) => onChange(column.accessorKey, e.target.value)}
      ref={(el) => {
        if (shouldFocus) el?.focus();
      }}
    />
  );
}
