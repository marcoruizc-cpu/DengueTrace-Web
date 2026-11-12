import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { QueryState } from '../../components/surveillance/QueryState';
import { Select } from '../../components/ui/Select';
import { useFetch } from '../../hooks/useFetch';
import { alertService } from '../../services/alertService';
import { districtService } from '../../services/districtService';
import type { District, RiskLevel } from '../../types/api';
import { RISK_META } from '../../utils/constants';

const levels: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const neutralColor = '#64748b';

type LocatedDistrict = District & { latitude: number; longitude: number };

function hasCoordinates(district: District): district is LocatedDistrict {
  return district.latitude != null && Math.abs(district.latitude) <= 90
    && district.longitude != null && Math.abs(district.longitude) <= 180;
}

export default function RiskMapPage() {
  const districts = useFetch(districtService.getAll, []);
  const alerts = useFetch(alertService.getActive, []);
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef(new Map<number, L.CircleMarker>());
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [tilesFailed, setTilesFailed] = useState(false);

  const located = useMemo(() => (districts.data ?? []).filter(hasCoordinates)
    .sort((a, b) => a.name.localeCompare(b.name, 'es')), [districts.data]);
  const riskByDistrict = useMemo(() => {
    const result = new Map<number, RiskLevel>();
    for (const alert of alerts.data ?? []) {
      const previous = result.get(alert.districtId);
      if (alert.active && (!previous || levels.indexOf(alert.riskLevel) > levels.indexOf(previous))) {
        result.set(alert.districtId, alert.riskLevel);
      }
    }
    return result;
  }, [alerts.data]);

  const selected = located.find(district => district.id === districtId);
  const risk = selected && riskByDistrict.get(selected.id);

  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, { scrollWheelZoom: false }).setView([-9.19, -75.02], 5);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).on('tileerror', () => setTilesFailed(true))
      .on('tileload', () => setTilesFailed(false))
      .addTo(instance);

    map.current = instance;
    return () => {
      instance.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const layer = L.layerGroup().addTo(instance);
    const current = markers.current;
    const bounds = L.latLngBounds([]);

    for (const district of located) {
      const position = L.latLng(district.latitude, district.longitude);
      const label = document.createElement('span');
      label.textContent = district.name;
      const marker = L.circleMarker(position, { radius: 8, color: '#334155', weight: 2, fillOpacity: 1 })
        .bindTooltip(label)
        .on('click', () => setDistrictId(district.id))
        .addTo(layer);
      bounds.extend(position);
      current.set(district.id, marker);
    }

    if (bounds.isValid()) instance.fitBounds(bounds, { padding: [28, 28], maxZoom: 11 });
    return () => {
      layer.remove();
      current.clear();
    };
  }, [located]);

  useEffect(() => {
    for (const [id, marker] of markers.current) {
      const level = riskByDistrict.get(id);
      marker.setStyle({ fillColor: level ? RISK_META[level].color : neutralColor });
    }
  }, [located, riskByDistrict]);

  useEffect(() => {
    if (!selected) return;
    map.current?.panTo([selected.latitude, selected.longitude]);
    markers.current.get(selected.id)?.openTooltip();
  }, [selected]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Mapa de riesgo</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">El color de cada distrito indica el nivel más alto de sus alertas activas.</p>
      <QueryState {...districts} />
      <QueryState {...alerts} />
      <div className="max-w-md">
        <Select id="map-district" label="Distrito en el mapa" value={selected?.id ?? ''}
          disabled={!located.length} onChange={event => setDistrictId(Number(event.target.value) || null)}>
          <option value="">Selecciona un distrito</option>
          {located.map(district => <option key={district.id} value={district.id}>{district.name} · {district.department}</option>)}
        </Select>
      </div>
      {!districts.loading && !districts.error && !located.length && <p>No hay distritos con coordenadas registradas.</p>}
      <div ref={container} role="region" aria-label="Mapa interactivo de distritos" className="isolate h-[28rem] rounded-xl border bg-slate-100" />
      {tilesFailed && <p role="status" className="text-sm">Algunas partes del mapa no se cargaron. Puedes elegir un distrito en la lista.</p>}
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label="Leyenda de alertas">
        {[
          ...levels.map(level => RISK_META[level]),
          { label: alerts.loading || alerts.error ? 'Riesgo sin datos' : 'Sin alerta activa', color: neutralColor },
        ].map(({ label, color }) => (
          <li key={label} className="flex items-center gap-1.5">
            <span aria-hidden className="size-3 rounded-full border border-slate-600" style={{ backgroundColor: color }} />{label}
          </li>
        ))}
      </ul>
      {selected && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-semibold">{selected.name} · {selected.department}</h2>
          <p className="text-sm">{risk ? `Riesgo ${RISK_META[risk].label.toLowerCase()}` :
            alerts.loading || alerts.error ? 'Riesgo sin datos' : 'Sin alerta activa'}</p>
          <Link className="mt-2 inline-block text-sm underline" to={`/districts/${selected.id}`}>Ver detalle del distrito</Link>
        </div>
      )}
    </section>
  );
}
