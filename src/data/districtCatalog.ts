import type { District, PageResponse } from '../types/api';

export interface ReferenceDistrict {
  ubigeo: string;
  name: string;
  department: string;
  province: string;
  latitude: number;
  longitude: number;
}

export type BrowsableDistrict = District | ReferenceDistrict;

export function districtKey(district: BrowsableDistrict) {
  return 'ubigeo' in district ? `ubigeo-${district.ubigeo}` : String(district.id);
}

export function districtPath(district: BrowsableDistrict) {
  return 'ubigeo' in district ? `/districts/reference/${district.ubigeo}` : `/districts/${district.id}`;
}

export function normalizeDistrictText(text: string) {
  return text.toLocaleLowerCase('es-PE').normalize('NFD').replace(/[\u0300-\u0302\u0308]/g, '').normalize('NFC');
}

export async function loadReferenceDistricts(signal: AbortSignal): Promise<ReferenceDistrict[]> {
  const { default: districts } = await import('./distritos.json');
  signal.throwIfAborted();
  return districts;
}

export function paginateDistricts<T extends BrowsableDistrict>(
  districts: T[],
  { page, size, search }: { page: number; size: number; search?: string },
  matches: (district: T) => string = district => district.name,
): PageResponse<T> {
  const term = normalizeDistrictText(search?.trim() ?? '');
  const filtered = districts
    .filter(district => normalizeDistrictText(matches(district)).includes(term))
    .sort((a, b) => a.name.localeCompare(b.name, 'es-PE') || (a.province ?? '').localeCompare(b.province ?? '', 'es-PE'));
  const totalPages = Math.ceil(filtered.length / size);
  return {
    content: filtered.slice(page * size, (page + 1) * size),
    page,
    size,
    totalElements: filtered.length,
    totalPages,
    last: page >= totalPages - 1,
  };
}
