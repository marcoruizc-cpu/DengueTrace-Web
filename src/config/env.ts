const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

/**
 * Uses a relative API path when the deployment provides a reverse proxy.
 * This keeps the client usable even if VITE_API_URL was omitted accidentally.
 */
export const API_URL = (configuredApiUrl || '/api/v1').replace(/\/+$/, '');

if (!configuredApiUrl && import.meta.env.PROD) {
  console.warn('VITE_API_URL no está configurada; se usará /api/v1 mediante el proxy del deployment.');
}
