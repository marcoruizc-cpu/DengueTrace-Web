import { useState, type FormEvent } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { toAppError } from '../../api/errors';
import { AdminDistrictSelect } from '../../components/admin/AdminDistrictSelect';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { districtService } from '../../services/districtService';
import { reportService } from '../../services/reportService';

export default function NewReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [districtId, setDistrictId] = useState(() => user?.districtId ? String(user.districtId) : '');
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { data: districts, loading, error, reload } = useFetch(
    signal => districtService.getAll(signal),
    [],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const selectedDistrict = Number(districtId);
    const description = symptoms.trim();
    if (!Number.isInteger(selectedDistrict) || selectedDistrict <= 0 ||
        !districts?.some(district => district.id === selectedDistrict)) {
      setFormError('Selecciona un distrito válido.');
      return;
    }
    if (!description || description.length > 2000) {
      setFormError('Escribe una descripción de entre 1 y 2000 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      await reportService.create({ districtId: selectedDistrict, symptoms: description });
      toast.success('Tu reporte se registró correctamente.');
      navigate('/reports/me', { replace: true });
    } catch (err) {
      setFormError(toAppError(err).message);
    } finally {
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
          Registra una descripción para el distrito seleccionado. No es un diagnóstico médico.
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

        <label className="block space-y-2 text-sm font-medium">
          <span>Descripción del reporte *</span>
          <textarea value={symptoms} onChange={event => setSymptoms(event.target.value)}
            maxLength={2000} required rows={5} disabled={submitting}
            placeholder="Describe la información que deseas reportar..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-sky-600 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100" />
          <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">{symptoms.length}/2000 caracteres</span>
        </label>

        {formError && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">{formError}</p>}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link to="/reports/me" className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600">Cancelar</Link>
          <button type="submit" disabled={submitting || loading || !!error || !districts?.length || !districtId || !symptoms.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-900 px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">
            <Send className="h-4 w-4" aria-hidden /> {submitting ? 'Guardando...' : 'Enviar reporte'}
          </button>
        </div>
      </form>
    </section>
  );
}
