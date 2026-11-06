import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

/** Errores que atrapa el router (por ejemplo, un import lazy que falla por un deploy nuevo). */
export default function RouteErrorPage() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center dark:bg-slate-950 dark:text-slate-100">
      <h1 className="text-xl font-semibold">{isNotFound ? 'Esta página no existe' : 'Algo salió mal'}</h1>
      <p className="text-slate-500 dark:text-slate-400">
        {isNotFound ? 'Revisa la dirección o vuelve al inicio.' : 'Recarga la página. Si sigue pasando, inténtalo en unos minutos.'}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-sky-900 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
        >
          Recargar
        </button>
        <Link to="/dashboard" className="rounded-lg px-4 py-2 text-sm font-medium text-sky-900 underline dark:text-sky-300">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
