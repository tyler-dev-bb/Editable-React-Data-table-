# Editable Data Table

An advanced, fully generic editable data table built with React, TanStack Table, TanStack Virtual, and Zustand.

## Get Started

Prerequisites:
- Node 20+
- Yarn 1.22+

```bash
yarn install
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Feature Overview

A single-page app at `/` that renders an editable, sortable, filterable table of 10,000 employee records. Supports virtual scrolling, paginated mode, per-column advanced filters, global search, inline editing with Save/Cancel/Undo, and CSV export.

## Architecture

### Generic Design

Every component is parameterized by a generic type `T extends { id: string }`. The table can be reused with any data shape — Employee, Product, Order, etc.

```tsx
type Product = { id: string; title: string; price: number; category: string };

const productColumns: ColumnConfig<Product>[] = [
  { id: 'title', header: 'Title', accessorKey: 'title', type: 'text' },
  { id: 'price', header: 'Price', accessorKey: 'price', type: 'number' },
  { id: 'category', header: 'Category', accessorKey: 'category', type: 'select', options: ['A', 'B'] },
];

const useDataStore = createDataStore<Product>();
const useEditStore = createEditStore<Product>(useDataStore);

<EditableTable data={products} columns={productColumns} ... />
```

### ColumnConfig API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | required | Unique column identifier |
| `header` | `string` | required | Display label |
| `accessorKey` | `keyof T` | required | Field key on the data type |
| `type` | `'text' \| 'number' \| 'select' \| 'date'` | required | Determines edit control and default filter |
| `options` | `string[]` | — | Dropdown options for `'select'` type |
| `enableSorting` | `boolean` | `true` | Allow column sorting |
| `enableFilter` | `boolean` | `false` | Show column filter in toolbar |
| `exportable` | `boolean` | `true` | Include in CSV export |
| `filterFn` | `(row: T, columnId, filterValue) => boolean` | type-based default | Custom filter function |
| `cell` | `(value, row) => ReactNode` | type-based format | Custom read-mode render |
| `editCell` | `(value, row, onChange) => ReactNode` | type-based input | Custom edit-mode render |

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Table logic | `@tanstack/react-table` v8 | Headless, handles sorting/filtering/pagination, same ecosystem as React Query |
| Virtual scrolling | `@tanstack/react-virtual` | Headless, 2.3 kB, pairs with TanStack Table |
| State management | Zustand (factory pattern) | `createDataStore<T>()` + `createEditStore<T>()` produce reusable, typed store hooks |
| Inline editing | Props-based (inversion of control) | EditableTable receives editing state and callbacks as props — no direct store dependency |
| Column config | `ColumnConfig<T>[]` prop | Fully declarative: type, filter, options, render overrides all in one object per column |
| Cell rendering | Type-driven with overrides | `type: 'number'` → number input + locale formatting; `cell`/`editCell` overrides for edge cases |
| Virtual/paginated toggle | `key`-based remount | Force remounts TanStack Table to flush internal pipeline state; auto-save fires before toggle |
| Row-lock during editing | Early return + CSS | Clicking any row while another is being edited is blocked; non-editing rows get `opacity-50 pointer-events-none` |
| Cell focus | `clickedField` state | Only the clicked cell receives auto-focus, not the first field in the row |
| Filtering | Per-column from ColumnConfig | Toolbar iterates `ColumnConfig[]` and renders type-appropriate controls (text input, number range, select dropdown) |
| CSV export | Generic, config-driven | Derives headers and field access from column config; respects `exportable` flag |
| Unsaved changes | `beforeunload` + `unstable_usePrompt` | Catches both tab close and SPA navigation |
| Styling | Tailwind CSS with shadcn-style theme | Matches project conventions |

### Known Limitations

- **Unit tests**: Not included. Would use Vitest + Testing Library with mockable Zustand stores.
- **Variable row heights**: Virtualizer uses `estimateSize: 53` (fixed). A production version would use `measureElement`.
- **Multi-user editing**: No conflict resolution. Data is in-memory only — lost on page refresh.
- **Accessibility**: `<input>`/`<select>` elements are accessible, but no explicit keyboard navigation for entering/exiting edit mode.
- **Browser undo**: Native Ctrl+Z after saving doesn't interact with the app's Undo button.
- **Scroll position**: Switching between virtual and paginated mode resets scroll position.
