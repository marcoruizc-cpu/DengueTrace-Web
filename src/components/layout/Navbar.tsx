import clsx from 'clsx';
import { LogOut, Menu, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-sky-900 text-white'
      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
  );

export function Navbar() {
  const { user, hasRole, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const canModerate = hasRole('ADMIN', 'MODERATOR');

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/map', label: 'Mapa' },
    { to: '/districts', label: 'Distritos' },
    { to: canModerate ? '/reports' : '/reports/me', label: 'Reportes' },
    { to: '/alerts', label: 'Alertas' },
    ...(hasRole('ADMIN') ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  const closeMenu = () => setOpen(false);

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/dashboard" className="text-lg font-bold text-sky-900 dark:text-sky-300">
          DengueTrace
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/profile" className="flex items-center gap-2 text-sm text-slate-700 hover:underline dark:text-slate-200">
            <UserRound className="h-4 w-4" aria-hidden />
            {user?.fullName}
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Salir
          </button>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 md:hidden"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(o => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Principal" className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={closeMenu}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/profile" className={linkClass} onClick={closeMenu}>
            Perfil
          </NavLink>
          <button type="button" onClick={logout} className="rounded-lg px-3 py-2 text-left text-sm text-red-700">
            Cerrar sesión
          </button>
        </nav>
      )}
    </header>
  );
}
