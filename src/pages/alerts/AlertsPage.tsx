import { useSearchParams } from 'react-router-dom';
import { AlertList } from '../../components/surveillance/AlertList';
import { QueryState } from '../../components/surveillance/QueryState';
import { Select } from '../../components/ui/Select';
import { useFetch } from '../../hooks/useFetch';
import { alertService } from '../../services/alertService';

export default function AlertsPage() {
  const query = useFetch(alertService.getActive, []);
  const [params, setParams] = useSearchParams();
  const active = (query.data ?? []).filter(alert => alert.active);
  const districts = [...new Map(active.map(alert => [String(alert.districtId), alert.districtName]))]
    .sort((a, b) => a[1].localeCompare(b[1], 'es'));
  const districtId = params.get('district') ?? '';
  const alerts = active
    .filter(alert => !districtId || String(alert.districtId) === districtId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Alertas activas</h1>
      <QueryState {...query} />
      {!query.loading && !query.error && (
        <>
          <div className="max-w-sm">
            <Select id="alert-district" label="Distrito" value={districtId} onChange={event =>
              setParams(event.target.value ? { district: event.target.value } : {})}>
              <option value="">Todos los distritos</option>
              {districts.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              {districtId && !districts.some(([id]) => id === districtId) && (
                <option value={districtId}>Distrito seleccionado</option>
              )}
            </Select>
          </div>
          <AlertList alerts={alerts} />
        </>
      )}
    </section>
  );
}
