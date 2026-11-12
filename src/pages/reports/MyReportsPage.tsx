import { useMemo, useState } from 'react';
import { ClipboardList, FilePlus2, RefreshCcw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { reportService } from '../../services/reportService';

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleString('es-PE');
};

export default function MyReportsPage() {
  const [search, setSearch] = useState('');
  const { data: reports, loading, error, reload } = useFetch(
    signal => reportService.getMine(signal),
    [],
  );

  const visibleReports = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es-PE');
    return [...(reports ?? [])]
      .filter(report => !term ||
        report.districtName.toLocaleLowerCase('es-PE').includes(term) ||
        report.symptoms.toLocaleLowerCase('es-PE').includes(term) ||
        String(report.id).includes(term))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reports, search]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mis reportes</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Consulta los autorreportes que enviaste desde tu cuenta.
          </p>
        </div>
        <Link to="/reports/new" className="inline-flex items-center gap-2 rounded-lg bg-sky-900 px-4 py-2 font-medium text-white hover:bg-sky-800">
          <FilePlus2 className="h-4 w-4" aria-hidden /> Nuevo reporte
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex w-full max-w-md items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900">
          <Search className="h-4 w-4 text-slate-500" aria-hidden />
          <span className="sr-only">Buscar entre mis reportes</span>
          <input type="search" value={search} onChange={event => setSearch(event.target.value)}
            placeholder="Buscar por distrito, descripción o ID..."
            className="w-full bg-transparent py-2.5 outline-none" />
        </label>
        <button type="button" onClick={reload} disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-600">
          <RefreshCcw className="h-4 w-4" aria-hidden /> Actualizar
        </button>
      </div>

      {loading && <p role="status" className="rounded-lg border p-5">Cargando tus reportes...</p>}
      {error && <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
        {error.message} <button type="button" onClick={reload} className="ml-2 font-semibold underline">Reintentar</button>
      </div>}

      {!loading && !error && reports && (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
            Mostrando {visibleReports.length} de {reports.length} reportes
          </p>
          {reports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
              <ClipboardList className="mx-auto mb-3 h-9 w-9 text-slate-500" aria-hidden />
              <h2 className="font-semibold">Aún no tienes reportes</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Puedes registrar tu primer autorreporte desde la Web.</p>
              <Link to="/reports/new" className="mt-4 inline-block rounded-lg bg-sky-900 px-4 py-2 text-white">Crear reporte</Link>
            </div>
          ) : visibleReports.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center">No hay reportes que coincidan con tu búsqueda.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th scope="col" className="p-4">Reporte</th>
                    <th scope="col" className="p-4">Distrito</th>
                    <th scope="col" className="p-4">Descripción declarada</th>
                    <th scope="col" className="p-4">Fecha</th>
                    <th scope="col" className="p-4">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleReports.map(report => (
                    <tr key={report.id} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="p-4 font-medium">#{report.id}</td>
                      <td className="p-4">{report.districtName}</td>
                      <td className="max-w-64 p-4"><p className="line-clamp-2 break-words">{report.symptoms}</p></td>
                      <td className="whitespace-nowrap p-4">{formatDate(report.createdAt)}</td>
                      <td className="p-4"><Link to={`/reports/${report.id}`} className="font-medium text-sky-800 underline hover:text-sky-600 dark:text-sky-300">Ver detalle</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
