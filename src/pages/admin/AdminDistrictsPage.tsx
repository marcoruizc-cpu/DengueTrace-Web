import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { toAppError } from '../../api/errors';
import { DistrictForm } from '../../components/admin/DistrictForm';
import { Pagination } from '../../components/ui/Pagination';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useFetch } from '../../hooks/useFetch';
import { usePaginationQuery } from '../../hooks/usePaginationQuery';
import { districtService } from '../../services/districtService';
import type { District, DistrictRequest } from '../../types/api';

export default function AdminDistrictsPage() {
  const { page, size, setPage, setSize } = usePaginationQuery();
  const [params, setParams] = useSearchParams();
  const search = params.get('search') ?? '';
  const debouncedSearch = useDebouncedValue(search, 350);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<District | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { data, loading, error, reload } = useFetch(
    signal => districtService.getPaged({ page, size, search: debouncedSearch.trim() }, signal),
    [page, size, debouncedSearch],
  );

  const updateSearch = (value: string) => {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (value) next.set('search', value);
      else next.delete('search');
      next.set('page', '0');
      return next;
    }, { replace: true });
  };

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(district: District) {
    setEditing(district);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  async function saveDistrict(body: DistrictRequest) {
    setSaving(true);
    try {
      if (editing) {
        await districtService.update(editing.id, body);
        toast.success('Distrito actualizado.');
      } else {
        await districtService.create(body);
        toast.success('Distrito creado.');
      }
      closeForm();
      if (page === 0) reload();
      else setPage(0);
    } catch (err) {
      toast.error(toAppError(err).message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteDistrict(district: District) {
    if (!window.confirm(`¿Eliminar «${district.name}»? Esta acción no se puede deshacer.`)) return;
    setDeletingId(district.id);
    try {
      await districtService.remove(district.id);
      toast.success('Distrito eliminado.');
      if (data?.content.length === 1 && page > 0) setPage(page - 1);
      else reload();
    } catch (err) {
      toast.error(toAppError(err).message);
    } finally {
      setDeletingId(null);
    }
  }

  const busy = saving || deletingId !== null;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Administrar distritos</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Consulta, registra, edita o elimina distritos desde la API de DengueTrace.</p>
        </div>
        <button type="button" disabled={busy} onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-sky-800 px-4 py-2 text-white disabled:opacity-60">
          <Plus className="h-4 w-4" aria-hidden /> Nuevo distrito
        </button>
      </div>

      <nav aria-label="Administración" className="flex flex-wrap gap-3 text-sm">
        <Link className="font-semibold text-sky-800 underline dark:text-sky-300" to="/admin/districts">Distritos</Link>
        <Link className="text-slate-700 underline dark:text-slate-300" to="/admin/alerts">Alertas</Link>
        <Link className="text-slate-700 underline dark:text-slate-300" to="/admin/data">Datos</Link>
      </nav>

      {formOpen && (
        <DistrictForm key={editing?.id ?? 'new'} initial={editing} saving={saving} onSave={saveDistrict} onCancel={closeForm} />
      )}

      <label className="flex max-w-md items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900">
        <Search className="h-5 w-5 text-slate-500" aria-hidden />
        <span className="sr-only">Buscar distrito por nombre</span>
        <input value={search} onChange={e => updateSearch(e.target.value)} placeholder="Buscar distrito…" className="w-full bg-transparent py-3 outline-none" />
      </label>

      {loading && <p role="status">Cargando distritos...</p>}
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error.message} <button type="button" onClick={reload} className="ml-2 underline">Reintentar</button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {data.content.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              No hay distritos para mostrar. Puedes crear el primero con «Nuevo distrito».
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th scope="col" className="p-4">ID</th>
                    <th scope="col" className="p-4">Distrito</th>
                    <th scope="col" className="p-4">Provincia</th>
                    <th scope="col" className="p-4">Departamento</th>
                    <th scope="col" className="p-4">Población</th>
                    <th scope="col" className="p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map(district => (
                    <tr key={district.id} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="p-4">#{district.id}</td>
                      <td className="p-4 font-medium">{district.name}</td>
                      <td className="p-4">{district.province ?? '—'}</td>
                      <td className="p-4">{district.department}</td>
                      <td className="p-4">{district.population?.toLocaleString('es-PE') ?? '—'}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button type="button" disabled={busy} onClick={() => openEdit(district)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50 dark:border-slate-600">
                            <Pencil className="h-4 w-4" aria-hidden /> Editar
                          </button>
                          <button type="button" disabled={busy} onClick={() => void deleteDistrict(district)} className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-red-700 disabled:opacity-50 dark:text-red-300">
                            <Trash2 className="h-4 w-4" aria-hidden /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data.totalPages > 0 && page >= data.totalPages ? (
            <div className="rounded-lg border p-4">
              Esta página ya no existe. <button type="button" className="underline" onClick={() => setPage(data.totalPages - 1)}>Ir a la última página</button>
            </div>
          ) : (
            <Pagination page={page} size={size} totalElements={data.totalElements} totalPages={data.totalPages}
              onPageChange={setPage} onSizeChange={setSize} disabled={busy} />
          )}
        </>
      )}
    </section>
  );
}
