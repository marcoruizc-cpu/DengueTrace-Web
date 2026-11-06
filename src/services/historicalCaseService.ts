import { api } from '../api/client';
import type { HistoricalCase, HistoricalCaseRequest } from '../types/api';

export const historicalCaseService = {
  getByDistrict: (districtId: number, signal?: AbortSignal) =>
    api.get<HistoricalCase[]>(`/historical-cases/district/${districtId}`, { signal }).then(r => r.data),
  create: (body: HistoricalCaseRequest) => api.post<HistoricalCase>('/historical-cases', body).then(r => r.data),
};
