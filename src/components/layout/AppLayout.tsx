import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';
import { ErrorBoundary } from './ErrorBoundary';
import { FullPageSpinner } from './FullPageSpinner';
import { Navbar } from './Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Breadcrumbs />
        <div className="mt-4">
          <ErrorBoundary>
            <Suspense fallback={<FullPageSpinner />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
