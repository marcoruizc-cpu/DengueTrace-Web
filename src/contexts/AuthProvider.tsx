import axios from 'axios';
import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { onForcedLogout, refreshAccessToken } from '../api/client';
import { tokenStorage } from '../api/tokenStorage';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import type { LoginRequest, RegisterRequest, Role, User } from '../types/api';
import { AuthContext, type AuthState } from './authContext';

type AuthAction =
  | { type: 'SIGNED_IN'; user: User }
  | { type: 'SIGNED_OUT' }
  | { type: 'USER_UPDATED'; user: User };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SIGNED_IN':
      return { status: 'authenticated', user: action.user };
    case 'USER_UPDATED':
      return { ...state, user: action.user };
    case 'SIGNED_OUT':
      return { status: 'anonymous', user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, { status: 'checking', user: null });

  // Al cargar la página: si hay refresh token, se recupera la sesión.
  useEffect(() => {
    const controller = new AbortController();
    const restoreSession = async () => {
      if (!tokenStorage.getRefresh()) {
        dispatch({ type: 'SIGNED_OUT' });
        return;
      }
      try {
        await refreshAccessToken();
        const me = await userService.me(controller.signal);
        dispatch({ type: 'SIGNED_IN', user: me });
      } catch (e) {
        if (axios.isCancel(e)) return;
        tokenStorage.clear();
        dispatch({ type: 'SIGNED_OUT' });
      }
    };
    void restoreSession();
    const unsubscribe = onForcedLogout(() => dispatch({ type: 'SIGNED_OUT' }));
    return () => {
      controller.abort();
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (body: LoginRequest) => {
    const res = await authService.login(body);
    tokenStorage.save(res.accessToken, res.refreshToken);
    dispatch({ type: 'SIGNED_IN', user: res.user });
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    const res = await authService.register(body);
    tokenStorage.save(res.accessToken, res.refreshToken);
    dispatch({ type: 'SIGNED_IN', user: res.user });
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    dispatch({ type: 'SIGNED_OUT' });
  }, []);

  const setUser = useCallback((user: User) => dispatch({ type: 'USER_UPDATED', user }), []);

  const hasRole = useCallback(
    (...roles: Role[]) => !!state.user && roles.includes(state.user.role),
    [state.user],
  );

  const value = useMemo(
    () => ({ ...state, login, register, logout, setUser, hasRole }),
    [state, login, register, logout, setUser, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
