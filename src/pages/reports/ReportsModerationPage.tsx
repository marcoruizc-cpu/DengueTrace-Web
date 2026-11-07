import { useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { Pagination } from '../../components/ui/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { usePaginationQuery } from '../../hooks/usePaginationQuery';
import { reportService } from '../../services/reportService';
import { toAppError } from '../../api/errors';

export default function ReportsModerationPage() {
  const { page, size, setPage, setSize } = usePaginationQuery();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const { data, loading, error, reload } = useFetch(
    signal => reportService.getPaged(page, size, signal),
    [page, size],
  );

  async function removeReport(id: number) {
    if (!window.confirm(`¿Eliminar definitivamente el reporte #${id}? Esta acción no se puede deshacer.`)) return;
    setRemovingId(id);
    try {
      await reportService.remove(id);
      toast.success('Reporte eliminado.');
      if (data?.content.length === 1 && page > 0) setPage(page - 1);
      else reload();
    } catch (err) {
      toast.error(toAppError(err).message);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Moderación de reportes</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Listado ordenado desde el reporte más reciente. Acceso solo para ADMIN y MODERATOR.</p>
      </div>
      {loading && <p role="status">Cargando reportes...</p>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
        {error.message} <button type="button" onClick={reload} className="ml-2 underline">Reintentar</button>
      </div>}
      {!loading && !error && data && (
        <>
          {data.content.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center">No hay reportes en esta página.</p> : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr><th scope="col" className="p-4">ID</th><th scope="col" className="p-4">Distrito</th><th scope="col" className="p-4">Síntomas declarados</th><th scope="col" className="p-4">Fecha</th><th scope="col" className="p-4">Acciones</th></tr>
                </thead>
                <tbody>
                  {data.content.map(report => (
                    <tr key={report.id} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="p-4">#{report.id}</td>
                      <td className="p-4">{report.districtName}</td>
                      <td className="max-w-56 truncate p-4" title={report.symptoms}>{report.symptoms}</td>
                      <td className="p-4">{new Date(report.createdAt).toLocaleString('es-PE')}</td>
                      <td className="p-4">
                        <button type="button" disabled={removingId !== null}
                          onClick={() => void removeReport(report.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-red-700 disabled:opacity-50 dark:text-red-300"
                          aria-label={`Eliminar reporte ${report.id}`}>
                          <Trash2 className="h-4 w-4" aria-hidden /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data.totalPages > 0 && page >= data.totalPages ? (
            <div className="space-y-2 rounded-lg border p-4">
              <p>La página solicitada ya no existe.</p>
              <button type="button" className="underline" onClick={() => setPage(data.totalPages - 1)}>Ir a la última página</button>
            </div>
          ) : (
            <Pagination page={page} size={size} totalElements={data.totalElements} totalPages={data.totalPages}
              onPageChange={setPage} onSizeChange={setSize} disabled={removingId !== null} />
          )}
        </>
      )}
    </section>
  );
}
