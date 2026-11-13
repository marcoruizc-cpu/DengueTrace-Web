import { Link } from 'react-router-dom';
import { AlertList } from '../../components/surveillance/AlertList';
import { QueryState } from '../../components/surveillance/QueryState';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { alertService } from '../../services/alertService';
import { districtService } from '../../services/districtService';

export default function DashboardPage() {
  const { user } = useAuth();
  const districts = useFetch(districtService.getAll, []);
  const alerts = useFetch(alertService.getActive, []);
  const activeAlerts = (alerts.data ?? []).filter(alert => alert.active);
  const severeDistricts = new Set(activeAlerts.filter(alert =>
    alert.riskLevel === 'HIGH' || alert.riskLevel === 'CRITICAL',
  ).map(alert => alert.districtId));

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-sky-950 p-6 text-white sm:p-8">
        <h1 className="text-3xl font-bold">Panel de vigilancia del dengue</h1>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/map" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-sky-950">Ver mapa de riesgo</Link>
          <Link to="/reports/new" className="rounded-lg border border-sky-400 px-4 py-2 text-sm font-semibold">Reportar síntomas</Link>
          {user?.districtId != null && (
            <Link to={`/districts/${user.districtId}`} className="rounded-lg border border-sky-400 px-4 py-2 text-sm font-semibold">
              Mi distrito{user.districtName ? ` · ${user.districtName}` : ''}
            </Link>
          )}
        </div>
      </header>
      <dl className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Distritos monitoreados', value: districts.loading ? null : districts.data?.length },
          { label: 'Alertas activas', value: alerts.loading || alerts.error ? null : activeAlerts.length },
          { label: 'Distritos con alerta alta o muy alta', value: alerts.loading || alerts.error ? null : severeDistricts.size },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <dt className="text-sm text-slate-600 dark:text-slate-300">{label}</dt>
            <dd className="mt-1 text-3xl font-semibold">{value ?? '—'}</dd>
          </div>
        ))}
      </dl>
      <QueryState {...districts} />
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Alertas recientes</h2>
          <Link to="/alerts" className="text-sm underline">Ver todas las alertas</Link>
        </div>
        <QueryState {...alerts} />
        {!alerts.loading && !alerts.error && (
          <AlertList alerts={activeAlerts.toSorted((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 5)} />
        )}
      </section>
    </section>
  );
}
