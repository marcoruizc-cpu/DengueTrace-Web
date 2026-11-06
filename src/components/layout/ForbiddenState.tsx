import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ForbiddenState() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <ShieldAlert className="mx-auto h-12 w-12 text-amber-600" aria-hidden />
      <h1 className="mt-4 text-2xl font-semibold">No tienes permisos</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Esta sección es solo para administradores o moderadores.
      </p>
      <Link to="/dashboard" className="mt-6 inline-block text-sky-700 underline dark:text-sky-300">
        Volver al inicio
      </Link>
    </div>
  );
}
