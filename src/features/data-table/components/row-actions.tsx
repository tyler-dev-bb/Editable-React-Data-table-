import { Check, Undo2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

type Props = {
  rowId: string;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onUndo: (rowId: string) => void;
  hasUndo: boolean;
};

export function RowActions({
  rowId,
  isEditing,
  onSave,
  onCancel,
  onUndo,
  hasUndo,
}: Props) {
  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-green-600 hover:text-green-700"
          onClick={onSave}
          title="Save"
        >
          <Check className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-red-600 hover:text-red-700"
          onClick={onCancel}
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
        onClick={() => onUndo(rowId)}
        title="Undo last save"
      >
        <Undo2 className="size-4" />
      </Button>
    </div>
  );
}
