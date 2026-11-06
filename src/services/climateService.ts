import { api } from '../api/client';
import type { ClimateData, ClimateDataRequest } from '../types/api';

export const climateService = {
  getByDistrict: (districtId: number, signal?: AbortSignal) =>
    api.get<ClimateData[]>(`/climate-data/district/${districtId}`, { signal }).then(r => r.data),
  create: (body: ClimateDataRequest) => api.post<ClimateData>('/climate-data', body).then(r => r.data),
};
