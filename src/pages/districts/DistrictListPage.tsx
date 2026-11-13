import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import { Pagination } from '../../components/ui/Pagination';
import { districtKey, districtPath } from '../../data/districtCatalog';
import { useFetch } from '../../hooks/useFetch';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePaginationQuery } from '../../hooks/usePaginationQuery';
import { districtService } from '../../services/districtService';

export default function DistrictListPage() {
  const { page, size, setPage, setSize } = usePaginationQuery();
  const [params, setParams] = useSearchParams();
  const search = params.get('search') ?? '';
  const debouncedSearch = useDebouncedValue(search, 350);
  const { data, loading, error, reload } = useFetch(
    signal => districtService.getBrowsablePage({ page, size, search: debouncedSearch.trim() }, signal),
    [page, size, debouncedSearch],
  );

  const pageData = data?.pageData;

  const updateSearch = (value: string) => {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (value) next.set('search', value);
      else next.delete('search');
      next.set('page', '0');
      return next;
    }, { replace: true });
  };

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Distritos</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Busca un distrito y consulta su ubicación.</p>
      </div>
      <label className="flex max-w-md items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900">
        <Search className="h-5 w-5 text-slate-500" aria-hidden />
        <span className="sr-only">Buscar distrito</span>
        <input type="search" value={search} onChange={e => updateSearch(e.target.value)} placeholder="Buscar distrito..."
          className="w-full bg-transparent py-3 outline-none" />
      </label>
      {loading && <p role="status">Cargando distritos...</p>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
        {error.message} <button type="button" onClick={reload} className="ml-2 underline">Reintentar</button>
      </div>}
      {!loading && !error && pageData && (
        <>
          {data?.reference && (
            <p role="status" className="text-sm">Catálogo de referencia. La API aún no tiene distritos registrados.</p>
          )}
          {pageData.content.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center">No encontramos distritos con esos criterios.</p> : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pageData.content.map(district => (
                <li key={districtKey(district)}>
                  <Link to={districtPath(district)} className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-sky-600 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <span className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-sky-700" aria-hidden />{district.name}</span>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{district.province ?? 'Provincia no indicada'} · {district.department}</p>
                    {'population' in district && (
                      <p className="mt-2 text-sm">Población: {district.population?.toLocaleString('es-PE') ?? 'No disponible'}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {pageData.totalPages > 0 && page >= pageData.totalPages ? (
            <div className="space-y-2 rounded-lg border p-4">
              <p>La página solicitada ya no existe.</p>
              <button className="underline" onClick={() => setPage(pageData.totalPages - 1)}>Ir a la última página</button>
            </div>
          ) : (
            <Pagination page={page} size={size} totalElements={pageData.totalElements} totalPages={pageData.totalPages}
              onPageChange={setPage} onSizeChange={setSize} />
          )}
        </>
      )}
    </section>
  );
}
