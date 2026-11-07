import { api } from '../api/client';
import type { PageResponse, Report, ReportRequest } from '../types/api';

export const reportService = {
  create: (body: ReportRequest) => api.post<Report>('/reports', body).then(r => r.data),
  getMine: (signal?: AbortSignal) => api.get<Report[]>('/reports/me', { signal }).then(r => r.data),
  getPaged: (page: number, size: number, signal?: AbortSignal) =>
    api.get<PageResponse<Report>>('/reports/paged', { params: { page, size }, signal }).then(r => r.data),
  getAll: (signal?: AbortSignal) => api.get<Report[]>('/reports', { signal }).then(r => r.data),
  getById: (id: number, signal?: AbortSignal) => api.get<Report>(`/reports/${id}`, { signal }).then(r => r.data),
  getByDistrictName: (name: string, signal?: AbortSignal) =>
    api.get<Report[]>(`/reports/district/${encodeURIComponent(name)}`, { signal }).then(r => r.data),
  remove: (id: number) => api.delete<void>(`/reports/${id}`),
};
