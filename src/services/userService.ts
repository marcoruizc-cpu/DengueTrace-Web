import { api } from '../api/client';
import type { User, UserUpdateRequest } from '../types/api';

export const userService = {
  me: (signal?: AbortSignal) => api.get<User>('/users/me', { signal }).then(r => r.data),
  updateMe: (body: UserUpdateRequest) => api.patch<User>('/users/me', body).then(r => r.data),
};
