import { useCallback, useEffect, useState, type DependencyList } from 'react';
import { toAppError, type AppError } from '../api/errors';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

/**
 * Hace un GET al montar y cada vez que cambian los deps.
 * Cancela la petición anterior con AbortController (sin memory leaks ni respuestas "viejas").
 */
export function useFetch<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const data = await fetcher(controller.signal);
        setState({ data, loading: false, error: null });
      } catch (err) {
        const appError = toAppError(err);
        if (appError.kind === 'canceled') return;
        setState({ data: null, loading: false, error: appError });
      }
    };
    void run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const reload = useCallback(() => setReloadKey(k => k + 1), []);
  const setData = useCallback((data: T) => setState(prev => ({ ...prev, data })), []);

  return { ...state, reload, setData };
}
