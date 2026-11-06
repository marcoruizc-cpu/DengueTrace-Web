import { api } from '../api/client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/api';

export const authService = {
  login: (body: LoginRequest) => api.post<AuthResponse>('/auth/login', body).then(r => r.data),
  register: (body: RegisterRequest) => api.post<AuthResponse>('/auth/register', body).then(r => r.data),
};
