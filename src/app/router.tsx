import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { DataTablePage } from '@/features/data-table';

const router = createBrowserRouter([
  {
    path: '/',
    element: <DataTablePage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
