import { useCallback, useEffect, useState } from 'react';
import { unstable_usePrompt } from 'react-router';

import { Head } from '@/components/seo/head';

import { EditableTable } from './components/editable-table';
import { generateEmployees } from './data';
import { useDataStore } from './store/data-store';
import { useEditStore } from './store/edit-store';

const ROW_COUNT = 10_000;

export function DataTablePage() {
  const employees = useDataStore((s) => s.employees);
  const setEmployees = useDataStore((s) => s.setEmployees);
  const editingRowId = useEditStore((s) => s.editingRowId);
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
          employees={employees}
          isVirtual={isVirtual}
          onToggleMode={toggleMode}
        />
      )}
    </div>
  );
}
