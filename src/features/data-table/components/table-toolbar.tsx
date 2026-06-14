import type { Table } from '@tanstack/react-table';
import { Download, FilterX, Search, Table2, List } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import type { ColumnConfig } from '../types';
import { exportToCsv } from '../utils/csv';

type Props<T extends { id: string }> = {
  table: Table<T>;
  columns: ColumnConfig<T>[];
  isVirtual: boolean;
  onToggleMode: () => void;
  filteredCount: number;
};

export function TableToolbar<T extends { id: string }>({
  table,
  columns: columnConfigs,
  isVirtual,
  onToggleMode,
  filteredCount,
}: Props<T>) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const globalFilter = table.getState().globalFilter as string | undefined;

  const filterableColumns = columnConfigs.filter(
    (c) => c.enableFilter !== false,
  );

  function getFilterValue(colId: string): unknown {
    return table.getColumn(colId)?.getFilterValue();
  }

  function setFilterValue(colId: string, value: unknown) {
    table.getColumn(colId)?.setFilterValue(value);
  }

  const hasFilters = !!(
    globalFilter ||
    filterableColumns.some((col) => {
      const val = getFilterValue(col.id);
      if (col.type === 'number') {
        const [min, max] = (val as [
          number | undefined,
          number | undefined,
        ]) ?? [undefined, undefined];
        return min != null || max != null;
      }
      return !!val;
    })
  );

  function clearFilters() {
    table.resetGlobalFilter();
    table.resetColumnFilters();
  }

  function handleExport() {
    const rows = table.getFilteredRowModel().rows.map((r) => r.original);
    exportToCsv(rows, columnConfigs, `export-${Date.now()}.csv`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Search all columns..."
            value={globalFilter ?? ''}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          Filters
          {hasFilters && (
            <span className="ml-1.5 size-2 rounded-full bg-primary" />
          )}
        </Button>

        <Button
          variant={isVirtual ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleMode}
          title={isVirtual ? 'Switch to paginated' : 'Switch to virtual scroll'}
        >
          {isVirtual ? (
            <>
              <List className="mr-1.5 size-4" />
              Paginated
            </>
          ) : (
            <>
              <Table2 className="mr-1.5 size-4" />
              Virtual
            </>
          )}
        </Button>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-1.5 size-4" />
          Export CSV
        </Button>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <FilterX className="mr-1.5 size-4" />
            Clear
          </Button>
        )}
      </div>

      {filtersOpen && (
        <div className="flex flex-wrap gap-3 rounded-lg border bg-muted/30 p-3">
          {filterableColumns.map((col) => {
            if (col.type === 'select' && col.options) {
              const val = getFilterValue(col.id) as string | undefined;
              return (
                <div key={col.id} className="space-y-1">
                  <label
                    className="text-xs font-medium text-muted-foreground"
                    htmlFor={`filter-${col.id}`}
                  >
                    {col.header}
                  </label>
                  <select
                    id={`filter-${col.id}`}
                    className={cn(
                      'h-9 rounded-md border border-input bg-background px-3 py-1 text-sm',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                    value={val ?? ''}
                    onChange={(e) =>
                      setFilterValue(col.id, e.target.value || undefined)
                    }
                  >
                    <option value="">All</option>
                    {col.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (col.type === 'number') {
              const [min, max] = (getFilterValue(col.id) as [
                number | undefined,
                number | undefined,
              ]) ?? [undefined, undefined];
              return (
                <div key={col.id} className="space-y-1">
                  <label
                    className="text-xs font-medium text-muted-foreground"
                    htmlFor={`filter-${col.id}-min`}
                  >
                    {col.header} range
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      id={`filter-${col.id}-min`}
                      className="h-9 max-w-[110px] rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      type="number"
                      placeholder="Min"
                      value={min ?? ''}
                      onChange={(e) =>
                        setFilterValue(col.id, [
                          e.target.value ? Number(e.target.value) : undefined,
                          max,
                        ])
                      }
                    />
                    <span className="text-muted-foreground">—</span>
                    <input
                      id={`filter-${col.id}-max`}
                      className="h-9 max-w-[110px] rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      type="number"
                      placeholder="Max"
                      value={max ?? ''}
                      onChange={(e) =>
                        setFilterValue(col.id, [
                          min,
                          e.target.value ? Number(e.target.value) : undefined,
                        ])
                      }
                    />
                  </div>
                </div>
              );
            }

            if (col.type === 'text' || col.type === 'date') {
              const val = getFilterValue(col.id) as string | undefined;
              return (
                <div key={col.id} className="space-y-1">
                  <label
                    className="text-xs font-medium text-muted-foreground"
                    htmlFor={`filter-${col.id}`}
                  >
                    {col.header}
                  </label>
                  <input
                    id={`filter-${col.id}`}
                    className="h-9 max-w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder={`Filter by ${col.header.toLowerCase()}...`}
                    value={val ?? ''}
                    onChange={(e) =>
                      setFilterValue(col.id, e.target.value || undefined)
                    }
                  />
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        {filteredCount.toLocaleString()} row{filteredCount !== 1 ? 's' : ''}{' '}
        {isVirtual
          ? '(virtual scroll — all rows loaded)'
          : `(page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()})`}
      </div>
    </div>
  );
}
