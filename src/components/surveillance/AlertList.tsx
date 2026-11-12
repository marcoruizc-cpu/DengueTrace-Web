import { Link } from 'react-router-dom';
import type { Alert } from '../../types/api';
import { RISK_META } from '../../utils/constants';

export function AlertList({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return <p className="text-sm text-slate-500">No hay alertas activas para esta selección.</p>;

  return (
    <ul className="grid gap-3">
      {alerts.map(alert => (
        <li key={alert.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link className="font-semibold underline-offset-4 hover:underline" to={`/districts/${alert.districtId}`}>
              {alert.districtName}
            </Link>
            <span className="flex items-center gap-2 text-sm">
              <span aria-hidden className="size-3 rounded-full" style={{ backgroundColor: RISK_META[alert.riskLevel].color }} />
              Riesgo {RISK_META[alert.riskLevel].label.toLowerCase()}
            </span>
            <time className="text-sm text-slate-500" dateTime={alert.createdAt}>
              {new Date(alert.createdAt).toLocaleDateString('es-PE')}
            </time>
          </div>
          <p className="mt-2 text-sm">{alert.message}</p>
        </li>
      ))}
    </ul>
  );
}
