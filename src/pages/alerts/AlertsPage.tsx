import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  BellRing,
  CalendarDays,
  MapPin,
  RefreshCcw,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useFetch } from '../../hooks/useFetch';
import { alertService } from '../../services/alertService';
import { districtService } from '../../services/districtService';
import type { Alert, RiskLevel } from '../../types/api';
import { RISK_META } from '../../utils/constants';

const levels: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const severity: Record<RiskLevel, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
const styles: Record<RiskLevel, string> = {
  LOW: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
  HIGH: 'border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200',
  CRITICAL: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
};

const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100';

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function riskLabel(level: RiskLevel) {
  return RISK_META[level].label;
}

export default function AlertsPage() {
  const { user, hasRole } = useAuth();
  const [params, setParams] = useSearchParams();
  const districtParam = params.get('district') ?? '';
  const parsedDistrictId = Number(districtParam);
  const districtId = districtParam !== '' && Number.isSafeInteger(parsedDistrictId) && parsedDistrictId > 0
    ? parsedDistrictId : null;
  const riskParam = params.get('risk') ?? '';
  const risk = levels.find(level => level === riskParam) ?? '';
  const search = params.get('search') ?? '';
  const debouncedSearch = useDebouncedValue(search, 200);
  const order = params.get('order') === 'risk' ? 'risk' : 'recent';

  // El backend devuelve únicamente alertas activas; el filtro por distrito usa
  // su endpoint dedicado y useFetch cancela peticiones anteriores.
  const alerts = useFetch<Alert[]>(
    signal => districtId === null
      ? alertService.getActive(signal)
      : alertService.getByDistrict(districtId, signal),
    [districtId],
  );
  const districts = useFetch(signal => districtService.getAll(signal), []);

  function updateParam(name: 'district' | 'risk' | 'search' | 'order', value: string) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (value) next.set(name, value);
      else next.delete(name);
      return next;
    }, { replace: true });
  }

  function clearFilters() {
    setParams(new URLSearchParams(), { replace: true });
  }

  const currentAlerts = useMemo(() => (alerts.data ?? []).filter(alert => alert.active), [alerts.data]);
  const visible = useMemo(() => {
    const term = debouncedSearch.trim().toLocaleLowerCase('es-PE');
    return currentAlerts
      .filter(alert => (!risk || alert.riskLevel === risk)
        && (!term || alert.message.toLocaleLowerCase('es-PE').includes(term)
          || alert.districtName.toLocaleLowerCase('es-PE').includes(term)))
      .sort((a, b) => order === 'risk'
        ? severity[b.riskLevel] - severity[a.riskLevel] || Date.parse(b.createdAt) - Date.parse(a.createdAt)
        : Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [currentAlerts, debouncedSearch, risk, order]);

  const criticalCount = currentAlerts.filter(alert => alert.riskLevel === 'CRITICAL').length;
  const highCount = currentAlerts.filter(alert => alert.riskLevel === 'HIGH').length;
  const hasFilters = Boolean(districtParam || risk || search || order !== 'recent');

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sky-800 dark:text-sky-300">
            <BellRing className="h-5 w-5" aria-hidden />
            <span className="text-sm font-semibold">Monitoreo sanitario</span>
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">Alertas de riesgo de dengue</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Consulta avisos activos publicados por el equipo de DengueTrace. Filtra por distrito o nivel de riesgo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={alerts.reload} disabled={alerts.loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800">
            <RefreshCcw className={`h-4 w-4 ${alerts.loading ? 'animate-spin' : ''}`} aria-hidden />
            Actualizar
          </button>
          {hasRole('ADMIN') && (
            <Link to="/admin/alerts" className="inline-flex items-center rounded-lg bg-sky-900 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800">
              Administrar alertas
            </Link>
          )}
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Alertas activas{districtId ? ' en este distrito' : ''}</p>
          <p className="mt-1 text-3xl font-bold">{alerts.loading || alerts.error ? '—' : currentAlerts.length}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-800 dark:text-red-200">Riesgo muy alto</p>
          <p className="mt-1 text-3xl font-bold text-red-900 dark:text-red-100">{alerts.loading || alerts.error ? '—' : criticalCount}</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950">
          <p className="text-sm text-orange-800 dark:text-orange-200">Riesgo alto</p>
          <p className="mt-1 text-3xl font-bold text-orange-900 dark:text-orange-100">{alerts.loading || alerts.error ? '—' : highCount}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Buscar alertas</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {user?.districtId != null && (
              <button type="button" onClick={() => updateParam('district', String(user.districtId))}
                className="rounded-lg border border-sky-300 px-3 py-1.5 font-medium text-sky-800 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-slate-800">
                <MapPin className="mr-1 inline h-4 w-4" aria-hidden /> Mi distrito
              </button>
            )}
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-slate-700 underline hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                <X className="h-4 w-4" aria-hidden /> Limpiar filtros
              </button>
            )}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1 text-sm font-medium">
            <span>Distrito</span>
            <select className={fieldClass} value={districtId === null ? '' : String(districtId)}
              onChange={event => updateParam('district', event.target.value)}
              disabled={districts.loading || !!districts.error}>
              <option value="">Todos los distritos</option>
              {(districts.data ?? []).map(district => (
                <option key={district.id} value={district.id}>{district.name} — {district.department}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Nivel de riesgo</span>
            <select className={fieldClass} value={risk} onChange={event => updateParam('risk', event.target.value)}>
              <option value="">Todos los niveles</option>
              {levels.map(level => <option key={level} value={level}>{riskLabel(level)}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Buscar texto</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" aria-hidden />
              <input type="search" className={`${fieldClass} pl-9`} value={search}
                onChange={event => updateParam('search', event.target.value)}
                placeholder="Distrito o mensaje" />
            </span>
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Ordenar</span>
            <select className={fieldClass} value={order} onChange={event => updateParam('order', event.target.value === 'recent' ? '' : event.target.value)}>
              <option value="recent">Más recientes</option>
              <option value="risk">Mayor riesgo primero</option>
            </select>
          </label>
        </div>
        {districts.error && (
          <p role="status" className="mt-3 text-sm text-amber-800 dark:text-amber-300">
            No se pudo cargar el selector de distritos. Aún puedes consultar las alertas.
            <button type="button" onClick={districts.reload} className="ml-2 underline">Reintentar</button>
          </p>
        )}
      </div>

      {alerts.loading && (
        <p role="status" className="rounded-xl border border-slate-200 p-5 text-sm dark:border-slate-700">
          Cargando alertas activas…
        </p>
      )}
      {alerts.error && !alerts.loading && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-semibold">No pudimos cargar las alertas.</p>
          <p className="mt-1 text-sm">{alerts.error.message}</p>
          <button type="button" onClick={alerts.reload} className="mt-3 rounded-lg border border-current px-3 py-1.5 text-sm font-medium">Reintentar</button>
        </div>
      )}

      {!alerts.loading && !alerts.error && (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
            Mostrando {visible.length} de {currentAlerts.length} alertas activas
          </p>
          {currentAlerts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-8 text-center dark:border-emerald-800 dark:bg-emerald-950">
              <ShieldCheck className="mx-auto h-9 w-9 text-emerald-700 dark:text-emerald-300" aria-hidden />
              <h2 className="mt-3 text-lg font-semibold">No hay alertas activas{districtId ? ' para este distrito' : ''}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Consulta de nuevo más adelante para revisar los avisos publicados.</p>
              {hasFilters && <button type="button" className="mt-3 text-sm font-semibold underline" onClick={clearFilters}>Ver todas las alertas</button>}
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-500" aria-hidden />
              <h2 className="mt-2 font-semibold">No encontramos coincidencias</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Prueba otros filtros o una búsqueda distinta.</p>
              <button type="button" className="mt-3 text-sm font-semibold text-sky-800 underline dark:text-sky-300" onClick={clearFilters}>Limpiar filtros</button>
            </div>
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2" aria-label="Alertas de riesgo activas">
              {visible.map(alert => (
                <li key={alert.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  <article className="flex h-full flex-col">
                    <div className={`flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3 ${styles[alert.riskLevel]}`}>
                      <span className="inline-flex items-center gap-2 text-sm font-bold">
                        <AlertTriangle className="h-4 w-4" aria-hidden /> Riesgo {riskLabel(alert.riskLevel).toLowerCase()}
                      </span>
                      <span className="text-xs font-medium">Alerta #{alert.id}</span>
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-5">
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold">
                          <MapPin className="h-5 w-5 flex-shrink-0 text-sky-800 dark:text-sky-300" aria-hidden />
                          {alert.districtName}
                        </h3>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700 dark:text-slate-200">{alert.message}</p>
                      </div>
                      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" aria-hidden />{formatDate(alert.createdAt)}</span>
                        <Link to={`/districts/${alert.districtId}`} className="font-semibold text-sky-800 underline hover:text-sky-600 dark:text-sky-300">Ver distrito</Link>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        Estas alertas son avisos informativos del sistema. Sigue las indicaciones oficiales de salud de tu localidad.
      </aside>
    </section>
  );
}
