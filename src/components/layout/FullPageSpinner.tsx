import { LoaderCircle } from 'lucide-react';

export function FullPageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Cargando">
      <LoaderCircle className="h-8 w-8 animate-spin text-sky-900 dark:text-sky-300" aria-hidden />
    </div>
  );
}
