import { Link, useParams } from 'react-router-dom';
import { QueryState } from '../../components/surveillance/QueryState';
import { loadReferenceDistricts } from '../../data/districtCatalog';
import { useFetch } from '../../hooks/useFetch';

export default function ReferenceDistrictPage() {
  const { ubigeo } = useParams();
  const query = useFetch(async signal => {
    const catalog = await loadReferenceDistricts(signal);
    return catalog.find(district => district.ubigeo === ubigeo);
  }, [ubigeo]);

  if (query.loading || query.error) return <QueryState {...query} />;
  const district = query.data;

  if (!district) {
    return <p role="status">No encontramos ese distrito. <Link className="underline" to="/districts">Ver distritos</Link></p>;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">{district.name}</h1>
      <p>{district.province} · {district.department}</p>
      <p className="text-sm">Distrito del catálogo de referencia. Esta ficha muestra su ubicación y código de ubigeo.</p>
      <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3 dark:border-slate-700 dark:bg-slate-900">
        <div><dt>Ubigeo</dt><dd className="font-semibold">{district.ubigeo}</dd></div>
        <div><dt>Latitud de la capital distrital</dt><dd className="font-semibold">{district.latitude.toFixed(5)}</dd></div>
        <div><dt>Longitud de la capital distrital</dt><dd className="font-semibold">{district.longitude.toFixed(5)}</dd></div>
      </dl>
      <Link className="underline" to={`/map?ubigeo=${district.ubigeo}`}>Ver en el mapa</Link>
    </section>
  );
}
