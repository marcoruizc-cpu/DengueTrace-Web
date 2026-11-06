import type { District } from '../types/api';

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Distrito más cercano a unas coordenadas; null si ninguno tiene lat/lng. */
export function findNearestDistrict(lat: number, lon: number, districts: District[]) {
  let best: { district: District; km: number } | null = null;
  for (const d of districts) {
    if (d.latitude == null || d.longitude == null) continue;
    const km = haversineKm(lat, lon, d.latitude, d.longitude);
    if (!best || km < best.km) best = { district: d, km };
  }
  return best;
}
