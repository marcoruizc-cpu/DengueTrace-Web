import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Database, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { toAppError } from '../../api/errors';
import { AdminDistrictSelect } from '../../components/admin/AdminDistrictSelect';
import { useFetch } from '../../hooks/useFetch';
import { districtService } from '../../services/districtService';
import { historicalCaseService } from '../../services/historicalCaseService';
import { climateService } from '../../services/climateService';
import type { ClimateData, HistoricalCase } from '../../types/api';

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-sky-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100';
type DataTab = 'cases' | 'climate';

export default function AdminDataPage() {
  const districts = useFetch(signal => districtService.getAll(signal), []);
  const [district, setDistrict] = useState('');
  const districtId = Number(district);
  const [tab, setTab] = useState<DataTab>('cases');
  const history = useFetch<HistoricalCase[]>(
    signal => districtId > 0 ? historicalCaseService.getByDistrict(districtId, signal) : Promise.resolve([]),
    [districtId],
  );
  const climate = useFetch<ClimateData[]>(
    signal => districtId > 0 ? climateService.getByDistrict(districtId, signal) : Promise.resolve([]),
    [districtId],
  );
  const [weekStartDate, setWeekStartDate] = useState('');
  const [caseCount, setCaseCount] = useState('');
  const [recordedDate, setRecordedDate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [precipitation, setPrecipitation] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  function selectTab(next: DataTab) {
    setTab(next);
    setFormError('');
  }

  async function saveCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const count = Number(caseCount);
    const year = Number(weekStartDate.slice(0, 4));
    if (!Number.isSafeInteger(districtId) || districtId <= 0 || !weekStartDate || !Number.isSafeInteger(count) || count < 0 || caseCount.trim() === '' || !Number.isInteger(year)) {
      setFormError('Selecciona el distrito, una fecha válida y un número entero de casos mayor o igual a cero.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await historicalCaseService.create({ districtId, weekStartDate, caseCount: count, year });
      toast.success('Registro histórico guardado.');
      setCaseCount('');
      setWeekStartDate('');
      history.reload();
    } catch (error) {
      setFormError(toAppError(error).message);
    } finally {
      setSaving(false);
    }
  }

  async function saveClimate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const temp = Number(temperature);
    const hum = Number(humidity);
    const rain = Number(precipitation);
    if (!Number.isSafeInteger(districtId) || districtId <= 0 || !recordedDate ||
        [temperature, humidity, precipitation].some(value => value.trim() === '') ||
        ![temp, hum, rain].every(Number.isFinite) || hum < 0 || hum > 100 || rain < 0) {
      setFormError('Completa los datos. La humedad debe estar entre 0 y 100 %, y la precipitación no puede ser negativa.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await climateService.create({ districtId, temperature: temp, humidity: hum, precipitationMm: rain, recordedDate });
      toast.success('Registro climático guardado.');
      setTemperature('');
      setHumidity('');
      setPrecipitation('');
      setRecordedDate('');
      climate.reload();
    } catch (error) {
      setFormError(toAppError(error).message);
    } finally {
      setSaving(false);
    }
  }

  const current = tab === 'cases' ? history : climate;

  return (
    <section className="space-y-5">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Database className="h-6 w-6" aria-hidden /> Administrar datos</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Registra datos históricos y climáticos de los distritos. Estos registros se consultan directamente desde la API.</p>
      </header>

      <nav aria-label="Administración" className="flex flex-wrap gap-3 text-sm">
        <Link to="/admin/districts" className="underline">Distritos</Link>
        <Link to="/admin/alerts" className="underline">Alertas</Link>
        <Link to="/admin/data" className="font-semibold text-sky-800 underline dark:text-sky-300" aria-current="page">Datos</Link>
      </nav>

      {districts.loading && <p role="status">Cargando distritos…</p>}
      {districts.error && <p role="alert" className="rounded-lg border border-red-200 p-3 text-red-700 dark:text-red-300">{districts.error.message} <button type="button" onClick={districts.reload} className="underline">Reintentar</button></p>}
      {!districts.loading && !districts.error && districts.data?.length === 0 && <p>Primero registra un distrito en el panel de administración.</p>}

      <div className="max-w-md">
        <AdminDistrictSelect label="Distrito de trabajo" districts={districts.data ?? []} value={district} onChange={setDistrict} required disabled={saving || districts.loading} />
      </div>

      <div role="tablist" aria-label="Tipo de datos" className="flex gap-2 border-b border-slate-200 pb-2 dark:border-slate-700">
        <button type="button" role="tab" aria-selected={tab === 'cases'} onClick={() => selectTab('cases')} className={`rounded-lg px-4 py-2 ${tab === 'cases' ? 'bg-sky-800 font-semibold text-white' : 'border border-slate-300 dark:border-slate-600'}`}>Casos históricos</button>
        <button type="button" role="tab" aria-selected={tab === 'climate'} onClick={() => selectTab('climate')} className={`rounded-lg px-4 py-2 ${tab === 'climate' ? 'bg-sky-800 font-semibold text-white' : 'border border-slate-300 dark:border-slate-600'}`}>Clima</button>
      </div>

      {!district && <p className="rounded-xl border border-dashed p-6 text-center">Selecciona un distrito para registrar y consultar información.</p>}

      {district && tab === 'cases' && (
        <form onSubmit={event => void saveCase(event)} className="space-y-4 rounded-xl border border-sky-200 bg-sky-50/50 p-5 dark:border-sky-900 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Nuevo registro de casos históricos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-medium"><span>Inicio de semana *</span><input type="date" required className={inputClass} value={weekStartDate} onChange={event => setWeekStartDate(event.target.value)} disabled={saving} /></label>
            <label className="space-y-1 text-sm font-medium"><span>Cantidad de casos *</span><input type="number" min={0} step={1} required className={inputClass} value={caseCount} onChange={event => setCaseCount(event.target.value)} disabled={saving} placeholder="Ej. 15" /></label>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">El año se obtiene automáticamente de la fecha seleccionada.</p>
          {formError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{formError}</p>}
          <button type="submit" disabled={saving} className="rounded-lg bg-sky-800 px-4 py-2 text-white disabled:opacity-60">{saving ? 'Guardando…' : 'Guardar casos'}</button>
        </form>
      )}

      {district && tab === 'climate' && (
        <form onSubmit={event => void saveClimate(event)} className="space-y-4 rounded-xl border border-sky-200 bg-sky-50/50 p-5 dark:border-sky-900 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Nuevo registro climático</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-medium"><span>Fecha de medición *</span><input type="date" required className={inputClass} value={recordedDate} onChange={event => setRecordedDate(event.target.value)} disabled={saving} /></label>
            <label className="space-y-1 text-sm font-medium"><span>Temperatura (°C) *</span><input type="number" required step="any" className={inputClass} value={temperature} onChange={event => setTemperature(event.target.value)} disabled={saving} placeholder="Ej. 24.5" /></label>
            <label className="space-y-1 text-sm font-medium"><span>Humedad (%) *</span><input type="number" required min={0} max={100} step="any" className={inputClass} value={humidity} onChange={event => setHumidity(event.target.value)} disabled={saving} placeholder="Ej. 78" /></label>
            <label className="space-y-1 text-sm font-medium"><span>Precipitación (mm) *</span><input type="number" required min={0} step="any" className={inputClass} value={precipitation} onChange={event => setPrecipitation(event.target.value)} disabled={saving} placeholder="Ej. 2.5" /></label>
          </div>
          {formError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{formError}</p>}
          <button type="submit" disabled={saving} className="rounded-lg bg-sky-800 px-4 py-2 text-white disabled:opacity-60">{saving ? 'Guardando…' : 'Guardar datos climáticos'}</button>
        </form>
      )}

      {district && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Registros existentes</h2>
            <button type="button" onClick={current.reload} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><RefreshCcw className="h-4 w-4" aria-hidden /> Actualizar</button>
          </div>
          {current.loading && <p role="status">Cargando registros…</p>}
          {current.error && <p role="alert" className="rounded-lg border border-red-200 p-3 text-red-700 dark:text-red-300">{current.error.message} <button type="button" onClick={current.reload} className="underline">Reintentar</button></p>}
          {!current.loading && !current.error && current.data?.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center">Aún no hay registros para este distrito.</p>}
          {!current.loading && !current.error && tab === 'cases' && history.data && history.data.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <table className="w-full text-left text-sm"><thead className="bg-slate-100 dark:bg-slate-800"><tr><th className="p-4">Fecha de inicio</th><th className="p-4">Año</th><th className="p-4">Casos</th></tr></thead>
                <tbody>{[...history.data].reverse().map(item => <tr key={item.id} className="border-t border-slate-200 dark:border-slate-700"><td className="p-4">{item.weekStartDate}</td><td className="p-4">{item.year}</td><td className="p-4 font-medium">{item.caseCount}</td></tr>)}</tbody>
              </table>
            </div>
          )}
          {!current.loading && !current.error && tab === 'climate' && climate.data && climate.data.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <table className="w-full text-left text-sm"><thead className="bg-slate-100 dark:bg-slate-800"><tr><th className="p-4">Fecha</th><th className="p-4">Temperatura</th><th className="p-4">Humedad</th><th className="p-4">Precipitación</th></tr></thead>
                <tbody>{[...climate.data].reverse().map(item => <tr key={item.id} className="border-t border-slate-200 dark:border-slate-700"><td className="p-4">{item.recordedDate}</td><td className="p-4">{item.temperature} °C</td><td className="p-4">{item.humidity} %</td><td className="p-4">{item.precipitationMm} mm</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
