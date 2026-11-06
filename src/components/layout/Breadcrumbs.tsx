import { ChevronRight } from 'lucide-react';
import { Link, useMatches } from 'react-router-dom';

type CrumbHandle = { crumb?: string } | undefined;

/** Lee el `handle.crumb` de cada ruta activa (definido en routes/router.tsx). */
export function Breadcrumbs() {
  const crumbs = useMatches().filter(match => (match.handle as CrumbHandle)?.crumb);
  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Ruta de navegación">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        {crumbs.map((match, index) => {
          const label = (match.handle as { crumb: string }).crumb;
          const isLast = index === crumbs.length - 1;
          return (
            <li key={match.id} className="flex items-center gap-1">
              {isLast ? (
                <span aria-current="page" className="font-medium text-slate-900 dark:text-white">
                  {label}
                </span>
              ) : (
                <Link to={match.pathname} className="hover:underline">
                  {label}
                </Link>
              )}
              {!isLast && <ChevronRight className="h-4 w-4" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
