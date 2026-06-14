import { useEditStore } from '../store/edit-store';
import { DEPARTMENTS } from '../types';
import type { Employee } from '../types';

type Props = {
  employee: Employee;
  field: keyof Employee;
  isEditing: boolean;
  clickedField: keyof Employee | null;
};

export function EditableCell({
  employee,
  field,
  isEditing,
  clickedField,
}: Props) {
  const draftValues = useEditStore((s) => s.draftValues);
  const updateDraft = useEditStore((s) => s.updateDraft);

  const shouldFocus = clickedField === field;

  if (!isEditing) {
    if (field === 'salary') {
      return <span>${employee.salary.toLocaleString()}</span>;
    }
    return <span>{String(employee[field])}</span>;
  }

  const value = draftValues[field] ?? employee[field];

  if (field === 'department') {
    return (
      <select
        className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value as string}
        onChange={(e) => updateDraft(field, e.target.value)}
        ref={(el) => {
          if (shouldFocus) el?.focus();
        }}
      >
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    );
  }

  if (field === 'salary') {
    return (
      <input
        className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        type="number"
        value={value as number}
        onChange={(e) => updateDraft(field, Number(e.target.value))}
        ref={(el) => {
          if (shouldFocus) el?.focus();
        }}
      />
    );
  }

  if (field === 'name' || field === 'email') {
    return (
      <input
        className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        type="text"
        value={value as string}
        onChange={(e) => updateDraft(field, e.target.value)}
        ref={(el) => {
          if (shouldFocus) el?.focus();
        }}
      />
    );
  }

  return <span>{String(employee[field])}</span>;
}
