import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const VALID_SIZES = new Set([10, 25, 50, 100]);

function readNonNegative(value: string | null, fallback: number): number {
  if (value === null || !/^\d+$/.test(value)) return fallback;
  const result = Number(value);
  return Number.isSafeInteger(result) ? result : fallback;
}

export function usePaginationQuery() {
  const [params, setParams] = useSearchParams();
  const page = readNonNegative(params.get('page'), 0);
  const requestedSize = readNonNegative(params.get('size'), 10);
  const size = VALID_SIZES.has(requestedSize) ? requestedSize : 10;

  const update = useCallback((newPage: number, newSize: number) => {
    setParams(previous => {
      const updated = new URLSearchParams(previous);
      updated.set('page', String(Math.max(0, newPage)));
      updated.set('size', String(newSize));
      return updated;
    });
  }, [setParams]);

  return {
    page, size,
    setPage: (next: number) => update(next, size),
    setSize: (next: number) => update(0, next),
  };
}
