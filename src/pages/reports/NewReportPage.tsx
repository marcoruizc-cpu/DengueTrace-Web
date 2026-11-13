import { useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toAppError } from '../../api/errors';
import { AdminDistrictSelect } from '../../components/admin/AdminDistrictSelect';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { districtService } from '../../services/districtService';
import { reportService } from '../../services/reportService';
import type { Symptom } from '../../types/api';
import { SYMPTOM_LABELS } from '../../utils/constants';

const symptomOptions = Object.entries(SYMPTOM_LABELS) as [Symptom, string][];

export default function NewReportPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [districtId, setDistrictId] = useState(() => params.get('district') || String(user?.districtId ?? ''));
  const [symptoms, setSymptoms] = useState('');
  const [checked, setChecked] = useState<Symptom[]>([]);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { data: districts, loading, error, reload } = useFetch(
    signal => districtService.getAll(signal),
    [],
  );

  const description = [checked.map(symptom => SYMPTOM_LABELS[symptom]).join(', '), symptoms.trim()]
    .filter(Boolean).join('\n');

  function attachLocation() {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no permite compartir la ubicación.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({ latitude: coords.latitude, longitude: coords.longitude });
        setLocating(false);
      },
      () => {
        setLocationError('No pudimos obtener tu ubicación. Puedes continuar solo con el distrito.');
        setLocating(false);
      },
      { timeout: 10000 },
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || locating || loading || error) return;
    setFormError(null);
    const selectedDistrict = Number(districtId);
    if (!Number.isInteger(selectedDistrict) || selectedDistrict <= 0 ||
        !districts?.some(district => district.id === selectedDistrict)) {
      setFormError('Selecciona un distrito válido.');
      return;
    }
    if (!description || description.length > 2000) {
      setFormError('Marca un síntoma o escribe una descripción. El reporte admite hasta 2000 caracteres.');
      return;
    }

    pending.current = true;
    setSubmitting(true);
    try {
      await reportService.create({ districtId: selectedDistrict, symptoms: description, ...(coordinates ?? {}) });
      toast.success('Tu reporte se registró correctamente.');
      navigate('/reports/me', { replace: true });
    } catch (err) {
      setFormError(toAppError(err).message);
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/reports/me" className="inline-flex items-center gap-2 text-sm text-sky-800 hover:underline dark:text-sky-300">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a mis reportes
        </Link>
        <h1 className="mt-3 text-2xl font-bold">Nuevo autorreporte</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Registra los síntomas que presentas en el distrito seleccionado. No es un diagnóstico médico.
        </p>
      </div>

      <form onSubmit={event => void onSubmit(event)} className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {error ? (
          <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
            No pudimos cargar los distritos. {error.message}
            <button type="button" onClick={reload} className="ml-2 font-semibold underline">Reintentar</button>
          </div>
        ) : loading ? (
          <p role="status">Cargando distritos...</p>
        ) : districts && districts.length === 0 ? (
          <p role="status" className="rounded-lg border border-amber-300 p-3">Todavía no hay distritos registrados. Pide a un administrador que agregue uno.</p>
        ) : (
          <AdminDistrictSelect districts={districts ?? []} value={districtId} onChange={setDistrictId}
            label="Distrito" required disabled={submitting} />
        )}

        <fieldset className="space-y-2" disabled={submitting}>
          <legend className="mb-2 text-sm font-semibold">Síntomas</legend>
          {symptomOptions.map(([symptom, label]) => (
            <label key={symptom} className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-0.5 size-4 accent-sky-800" checked={checked.includes(symptom)}
                onChange={event => {
                  const enabled = event.target.checked;
                  setChecked(previous => enabled ? [...previous, symptom] : previous.filter(item => item !== symptom));
                }} />
              {label}
            </label>
          ))}
        </fieldset>

        <label className="block space-y-2 text-sm font-medium">
          <span>Descripción del reporte</span>
          <textarea value={symptoms} onChange={event => setSymptoms(event.target.value)}
            maxLength={2000} rows={5} disabled={submitting}
            placeholder="Describe la información que deseas reportar..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-sky-600 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100" />
          <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">{description.length}/2000 caracteres en total</span>
        </label>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Ubicación exacta (opcional)</p>
          {coordinates ? (
            <div className="flex flex-wrap items-center gap-2">
              <p role="status" className="text-sm">Ubicación adjunta al reporte.</p>
              <Button variant="ghost" disabled={submitting} onClick={() => setCoordinates(null)}>Quitar ubicación</Button>
            </div>
          ) : <Button variant="secondary" loading={locating} disabled={submitting} onClick={attachLocation}>Adjuntar mi ubicación</Button>}
          {locationError && <p role="status" className="text-sm">{locationError}</p>}
        </div>

        {formError && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">{formError}</p>}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link to="/reports/me" className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600">Cancelar</Link>
          <button type="submit" disabled={submitting || locating || loading || !!error || !districts?.length || !districtId || !description || description.length > 2000}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-900 px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">
            <Send className="h-4 w-4" aria-hidden /> {submitting ? 'Guardando...' : 'Enviar reporte'}
          </button>
        </div>
      </form>
    </section>
  );
}
