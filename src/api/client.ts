import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { tokenStorage } from './tokenStorage';
import type { AuthResponse } from '../types/api';

export const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Instancia "limpia" solo para el refresh: sin interceptores, para evitar bucles.
const refreshClient = axios.create({ baseURL: API_URL, timeout: 15000 });

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number };

const isAuthCall = (url?: string) => !!url && url.startsWith('/auth/');

function isExpiringSoon(token: string, skewSeconds = 30) {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return exp * 1000 < Date.now() + skewSeconds * 1000;
  } catch {
    return true;
  }
}

// ---- Logout forzado: AuthProvider se suscribe para enterarse ----
const logoutListeners = new Set<() => void>();

export function onForcedLogout(listener: () => void) {
  logoutListeners.add(listener);
  return () => {
    logoutListeners.delete(listener);
  };
}

function forceLogout() {
  tokenStorage.clear();
  logoutListeners.forEach(listener => listener());
}

// ---- Refresh single-flight: si 5 peticiones lo necesitan, se hace UNA sola llamada ----
let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return Promise.reject(new Error('NO_REFRESH_TOKEN'));
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<AuthResponse>('/auth/refresh', null, { params: { refreshToken } }) // el backend lo espera como query param
      .then(({ data }) => {
        tokenStorage.save(data.accessToken, data.refreshToken);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// ---- Request: adjunta el token, refrescándolo antes si está por vencer ----
// (Spring devuelve 403 y no 401 cuando el token vencido llega como anónimo, por eso se refresca antes)
api.interceptors.request.use(async config => {
  if (isAuthCall(config.url)) return config;
  let token = tokenStorage.getAccess();
  if (tokenStorage.getRefresh() && (!token || isExpiringSoon(token))) {
    try {
      token = await refreshAccessToken();
    } catch {
      forceLogout();
      token = null;
    }
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Response: 401 → refresh + reintento; GET recuperable → reintento con backoff ----
const MAX_RETRIES = 2;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    if (!config || axios.isCancel(error)) return Promise.reject(error);
    const status = error.response?.status;

    if (status === 401 && !isAuthCall(config.url) && !config._retry && tokenStorage.getRefresh()) {
      config._retry = true;
      try {
        const token = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      } catch {
        forceLogout();
        return Promise.reject(error);
      }
    }

    // Solo GET: un POST que sí llegó al servidor se duplicaría al reintentarlo.
    const isGet = (config.method ?? 'get').toLowerCase() === 'get';
    const recoverable = !error.response || error.code === 'ECONNABORTED' || [502, 503, 504].includes(status ?? 0);
    config._retryCount = config._retryCount ?? 0;
    if (isGet && recoverable && config._retryCount < MAX_RETRIES) {
      config._retryCount += 1;
      await sleep(500 * 2 ** (config._retryCount - 1)); // 500 ms, luego 1 s
      return api(config);
    }
    return Promise.reject(error);
  },
);
