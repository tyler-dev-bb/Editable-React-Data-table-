import type { Header } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { cn } from '@/utils/cn';

type Props<T> = {
  header: Header<T, unknown>;
};

export function TableHeaderCell<T>({ header }: Props<T>) {
  const isSortable = header.column.getCanSort();
  const sorted = header.column.getIsSorted();

  if (!isSortable) {
    return (
      <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
        {header.isPlaceholder
          ? null
          : header.column.columnDef.header?.toString()}
      </th>
    );
  }

  return (
    <th
      className={cn(
        'h-10 px-2 text-left align-middle font-medium text-muted-foreground',
        'cursor-pointer select-none hover:bg-muted/50',
      )}
      onClick={header.column.getToggleSortingHandler()}
    >
      <div className="inline-flex items-center gap-1">
        {header.isPlaceholder
          ? null
          : header.column.columnDef.header?.toString()}
        {{
          asc: <ArrowDown className="size-3.5" />,
          desc: <ArrowUp className="size-3.5" />,
        }[sorted as string] ?? <ArrowUpDown className="size-3.5 opacity-40" />}
      </div>
    </th>
  );
}
