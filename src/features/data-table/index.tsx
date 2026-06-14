import { useCallback, useEffect, useState } from 'react';
import { unstable_usePrompt } from 'react-router';

import { Head } from '@/components/seo/head';

import { EditableTable } from './components/editable-table';
import { generateEmployees } from './data';
import { createDataStore } from './store/data-store';
import { createEditStore } from './store/edit-store';
import type { ColumnConfig, Employee } from './types';

const ROW_COUNT = 10_000;

const useDataStore = createDataStore<Employee>();
const useEditStore = createEditStore<Employee>(useDataStore);

const columns: ColumnConfig<Employee>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    type: 'text',
    enableFilter: true,
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    type: 'text',
    enableFilter: true,
  },
  {
    id: 'department',
    header: 'Department',
    accessorKey: 'department',
    type: 'select',
    options: [
      'Engineering',
      'Marketing',
      'Sales',
      'HR',
      'Finance',
      'Operations',
      'Legal',
      'Design',
    ],
    enableFilter: true,
  },
  {
    id: 'salary',
    header: 'Salary',
    accessorKey: 'salary',
    type: 'number',
    enableFilter: true,
    cell: (value) => <span>${(value as number).toLocaleString()}</span>,
  },
  {
    id: 'startDate',
    header: 'Start Date',
    accessorKey: 'startDate',
    type: 'date',
  },
];

export function DataTablePage() {
  const employees = useDataStore((s) => s.data);
  const setEmployees = useDataStore((s) => s.setData);
  const editingRowId = useEditStore((s) => s.editingRowId);
  const draftValues = useEditStore((s) => s.draftValues);
  const updateDraft = useEditStore((s) => s.updateDraft);
  const startEditing = useEditStore((s) => s.startEditing);
  const saveRow = useEditStore((s) => s.saveRow);
  const cancelEdit = useEditStore((s) => s.cancelEdit);
  const undoRow = useEditStore((s) => s.undoRow);
  const hasUndo = useEditStore((s) => s.hasUndo);

  const [isVirtual, setIsVirtual] = useState(true);

  const autoSave = useCallback(() => {
    const state = useEditStore.getState();
    if (state.editingRowId) {
      state.saveRow();
    }
  }, []);

  const toggleMode = useCallback(() => {
    autoSave();
    setIsVirtual((v) => !v);
  }, [autoSave]);

  useEffect(() => {
    if (employees.length === 0) {
      setEmployees(generateEmployees(ROW_COUNT));
    }
  }, [employees.length, setEmployees]);

  useEffect(() => {
    if (editingRowId) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
  }, [editingRowId]);

  unstable_usePrompt({
    when: editingRowId !== null,
    message:
      'You have unsaved changes. Are you sure you want to leave this page?',
  });

  return (
    <div className="space-y-6 p-6">
      <Head title="Data Table" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Editable Data Table
        </h1>
        <p className="text-sm text-muted-foreground">
          {ROW_COUNT.toLocaleString()} employee records with inline editing,
          sorting, filtering, and virtual scrolling.
        </p>
      </div>
      {employees.length > 0 && (
        <EditableTable
          key={isVirtual ? 'virtual' : 'paginated'}
          data={employees}
          columns={columns}
          isVirtual={isVirtual}
          onToggleMode={toggleMode}
          editingRowId={editingRowId}
          draftValues={draftValues}
          updateDraft={updateDraft}
          onStartEditing={startEditing}
          saveRow={saveRow}
          cancelEdit={cancelEdit}
          undoRow={undoRow}
          hasUndo={hasUndo}
          autoSave={autoSave}
        />
      )}
    </div>
  );
}
