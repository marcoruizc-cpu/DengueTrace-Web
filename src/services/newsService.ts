import { api } from '../api/client';
import type { News } from '../types/api';

export const newsService = {
  getByDistrict: (districtId: number, signal?: AbortSignal) =>
    api.get<News[]>(`/news/district/${districtId}`, { signal }).then(r => r.data),
  /** 202 Accepted: el backend trae las noticias de GDELT en segundo plano. */
  sync: (districtId: number) => api.post<void>(`/news/district/${districtId}/sync`),
};
