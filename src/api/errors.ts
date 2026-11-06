import axios from 'axios';
import type { ApiErrorBody } from '../types/api';

export type AppErrorKind = 'network' | 'timeout' | 'canceled' | 'http' | 'unknown';

export interface AppError {
  kind: AppErrorKind;
  status: number | null;
  message: string;
  fieldErrors: string[];
}

const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'Revisa los datos ingresados.',
  401: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'No encontramos lo que buscas.',
  409: 'Ese registro ya existe.',
  500: 'Tuvimos un problema en el servidor. Intenta de nuevo en unos minutos.',
};

/**
 * Convierte cualquier error de axios en un mensaje amigable en español.
 * overrides: mensajes específicos de una pantalla, por ejemplo { 401: 'Correo o contraseña incorrectos.' }
 */
export function toAppError(err: unknown, overrides: Partial<Record<number, string>> = {}): AppError {
  if (axios.isCancel(err)) return { kind: 'canceled', status: null, message: '', fieldErrors: [] };

  if (axios.isAxiosError(err)) {
    if (err.code === 'ECONNABORTED') {
      return { kind: 'timeout', status: null, message: 'El servidor tardó demasiado en responder.', fieldErrors: [] };
    }
    if (!err.response) {
      return {
        kind: 'network',
        status: null,
        fieldErrors: [],
        message: navigator.onLine ? 'No pudimos conectar con el servidor.' : 'Estás sin conexión a internet.',
      };
    }
    const status = err.response.status;
    const body = err.response.data as Partial<ApiErrorBody> | undefined;
    const fallback = status >= 500 ? DEFAULT_MESSAGES[500] : (DEFAULT_MESSAGES[status] ?? 'Ocurrió un error inesperado.');
    return { kind: 'http', status, message: overrides[status] ?? fallback, fieldErrors: body?.details ?? [] };
  }

  return { kind: 'unknown', status: null, message: 'Ocurrió un error inesperado.', fieldErrors: [] };
}
