/** Error general de un formulario (lo que respondió el servidor), con la lista de campos si vino un 400. */
export function FormAlert({ message, details = [] }: { message: string | null; details?: string[] }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
      {message}
      {details.length > 0 && (
        <ul className="mt-1 list-disc pl-5">
          {details.map(detail => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
