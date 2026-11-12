import { ArrowLeft, CalendarDays, FileText, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { reportService } from '../../services/reportService';

function readableDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleString('es-PE');
}

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const id = Number(reportId);
  const validId = Number.isSafeInteger(id) && id > 0;

  // Se consulta únicamente el listado del usuario para no mostrar reportes ajenos desde la UI.
  // El backend también debe validar la propiedad al acceder por ID directamente.
  const { data: ownReports, loading, error, reload } = useFetch(
    signal => validId ? reportService.getMine(signal) : Promise.resolve([]),
    [reportId],
  );
  const report = ownReports?.find(item => item.id === id);

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Link to="/reports/me" className="inline-flex items-center gap-2 text-sm text-sky-800 hover:underline dark:text-sky-300">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a mis reportes
      </Link>
      {loading && <p role="status" className="rounded-lg border p-5">Cargando reporte...</p>}
      {error && <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
        {error.message} <button type="button" onClick={reload} className="ml-2 font-semibold underline">Reintentar</button>
      </div>}
      {!loading && !error && !report && (
        <div role="status" className="rounded-xl border border-dashed p-8">
          <h1 className="text-xl font-bold">Reporte no encontrado</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No existe ese reporte entre los registrados por tu cuenta.</p>
        </div>
      )}
      {!loading && !error && report && (
        <article className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Autorreporte #{report.id}</p>
            <h1 className="mt-1 text-2xl font-bold">Detalle de mi reporte</h1>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><MapPin className="h-4 w-4" aria-hidden /> Distrito</dt>
              <dd className="font-medium">{report.districtName}</dd>
            </div>
            <div className="space-y-1">
              <dt className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><CalendarDays className="h-4 w-4" aria-hidden /> Registrado el</dt>
              <dd className="font-medium">{readableDate(report.createdAt)}</dd>
            </div>
          </dl>
          <div className="space-y-2 border-t border-slate-200 pt-5 dark:border-slate-700">
            <h2 className="flex items-center gap-2 font-semibold"><FileText className="h-4 w-4" aria-hidden /> Descripción declarada</h2>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{report.symptoms}</p>
          </div>
          {report.latitude !== null && report.longitude !== null && (
            <div className="border-t border-slate-200 pt-5 text-sm dark:border-slate-700">
              <h2 className="font-semibold">Coordenadas registradas</h2>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{report.latitude}, {report.longitude}</p>
            </div>
          )}
        </article>
      )}
    </section>
  );
}
