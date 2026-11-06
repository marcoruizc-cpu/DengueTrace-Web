import { api } from '../api/client';
import type { District, DistrictRequest } from '../types/api';

export const districtService = {
  getAll: (signal?: AbortSignal) => api.get<District[]>('/districts', { signal }).then(r => r.data),
  getById: (id: number, signal?: AbortSignal) => api.get<District>(`/districts/${id}`, { signal }).then(r => r.data),
  create: (body: DistrictRequest) => api.post<District>('/districts', body).then(r => r.data),
  update: (id: number, body: DistrictRequest) => api.put<District>(`/districts/${id}`, body).then(r => r.data),
  remove: (id: number) => api.delete<void>(`/districts/${id}`),
};
