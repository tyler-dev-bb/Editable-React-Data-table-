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
  type Row,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import type { ColumnConfig } from '../types';

import { EditableCell } from './editable-cell';
import { RowActions } from './row-actions';
import { TableHeaderCell } from './table-header';
import { TableToolbar } from './table-toolbar';

type Props<T extends { id: string }> = {
  data: T[];
  columns: ColumnConfig<T>[];
  isVirtual: boolean;
  onToggleMode: () => void;
  editingRowId: string | null;
  draftValues: Partial<T>;
  updateDraft: (field: keyof T, value: unknown) => void;
  onStartEditing: (rowId: string, item: T) => void;
  saveRow: (rowId: string) => void;
  cancelEdit: (rowId: string) => void;
  undoRow: (rowId: string) => void;
  hasUndo: (rowId: string) => boolean;
  autoSave: () => void;
};

export function EditableTable<T extends { id: string }>({
  data,
  columns,
  isVirtual,
  onToggleMode,
  editingRowId,
  draftValues,
  updateDraft,
  onStartEditing,
  saveRow,
  cancelEdit,
  undoRow,
  hasUndo,
  autoSave,
}: Props<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [clickedField, setClickedField] = useState<string | null>(null);

  const columnHelper = useMemo(() => createColumnHelper<T>(), []);

  const tanStackColumns = useMemo(
    () => [
      ...columns.map((col) =>
        columnHelper.accessor((row: T) => row[col.accessorKey], {
          id: col.id,
          header: col.header,
          enableSorting: col.enableSorting ?? true,
          enableColumnFilter: col.enableFilter ?? false,
          filterFn: col.filterFn
            ? (row: Row<T>, columnId: string, filterValue: unknown) =>
                col.filterFn!(row.original, columnId, filterValue)
            : col.type === 'number'
              ? (row, _columnId, filterValue) => {
                  const [min, max] = filterValue as [
                    number | undefined,
                    number | undefined,
                  ];
                  const val = row.getValue<number>(col.accessorKey);
                  if (min != null && val < min) return false;
                  if (max != null && val > max) return false;
                  return true;
                }
              : col.type === 'select'
                ? 'equalsString'
                : 'includesString',
        }),
      ),
      columnHelper.display({
        id: '__actions',
        header: '',
        enableSorting: false,
        enableColumnFilter: false,
      }),
    ],
    [columns, columnHelper],
  );

  const table = useReactTable({
    data,
    columns: tanStackColumns,
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

  const totalColumns = columns.length + 1;

  function handleCellClick(rowId: string, field: string, item: T) {
    setClickedField(field);
    if (editingRowId) return;
    onStartEditing(rowId, item);
  }

  function renderRowCells(rowId: string, row: Row<T>, isEditing: boolean) {
    return row.getVisibleCells().map((cell) => {
      if (cell.column.id === '__actions') {
        return (
          <td key={cell.id} className="p-2">
            <RowActions
              rowId={rowId}
              isEditing={isEditing}
              onSave={() => saveRow(rowId)}
              onCancel={() => cancelEdit(rowId)}
              onUndo={undoRow}
              hasUndo={hasUndo(rowId)}
            />
          </td>
        );
      }

      const col = columns.find((c) => c.id === cell.column.id);
      if (!col) return null;

      const field = col.accessorKey;
      const value = isEditing
        ? draftValues[field] ?? row.original[field]
        : row.original[field];

      return (
        <td
          key={cell.id}
          className={cn(
            'p-2 cursor-pointer hover:bg-muted/20',
            isEditing && 'p-1',
          )}
          onClick={() => handleCellClick(rowId, field, row.original)}
        >
          <EditableCell
            value={value}
            column={col}
            row={row.original}
            isEditing={isEditing}
            shouldFocus={clickedField === field}
            onChange={updateDraft}
          />
        </td>
      );
    });
  }

  return (
    <div className="space-y-4">
      <TableToolbar
        table={table}
        columns={columns}
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
                  colSpan={totalColumns}
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
