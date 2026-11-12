import type { AppError } from '../../api/errors';
import { FormAlert } from '../layout/FormAlert';
import { Button } from '../ui/Button';

export function QueryState({ loading, error, reload }: {
  loading: boolean;
  error: AppError | null;
  reload: () => void;
}) {
  if (loading) return <p role="status" className="text-sm">Cargando datos…</p>;
  if (!error) return null;

  return (
    <div className="space-y-2">
      <FormAlert message={error.message} />
      <Button variant="secondary" onClick={reload}>Reintentar</Button>
    </div>
  );
}
