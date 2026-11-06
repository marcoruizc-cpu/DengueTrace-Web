import axios from 'axios';
import { api } from '../api/client';
import type { PredictiveModel } from '../types/api';

export const predictiveService = {
  /** Devuelve null si el distrito todavía no tiene modelo (el backend responde 404). */
  getLatest: async (districtId: number, signal?: AbortSignal): Promise<PredictiveModel | null> => {
    try {
      const { data } = await api.get<PredictiveModel>(`/predictive-models/district/${districtId}/latest`, { signal });
      return data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) return null;
      throw e;
    }
  },
  getHistory: (districtId: number, signal?: AbortSignal) =>
    api.get<PredictiveModel[]>(`/predictive-models/district/${districtId}/history`, { signal }).then(r => r.data),
  generate: (districtId: number) =>
    api.post<PredictiveModel>(`/predictive-models/district/${districtId}/generate`).then(r => r.data),
};
