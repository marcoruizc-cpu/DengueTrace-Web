import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BellPlus, RefreshCcw, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { toAppError } from '../../api/errors';
import { AdminDistrictSelect } from '../../components/admin/AdminDistrictSelect';
import { useFetch } from '../../hooks/useFetch';
import { alertService } from '../../services/alertService';
import { districtService } from '../../services/districtService';
import type { Alert, RiskLevel } from '../../types/api';
import { RISK_META } from '../../utils/constants';

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-sky-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100';
const levels: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-PE');
}

export default function AdminAlertsPage() {
  const districts = useFetch(signal => districtService.getAll(signal), []);
  const alerts = useFetch<Alert[]>(signal => alertService.getActive(signal), []);
  const [districtFilter, setDistrictFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formDistrictId, setFormDistrictId] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('MEDIUM');
  const [message, setMessage] = useState('');
  const [threshold, setThreshold] = useState('');
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState<number | null>(null);
  const [formError, setFormError] = useState('');

  const visible = useMemo(() => (alerts.data ?? []).filter(alert =>
    (!districtFilter || alert.districtId === Number(districtFilter)) &&
    (!riskFilter || alert.riskLevel === riskFilter),
  ), [alerts.data, districtFilter, riskFilter]);

  async function createAlert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const districtId = Number(formDistrictId);
    const cleanMessage = message.trim();
    const thresholdValue = threshold.trim() === '' ? undefined : Number(threshold);
    if (!Number.isSafeInteger(districtId) || districtId <= 0 || cleanMessage.length === 0 || cleanMessage.length > 500) {
      setFormError('Selecciona un distrito y escribe un mensaje de 1 a 500 caracteres.');
      return;
    }
    if (thresholdValue !== undefined && (!Number.isFinite(thresholdValue) || thresholdValue < 0)) {
      setFormError('El umbral debe ser un número mayor o igual a cero.');
      return;
    }
    const selected = districts.data?.find(item => item.id === districtId);
    if (!window.confirm(`¿Publicar una alerta ${RISK_META[riskLevel].label.toLowerCase()} para ${selected?.name ?? 'este distrito'}? Esta acción puede enviar notificaciones a usuarios.`)) return;

    setSaving(true);
    setFormError('');
    try {
      await alertService.create({ districtId, riskLevel, message: cleanMessage, ...(thresholdValue === undefined ? {} : { thresholdExceeded: thresholdValue }) });
      toast.success('Alerta publicada correctamente.');
      setFormOpen(false);
      setFormDistrictId('');
      setMessage('');
      setThreshold('');
      alerts.reload();
    } catch (error) {
      setFormError(toAppError(error).message);
    } finally {
      setSaving(false);
    }
  }

  async function deactivateAlert(alert: Alert) {
    if (!window.confirm(`¿Desactivar la alerta #${alert.id} de ${alert.districtName}?`)) return;
    setDeactivating(alert.id);
    try {
      await alertService.deactivate(alert.id);
      toast.success('Alerta desactivada.');
      alerts.reload();
    } catch (error) {
      toast.error(toAppError(error).message);
    } finally {
      setDeactivating(null);
    }
  }

  const busy = saving || deactivating !== null;

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Administrar alertas</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Publica alertas de riesgo y desactiva las que ya no están vigentes.</p>
        </div>
        <button type="button" onClick={() => { setFormOpen(value => !value); setFormError(''); }} disabled={busy || districts.loading || !districts.data?.length}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-800 px-4 py-2 font-medium text-white disabled:opacity-60">
          <BellPlus className="h-4 w-4" aria-hidden /> Nueva alerta
        </button>
      </header>

      <nav aria-label="Administración" className="flex flex-wrap gap-3 text-sm">
        <Link to="/admin/districts" className="underline">Distritos</Link>
        <Link to="/admin/alerts" className="font-semibold text-sky-800 underline dark:text-sky-300" aria-current="page">Alertas</Link>
        <Link to="/admin/data" className="underline">Datos</Link>
      </nav>

      {districts.error && <p role="alert" className="rounded-lg border border-red-200 p-3 text-red-700 dark:text-red-300">No se pudieron cargar los distritos. {districts.error.message} <button type="button" className="underline" onClick={districts.reload}>Reintentar</button></p>}
      {!districts.loading && !districts.error && districts.data?.length === 0 && <p role="status">No hay distritos registrados. Debes crearlos antes de publicar alertas.</p>}

      {formOpen && (
        <form onSubmit={event => void createAlert(event)} className="space-y-4 rounded-xl border border-sky-200 bg-sky-50/50 p-5 dark:border-sky-900 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Publicar alerta</h2>
          <p className="text-sm text-amber-800 dark:text-amber-300">Atención: guardar una alerta puede disparar notificaciones. Para demostraciones utiliza solo datos y cuentas de desarrollo.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminDistrictSelect districts={districts.data ?? []} value={formDistrictId} onChange={setFormDistrictId} label="Distrito" required disabled={saving} />
            <label className="block space-y-1 text-sm font-medium">
              <span>Nivel de riesgo *</span>
              <select className={inputClass} value={riskLevel} onChange={event => setRiskLevel(event.target.value as RiskLevel)} disabled={saving}>
                {levels.map(level => <option key={level} value={level}>{RISK_META[level].label}</option>)}
              </select>
            </label>
            <label className="block space-y-1 text-sm font-medium sm:col-span-2">
              <span>Mensaje *</span>
              <textarea className={inputClass} value={message} onChange={event => setMessage(event.target.value)} maxLength={500} rows={3} required disabled={saving} placeholder="Describe el riesgo y las recomendaciones de prevención." />
              <span className="text-xs text-slate-500">{message.length}/500 caracteres</span>
            </label>
            <label className="block space-y-1 text-sm font-medium">
              <span>Umbral excedido (opcional)</span>
              <input type="number" min={0} step="any" className={inputClass} value={threshold} onChange={event => setThreshold(event.target.value)} disabled={saving} placeholder="Ej. 10" />
            </label>
          </div>
          {formError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{formError}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="rounded-lg bg-sky-800 px-4 py-2 text-white disabled:opacity-60">{saving ? 'Publicando…' : 'Publicar alerta'}</button>
            <button type="button" disabled={saving} onClick={() => setFormOpen(false)} className="rounded-lg border px-4 py-2 disabled:opacity-60">Cancelar</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <AdminDistrictSelect districts={districts.data ?? []} value={districtFilter} onChange={setDistrictFilter} label="Filtrar por distrito" includeAll />
        <label className="block space-y-1 text-sm font-medium"><span>Filtrar por riesgo</span>
          <select className={inputClass} value={riskFilter} onChange={event => setRiskFilter(event.target.value)}>
            <option value="">Todos los niveles</option>
            {levels.map(level => <option key={level} value={level}>{RISK_META[level].label}</option>)}
          </select>
        </label>
        <button type="button" onClick={alerts.reload} className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2"><RefreshCcw className="h-4 w-4" aria-hidden /> Actualizar</button>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">Mostrando {visible.length} alerta(s) activa(s). El backend no devuelve alertas desactivadas en este listado.</p>
      {alerts.loading && <p role="status">Cargando alertas…</p>}
      {alerts.error && <p role="alert" className="rounded-lg border border-red-200 p-3 text-red-700 dark:text-red-300">{alerts.error.message} <button type="button" className="underline" onClick={alerts.reload}>Reintentar</button></p>}
      {!alerts.loading && !alerts.error && visible.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center">No hay alertas activas para estos filtros.</p>}
      {!alerts.loading && !alerts.error && visible.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800"><tr><th className="p-4">Distrito</th><th className="p-4">Nivel</th><th className="p-4">Mensaje</th><th className="p-4">Creada</th><th className="p-4">Acción</th></tr></thead>
            <tbody>{visible.map(alert => (
              <tr key={alert.id} className="border-t border-slate-200 align-top dark:border-slate-700">
                <td className="p-4 font-medium">{alert.districtName}</td>
                <td className="p-4"><span className="rounded-full border px-2 py-1 text-xs font-medium" title={alert.riskLevel}>{RISK_META[alert.riskLevel]?.label ?? alert.riskLevel}</span></td>
                <td className="max-w-sm whitespace-normal break-words p-4">{alert.message}</td>
                <td className="whitespace-nowrap p-4">{formatDate(alert.createdAt)}</td>
                <td className="p-4"><button type="button" disabled={busy} onClick={() => void deactivateAlert(alert)} className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-red-700 disabled:opacity-50 dark:text-red-300"><ShieldOff className="h-4 w-4" aria-hidden />{deactivating === alert.id ? 'Desactivando…' : 'Desactivar'}</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
