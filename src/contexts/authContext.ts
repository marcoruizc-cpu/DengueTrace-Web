import { createContext } from 'react';
import type { LoginRequest, RegisterRequest, Role, User } from '../types/api';

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
}

export interface AuthContextValue extends AuthState {
  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  hasRole: (...roles: Role[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
