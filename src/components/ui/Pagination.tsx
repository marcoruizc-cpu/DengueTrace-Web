import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number; // backend pages use zero-based indexing
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  disabled?: boolean;
}

const SIZES = [10, 25, 50, 100] as const;

export function Pagination({
  page, size, totalElements, totalPages, onPageChange, onSizeChange, disabled = false,
}: PaginationProps) {
  const from = totalElements === 0 ? 0 : page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);
  const visiblePages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => Math.max(0, Math.min(page - 2, totalPages - 5)) + i,
  );

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
        Mostrando <strong>{from}–{to}</strong> de <strong>{totalElements}</strong> resultados
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="pagination-size" className="text-sm">Filas</label>
        <select
          id="pagination-size"
          value={size}
          disabled={disabled}
          onChange={e => onSizeChange(Number(e.target.value))}
          className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
        >
          {SIZES.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
        <button
          type="button" aria-label="Página anterior"
          onClick={() => onPageChange(page - 1)} disabled={disabled || page <= 0}
          className="rounded-lg border border-slate-300 p-2 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600"
        ><ChevronLeft className="h-4 w-4" aria-hidden /></button>
        {visiblePages.map(index => (
          <button
            key={index} type="button" aria-label={`Página ${index + 1}`}
            aria-current={index === page ? 'page' : undefined}
            disabled={disabled}
            onClick={() => onPageChange(index)}
            className={`min-w-9 rounded-lg px-2 py-2 text-sm ${index === page ? 'bg-sky-800 text-white' : 'border border-slate-300 dark:border-slate-600'}`}
          >{index + 1}</button>
        ))}
        <button
          type="button" aria-label="Página siguiente"
          onClick={() => onPageChange(page + 1)} disabled={disabled || page >= totalPages - 1}
          className="rounded-lg border border-slate-300 p-2 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600"
        ><ChevronRight className="h-4 w-4" aria-hidden /></button>
      </div>
    </nav>
  );
}
