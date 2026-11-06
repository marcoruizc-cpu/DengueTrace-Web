/**
 * Access token: solo en memoria (no queda en localStorage, un script inyectado no lo encuentra).
 * Refresh token: en sessionStorage (sobrevive a un F5, muere al cerrar la pestaña).
 */
const REFRESH_KEY = 'dt_refresh';
let accessToken: string | null = null;

export const tokenStorage = {
  getAccess: () => accessToken,
  setAccess: (token: string | null) => {
    accessToken = token;
  },
  getRefresh: () => sessionStorage.getItem(REFRESH_KEY),
  setRefresh: (token: string | null) => {
    if (token) sessionStorage.setItem(REFRESH_KEY, token);
    else sessionStorage.removeItem(REFRESH_KEY);
  },
  save(access: string, refresh: string) {
    accessToken = access;
    sessionStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    accessToken = null;
    sessionStorage.removeItem(REFRESH_KEY);
  },
};
