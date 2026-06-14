import type { Table } from '@tanstack/react-table';
import { Download, FilterX, Search, Table2, List } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import type { Employee } from '../types';
import { DEPARTMENTS } from '../types';
import { exportToCsv } from '../utils/csv';

type Props = {
  table: Table<Employee>;
  isVirtual: boolean;
  onToggleMode: () => void;
  filteredCount: number;
};

export function TableToolbar({
  table,
  isVirtual,
  onToggleMode,
  filteredCount,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const globalFilter = table.getState().globalFilter;

  const nameFilter = table.getColumn('name')?.getFilterValue() as
    | string
    | undefined;
  const emailFilter = table.getColumn('email')?.getFilterValue() as
    | string
    | undefined;
  const deptFilter = table.getColumn('department')?.getFilterValue() as
    | string
    | undefined;
  const salaryMin = (
    table.getColumn('salary')?.getFilterValue() as [number, number]
  )?.[0];
  const salaryMax = (
    table.getColumn('salary')?.getFilterValue() as [number, number]
  )?.[1];

  function clearFilters() {
    table.resetGlobalFilter();
    table.resetColumnFilters();
  }

  function handleExport() {
    const rows = table.getFilteredRowModel().rows.map((r) => r.original);
    exportToCsv(rows, `employees-${Date.now()}.csv`);
  }

  const hasFilters = !!(
    globalFilter ||
    nameFilter ||
    emailFilter ||
    deptFilter ||
    salaryMin != null ||
    salaryMax != null
  );

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
          <div className="space-y-1">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="filter-name"
            >
              Name
            </label>
            <input
              id="filter-name"
              className="h-9 max-w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Filter by name..."
              value={nameFilter ?? ''}
              onChange={(e) =>
                table.getColumn('name')?.setFilterValue(e.target.value)
              }
            />
          </div>
          <div className="space-y-1">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="filter-email"
            >
              Email
            </label>
            <input
              id="filter-email"
              className="h-9 max-w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Filter by email..."
              value={emailFilter ?? ''}
              onChange={(e) =>
                table.getColumn('email')?.setFilterValue(e.target.value)
              }
            />
          </div>
          <div className="space-y-1">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="filter-dept"
            >
              Department
            </label>
            <select
              id="filter-dept"
              className={cn(
                'h-9 rounded-md border border-input bg-background px-3 py-1 text-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              value={deptFilter ?? ''}
              onChange={(e) =>
                table
                  .getColumn('department')
                  ?.setFilterValue(e.target.value || undefined)
              }
            >
              <option value="">All</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="filter-salary-min"
            >
              Salary range
            </label>
            <div className="flex items-center gap-1">
              <input
                id="filter-salary-min"
                className="h-9 max-w-[110px] rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                type="number"
                placeholder="Min"
                value={salaryMin ?? ''}
                onChange={(e) =>
                  table
                    .getColumn('salary')
                    ?.setFilterValue([
                      e.target.value ? Number(e.target.value) : undefined,
                      salaryMax,
                    ])
                }
              />
              <span className="text-muted-foreground">—</span>
              <input
                id="filter-salary-max"
                className="h-9 max-w-[110px] rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                type="number"
                placeholder="Max"
                value={salaryMax ?? ''}
                onChange={(e) =>
                  table
                    .getColumn('salary')
                    ?.setFilterValue([
                      salaryMin,
                      e.target.value ? Number(e.target.value) : undefined,
                    ])
                }
              />
            </div>
          </div>
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
