import { useFetch } from '../../hooks/useFetch';
import { weatherService } from '../../services/weatherService';
import { QueryState } from './QueryState';

const numberFormat = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 });
const dateFormat = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Lima',
});

function CurrentConditions({ latitude, longitude }: { latitude: number; longitude: number }) {
  const query = useFetch(signal => weatherService.getCurrent(latitude, longitude, signal), [latitude, longitude]);
  const { data, loading, error } = query;

  if (loading || error || !data) {
    return <QueryState {...query} error={error && { ...error, message: 'No se pudo consultar el clima actual.' }} />;
  }

  const metrics = [
    { label: 'Temperatura', value: data.temperature, unit: '°C' },
    { label: 'Humedad', value: data.humidity, unit: '%' },
    { label: 'Precipitación reciente', value: data.precipitation, unit: 'mm' },
  ];

  return (
    <>
      <dl className="grid gap-3 sm:grid-cols-3">
        {metrics.map(({ label, value, unit }) => (
          <div key={label}>
            <dt className="text-sm text-slate-600 dark:text-slate-300">{label}</dt>
            <dd className="font-semibold">{numberFormat.format(value)} {unit}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Datos del <time dateTime={data.observedAt.toISOString()}>{dateFormat.format(data.observedAt)}</time>, hora de Perú.
      </p>
    </>
  );
}

export function DistrictWeather({ latitude, longitude }: { latitude: number | null; longitude: number | null }) {
  const hasCoordinates = latitude != null && longitude != null && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold">Clima actual</h2>
      {hasCoordinates
        ? <CurrentConditions key={`${latitude},${longitude}`} latitude={latitude} longitude={longitude} />
        : <p className="text-sm">El distrito aún no tiene coordenadas válidas para consultar el clima.</p>}
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Fuente: <a className="underline" href="https://open-meteo.com/">Open-Meteo</a>
      </p>
    </section>
  );
}
