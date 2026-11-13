import axios from 'axios';
import { api } from '../api/client';
import { loadReferenceDistricts, paginateDistricts, type BrowsableDistrict } from '../data/districtCatalog';
import type { District, DistrictRequest, PageResponse } from '../types/api';

export interface PagedDistrictParams {
  page: number;
  size: number;
  search?: string;
}

function getAll(signal?: AbortSignal) {
  return api.get<District[]>('/districts', { signal }).then(response => response.data);
}

async function fetchPage({ page, size, search }: PagedDistrictParams, signal?: AbortSignal) {
  try {
    const { data } = await api.get<PageResponse<District>>('/districts/paged', {
      params: { page, size, ...(search ? { search } : {}) }, signal,
    });
    return { pageData: data };
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;
    const response = error.response;
    const pathIsMissing = response?.status === 404 ||
      (response?.status === 400 && typeof response.data?.detail === 'string'
        && /'id'.*'paged'/.test(response.data.detail));
    if (!pathIsMissing) throw error;
    const districts = await getAll(signal);
    return { pageData: paginateDistricts(districts, { page, size, search }), registeredCount: districts.length };
  }
}

export const districtService = {
  getAll,
  getPaged: async (params: PagedDistrictParams, signal?: AbortSignal) => (await fetchPage(params, signal)).pageData,
  getBrowsableMap: async (signal: AbortSignal): Promise<BrowsableDistrict[]> => {
    const districts = await getAll(signal);
    return districts.length ? districts : loadReferenceDistricts(signal);
  },
  getBrowsablePage: async (
    params: PagedDistrictParams,
    signal: AbortSignal,
  ): Promise<{ pageData: PageResponse<BrowsableDistrict>; reference: boolean }> => {
    const { pageData, registeredCount } = await fetchPage(params, signal);
    const hasRegisteredDistricts = registeredCount ??
      (pageData.totalElements || (params.search ? (await getAll(signal)).length : 0));
    if (hasRegisteredDistricts) {
      return { pageData, reference: false };
    }
    const catalog = await loadReferenceDistricts(signal);
    return {
      pageData: paginateDistricts(catalog, params, district =>
        `${district.name} ${district.province} ${district.department} ${district.ubigeo}`),
      reference: true,
    };
  },
  getById: (id: number, signal?: AbortSignal) => api.get<District>(`/districts/${id}`, { signal }).then(r => r.data),
  create: (body: DistrictRequest) => api.post<District>('/districts', body).then(r => r.data),
  update: (id: number, body: DistrictRequest) => api.put<District>(`/districts/${id}`, body).then(r => r.data),
  remove: (id: number) => api.delete<void>(`/districts/${id}`),
};
