import { Check, Undo2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useEditStore } from '../store/edit-store';

type Props = {
  rowId: string;
  isEditing: boolean;
};

export function RowActions({ rowId, isEditing }: Props) {
  const saveRow = useEditStore((s) => s.saveRow);
  const cancelEdit = useEditStore((s) => s.cancelEdit);
  const undoRow = useEditStore((s) => s.undoRow);
  const hasUndo = useEditStore((s) => s.hasUndo(rowId));

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-green-600 hover:text-green-700"
          onClick={saveRow}
          title="Save"
        >
          <Check className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-red-600 hover:text-red-700"
          onClick={cancelEdit}
          title="Cancel"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground"
        disabled={!hasUndo}
        onClick={() => undoRow(rowId)}
        title="Undo last save"
      >
        <Undo2 className="size-4" />
      </Button>
    </div>
  );
}
