import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { QueryState } from '../../components/surveillance/QueryState';
import { Select } from '../../components/ui/Select';
import { districtKey, districtPath, normalizeDistrictText, type BrowsableDistrict } from '../../data/districtCatalog';
import { useFetch } from '../../hooks/useFetch';
import { alertService } from '../../services/alertService';
import { districtService } from '../../services/districtService';
import type { RiskLevel } from '../../types/api';
import { RISK_META } from '../../utils/constants';

const levels: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const neutralColor = '#64748b';

type LocatedDistrict = BrowsableDistrict & { latitude: number; longitude: number };

function hasCoordinates(district: BrowsableDistrict): district is LocatedDistrict {
  return district.latitude != null && Math.abs(district.latitude) <= 90
    && district.longitude != null && Math.abs(district.longitude) <= 180;
}

export default function RiskMapPage() {
  const districts = useFetch(districtService.getBrowsableMap, []);
  const alerts = useFetch(alertService.getActive, []);
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef(new Map<string, L.CircleMarker>());
  const [params] = useSearchParams();
  const ubigeo = params.get('ubigeo');
  const [districtId, setDistrictId] = useState(() => ubigeo ? `ubigeo-${ubigeo}` : '');
  const [search, setSearch] = useState('');
  const [tilesFailed, setTilesFailed] = useState(false);

  const located = useMemo(() => (districts.data ?? []).filter(hasCoordinates)
    .sort((a, b) => a.name.localeCompare(b.name, 'es')), [districts.data]);
  const reference = located.some(district => 'ubigeo' in district);
  const term = normalizeDistrictText(search.trim());
  const options = located.filter(district => districtKey(district) === districtId
    || normalizeDistrictText(`${district.name} ${district.province ?? ''} ${district.department}`).includes(term));
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

  const selected = located.find(district => districtKey(district) === districtId);
  const risk = selected && 'id' in selected ? riskByDistrict.get(selected.id) : undefined;

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
    const renderer = reference ? L.canvas({ padding: 0.5 }) : undefined;

    for (const district of located) {
      const position = L.latLng(district.latitude, district.longitude);
      const label = document.createElement('span');
      label.textContent = district.name;
      const marker = L.circleMarker(position, { renderer, radius: reference ? 4 : 8, color: '#334155', weight: 2, fillOpacity: 1 })
        .bindTooltip(label)
        .on('click', () => setDistrictId(districtKey(district)))
        .addTo(layer);
      bounds.extend(position);
      current.set(districtKey(district), marker);
    }

    if (bounds.isValid()) instance.fitBounds(bounds, { padding: [28, 28], maxZoom: 11 });
    return () => {
      layer.remove();
      renderer?.remove();
      current.clear();
    };
  }, [located, reference]);

  useEffect(() => {
    for (const [id, marker] of markers.current) {
      const level = riskByDistrict.get(Number(id));
      marker.setStyle({ fillColor: level ? RISK_META[level].color : neutralColor });
    }
  }, [located, riskByDistrict]);

  useEffect(() => {
    if (!selected) return;
    if (reference) map.current?.setView([selected.latitude, selected.longitude], 10);
    else map.current?.panTo([selected.latitude, selected.longitude]);
    markers.current.get(districtKey(selected))?.openTooltip();
  }, [selected, reference]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Mapa de riesgo</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {reference ? 'Catálogo de referencia. Los marcadores indican la ubicación de las capitales distritales.' :
          'El color de cada distrito indica el nivel más alto de sus alertas activas.'}
      </p>
      <QueryState {...districts} />
      {!reference && <QueryState {...alerts} />}
      <div className="max-w-md space-y-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Buscar distrito en el mapa
          <input type="search" value={search} onChange={event => setSearch(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600" />
        </label>
        <Select id="map-district" label="Distrito en el mapa" value={selected ? districtKey(selected) : ''}
          disabled={!options.length} onChange={event => setDistrictId(event.target.value)}>
          <option value="">Selecciona un distrito</option>
          {options.map(district => (
            <option key={districtKey(district)} value={districtKey(district)}>
              {[district.name, district.province, district.department].filter(Boolean).join(' · ')}
            </option>
          ))}
        </Select>
      </div>
      {search && located.length > 0 && !options.length && <p>No se encontraron distritos con esa búsqueda.</p>}
      {!districts.loading && !districts.error && !located.length && <p>No hay distritos con coordenadas registradas.</p>}
      <div ref={container} role="region" aria-label="Mapa interactivo de distritos" className="isolate h-[28rem] rounded-xl border bg-slate-100" />
      {tilesFailed && <p role="status" className="text-sm">Algunas partes del mapa no se cargaron. Puedes elegir un distrito en la lista.</p>}
      {!reference && <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label="Leyenda de alertas">
        {[
          ...levels.map(level => RISK_META[level]),
          { label: alerts.loading || alerts.error ? 'Riesgo sin datos' : 'Sin alerta activa', color: neutralColor },
        ].map(({ label, color }) => (
          <li key={label} className="flex items-center gap-1.5">
            <span aria-hidden className="size-3 rounded-full border border-slate-600" style={{ backgroundColor: color }} />{label}
          </li>
        ))}
      </ul>}
      {selected && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-semibold">{selected.name} · {selected.department}</h2>
          <p className="text-sm">{reference ? selected.province : risk ? `Riesgo ${RISK_META[risk].label.toLowerCase()}` :
            alerts.loading || alerts.error ? 'Riesgo sin datos' : 'Sin alerta activa'}</p>
          <Link className="mt-2 inline-block text-sm underline" to={districtPath(selected)}>Ver detalle del distrito</Link>
        </div>
      )}
    </section>
  );
}
