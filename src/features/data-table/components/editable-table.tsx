import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useRef, useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import { useEditStore } from '../store/edit-store';
import type { Employee } from '../types';

import { EditableCell } from './editable-cell';
import { RowActions } from './row-actions';
import { TableHeaderCell } from './table-header';
import { TableToolbar } from './table-toolbar';

const columnHelper = createColumnHelper<Employee>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: 'includesString',
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: 'includesString',
  }),
  columnHelper.accessor('department', {
    header: 'Department',
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: 'equalsString',
  }),
  columnHelper.accessor('salary', {
    header: 'Salary',
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: (row, _columnId, filterValue) => {
      const [min, max] = filterValue as [
        number | undefined,
        number | undefined,
      ];
      const value = row.getValue<number>('salary');
      if (min != null && value < min) return false;
      if (max != null && value > max) return false;
      return true;
    },
  }),
  columnHelper.accessor('startDate', {
    header: 'Start Date',
    enableSorting: true,
    enableColumnFilter: false,
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    enableSorting: false,
    enableColumnFilter: false,
  }),
];

type Props = {
  employees: Employee[];
  isVirtual: boolean;
  onToggleMode: () => void;
};

export function EditableTable({ employees, isVirtual, onToggleMode }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [clickedField, setClickedField] = useState<keyof Employee | null>(null);

  const editingRowId = useEditStore((s) => s.editingRowId);
  const startEditing = useEditStore((s) => s.startEditing);

  const autoSave = useCallback(() => {
    const state = useEditStore.getState();
    if (state.editingRowId) {
      state.saveRow();
    }
  }, []);

  const table = useReactTable({
    data: employees,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      ...(isVirtual ? {} : { pagination }),
    },
    onSortingChange: (updater) => {
      if (typeof updater === 'function') {
        autoSave();
        setSorting(updater(sorting));
      } else {
        autoSave();
        setSorting(updater);
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: isVirtual
      ? undefined
      : (updater) => {
          if (typeof updater === 'function') {
            autoSave();
            setPagination(updater(pagination));
          } else {
            autoSave();
            setPagination(updater);
          }
        },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(isVirtual ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    enableMultiSort: true,
  });

  const { rows } = table.getRowModel();

  const scrollRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 53,
    overscan: 15,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - virtualRows[virtualRows.length - 1].end
      : 0;

  function handleCellClick(
    rowId: string,
    employee: Employee,
    field?: keyof Employee,
  ) {
    if (field) setClickedField(field);
    if (editingRowId) return;
    startEditing(rowId, employee);
  }

  function renderRowCells(
    rowId: string,
    row: (typeof rows)[number],
    isEditing: boolean,
  ) {
    return row.getVisibleCells().map((cell) => {
      if (cell.column.id === 'actions') {
        return (
          <td key={cell.id} className="p-2">
            <RowActions rowId={rowId} isEditing={isEditing} />
          </td>
        );
      }
      const field = cell.column.id as keyof Employee;
      return (
        <td
          key={cell.id}
          className={cn(
            'p-2 cursor-pointer hover:bg-muted/20',
            isEditing && 'p-1',
          )}
          onClick={() => handleCellClick(rowId, row.original, field)}
        >
          <EditableCell
            employee={row.original}
            field={field}
            isEditing={isEditing}
            clickedField={clickedField}
          />
        </td>
      );
    });
  }

  return (
    <div className="space-y-4">
      <TableToolbar
        table={table}
        isVirtual={isVirtual}
        onToggleMode={onToggleMode}
        filteredCount={rows.length}
      />

      <div
        ref={scrollRef}
        className={cn(
          'relative w-full overflow-auto rounded-lg border',
          isVirtual ? 'h-[600px]' : '',
        )}
      >
        <table className="w-full caption-bottom text-sm">
          <thead className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <TableHeaderCell key={header.id} header={header} />
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-40 text-center text-muted-foreground"
                >
                  No rows match the current filters.
                </td>
              </tr>
            ) : isVirtual ? (
              <>
                {paddingTop > 0 && (
                  <tr style={{ height: paddingTop }}>
                    <td style={{ height: paddingTop }} />
                  </tr>
                )}
                {virtualRows.map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  const isEditing = editingRowId === row.original.id;
                  const isBlocked = editingRowId !== null && !isEditing;
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        'border-b transition-colors',
                        isEditing && 'bg-muted/30',
                        isBlocked && 'opacity-50 pointer-events-none',
                      )}
                      style={{ height: virtualRow.size }}
                    >
                      {renderRowCells(row.original.id, row, isEditing)}
                    </tr>
                  );
                })}
                {paddingBottom > 0 && (
                  <tr style={{ height: paddingBottom }}>
                    <td style={{ height: paddingBottom }} />
                  </tr>
                )}
              </>
            ) : (
              rows.map((row) => {
                const isEditing = editingRowId === row.original.id;
                const isBlocked = editingRowId !== null && !isEditing;
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b transition-colors hover:bg-muted/50',
                      isEditing && 'bg-muted/30',
                      isBlocked && 'opacity-50 pointer-events-none',
                    )}
                  >
                    {renderRowCells(row.original.id, row, isEditing)}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isVirtual && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
              .filter(
                (page) =>
                  Math.abs(page - (pagination.pageIndex + 1)) <= 2 ||
                  page === 1 ||
                  page === table.getPageCount(),
              )
              .map((page, idx, arr) => (
                <span key={page} className="inline-flex items-center">
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="px-1 text-muted-foreground">...</span>
                  )}
                  <Button
                    variant={
                      page === pagination.pageIndex + 1 ? 'default' : 'outline'
                    }
                    size="icon"
                    className="size-8 text-sm"
                    onClick={() => table.setPageIndex(page - 1)}
                  >
                    {page}
                  </Button>
                </span>
              ))}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
