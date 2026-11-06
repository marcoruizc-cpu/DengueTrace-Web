import clsx from 'clsx';
import type { ComponentPropsWithRef } from 'react';

type SelectProps = ComponentPropsWithRef<'select'> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Select({ label, error, hint, id, name, className, children, ...rest }: SelectProps) {
  const selectId = id ?? name;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selectId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <select
        {...rest}
        id={selectId}
        name={name}
        aria-invalid={!!error}
        className={clsx(
          'rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 dark:bg-slate-900 dark:text-white',
          error ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-sky-100 dark:border-slate-600',
          className,
        )}
      >
        {children}
      </select>
      {error ? <p className="text-xs text-red-600">{error}</p> : hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
