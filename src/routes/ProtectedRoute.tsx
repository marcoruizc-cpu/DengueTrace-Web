import { Suspense, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { FullPageSpinner } from '../components/layout/FullPageSpinner';
import { useAuth } from '../hooks/useAuth';

/** Solo deja pasar con sesión iniciada; si no, manda a /login recordando a dónde iba. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'checking') return <FullPageSpinner />;
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

/** Login y registro: si ya hay sesión, no tiene sentido mostrarlos. */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === 'checking') return <FullPageSpinner />;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return <Suspense fallback={<FullPageSpinner />}>{children}</Suspense>;
}
