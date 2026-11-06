import { api } from '../api/client';
import type { Alert, AlertCreateRequest } from '../types/api';

export const alertService = {
  getActive: (signal?: AbortSignal) => api.get<Alert[]>('/alerts', { signal }).then(r => r.data),
  getByDistrict: (districtId: number, signal?: AbortSignal) =>
    api.get<Alert[]>(`/alerts/district/${districtId}`, { signal }).then(r => r.data),
  create: (body: AlertCreateRequest) => api.post<Alert>('/alerts', body).then(r => r.data),
  deactivate: (id: number) => api.patch<void>(`/alerts/${id}/deactivate`),
};
