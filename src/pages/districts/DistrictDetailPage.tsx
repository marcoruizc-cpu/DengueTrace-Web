import { Link, useParams } from 'react-router-dom';
import { AlertList } from '../../components/surveillance/AlertList';
import { CaseChart } from '../../components/surveillance/CaseChart';
import { QueryState } from '../../components/surveillance/QueryState';
import { useFetch } from '../../hooks/useFetch';
import { alertService } from '../../services/alertService';
import { districtService } from '../../services/districtService';
import { historicalCaseService } from '../../services/historicalCaseService';
import { predictiveService } from '../../services/predictiveService';
import { RISK_META } from '../../utils/constants';

const sectionClass = 'space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900';
const weekFormat = new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeZone: 'UTC' });

function DistrictData({ id }: { id: number }) {
  const history = useFetch(signal => historicalCaseService.getByDistrict(id, signal), [id]);
  const prediction = useFetch(signal => predictiveService.getLatest(id, signal), [id]);
  const alerts = useFetch(signal => alertService.getByDistrict(id, signal), [id]);
  const weeklyCounts = new Map<string, number>();

  for (const record of history.data ?? []) {
    weeklyCounts.set(record.weekStartDate, (weeklyCounts.get(record.weekStartDate) ?? 0) + record.caseCount);
  }
  const recent = [...weeklyCounts].sort(([a], [b]) => a.localeCompare(b)).slice(-12);
  const model = prediction.data;

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className={sectionClass}>
          <h2 className="text-lg font-semibold">Casos registrados por semana</h2>
          <QueryState {...history} />
          {!history.loading && !history.error && (recent.length ? (
            <CaseChart points={recent.map(([date, count]) => ({ label: weekFormat.format(new Date(date)), count }))} />
          ) : <p className="text-sm">Aún no hay casos históricos registrados.</p>)}
        </section>
        <section className={sectionClass}>
          <h2 className="text-lg font-semibold">Casos proyectados para cuatro semanas</h2>
          <QueryState {...prediction} />
          {!prediction.loading && !prediction.error && (model ? (
            <>
              <p className="text-sm">
                Riesgo {RISK_META[model.riskLevel].label.toLowerCase()} · Confianza del modelo {Math.round(model.confidenceLevel * 100)}%
              </p>
              <p className="text-sm">Actualizado el {new Date(model.generatedAt).toLocaleDateString('es-PE')}</p>
              <CaseChart points={[
                model.projectedWeek1, model.projectedWeek2, model.projectedWeek3, model.projectedWeek4,
              ].map((count, index) => ({ label: `Semana ${index + 1}`, count }))} />
            </>
          ) : <p className="text-sm">Aún no hay una proyección para este distrito.</p>)}
        </section>
      </div>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Alertas activas del distrito</h2>
        <QueryState {...alerts} />
        {!alerts.loading && !alerts.error && <AlertList alerts={(alerts.data ?? []).filter(alert => alert.active)} />}
      </section>
    </>
  );
}

function DistrictDetail({ id }: { id: number }) {
  const query = useFetch(signal => districtService.getById(id, signal), [id]);
  const district = query.data;

  if (query.loading || query.error || !district) return <QueryState {...query} />;

  return (
    <section className="space-y-5">
      <header className={sectionClass}>
        <h1 className="text-2xl font-bold">{district.name}</h1>
        <p className="text-sm">{[district.province, district.department].filter(Boolean).join(' · ')}</p>
        <p className="text-sm">Población: {district.population?.toLocaleString('es-PE') ?? 'Sin datos'}</p>
        <Link className="inline-block text-sm underline" to={`/reports/new?district=${id}`}>Reportar síntomas en este distrito</Link>
      </header>
      <DistrictData id={id} />
    </section>
  );
}

export default function DistrictDetailPage() {
  const { districtId } = useParams();
  const id = Number(districtId);

  if (!districtId || !/^\d+$/.test(districtId) || !Number.isSafeInteger(id) || id < 1) {
    return <p role="alert">El distrito indicado no es válido. <Link className="underline" to="/districts">Ver distritos</Link></p>;
  }

  return <DistrictDetail key={id} id={id} />;
}
