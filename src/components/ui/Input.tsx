import clsx from 'clsx';
import type { ComponentPropsWithRef } from 'react';

type InputProps = ComponentPropsWithRef<'input'> & {
  label: string;
  error?: string;
  hint?: string;
};

/** Compatible con {...register('campo')} de React Hook Form (en React 19, `ref` llega como prop). */
export function Input({ label, error, hint, id, name, className, ...rest }: InputProps) {
  const inputId = id ?? name;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <input
        {...rest}
        id={inputId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={clsx(
          'rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 dark:bg-slate-900 dark:text-white',
          error
            ? 'border-red-500 focus:ring-red-200'
            : 'border-slate-300 focus:border-sky-600 focus:ring-sky-100 dark:border-slate-600',
          className,
        )}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className="text-xs text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
