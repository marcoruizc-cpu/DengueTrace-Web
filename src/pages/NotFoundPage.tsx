import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center dark:bg-slate-950 dark:text-slate-100">
      <p className="text-6xl font-bold text-sky-900 dark:text-sky-300">404</p>
      <h1 className="text-xl font-semibold">Esta página no existe</h1>
      <p className="text-slate-500 dark:text-slate-400">Revisa la dirección o vuelve al inicio.</p>
      <Link to="/dashboard" className="rounded-lg bg-sky-900 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800">
        Volver al inicio
      </Link>
    </div>
  );
}
