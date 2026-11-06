import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { ForbiddenState } from '../components/layout/ForbiddenState';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types/api';

/**
 * Oculta vistas según el rol. Es experiencia de usuario, no seguridad:
 * la seguridad real está en el backend (@PreAuthorize), que responde 403 igual.
 */
export function RoleRoute({ roles, children }: { roles: Role[]; children?: ReactNode }) {
  const { hasRole } = useAuth();
  if (!hasRole(...roles)) return <ForbiddenState />;
  return <>{children ?? <Outlet />}</>;
}
