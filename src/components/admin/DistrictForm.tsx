import { useState, type FormEvent } from 'react';
import type { District, DistrictRequest } from '../../types/api';

interface DistrictFormProps {
  initial?: District | null;
  saving: boolean;
  onSave: (body: DistrictRequest) => Promise<void>;
  onCancel: () => void;
}

type FormValues = {
  name: string;
  department: string;
  province: string;
  population: string;
  latitude: string;
  longitude: string;
};

function initialValues(district?: District | null): FormValues {
  return {
    name: district?.name ?? '',
    department: district?.department ?? 'Lima',
    province: district?.province ?? 'Lima',
    population: district?.population?.toString() ?? '',
    latitude: district?.latitude?.toString() ?? '',
    longitude: district?.longitude?.toString() ?? '',
  };
}

const fieldClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-offset-2 focus:outline-sky-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100';

export function DistrictForm({ initial, saving, onSave, onCancel }: DistrictFormProps) {
  const [values, setValues] = useState<FormValues>(() => initialValues(initial));
  const [validationError, setValidationError] = useState('');

  const update = (key: keyof FormValues, value: string) => {
    setValues(current => ({ ...current, [key]: value }));
    setValidationError('');
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const name = values.name.trim();
    const department = values.department.trim();
    if (!name || !department) {
      setValidationError('El nombre y el departamento son obligatorios.');
      return;
    }

    const population = values.population.trim() === '' ? null : Number(values.population);
    const latitude = values.latitude.trim() === '' ? null : Number(values.latitude);
    const longitude = values.longitude.trim() === '' ? null : Number(values.longitude);

    if (population !== null && (!Number.isSafeInteger(population) || population < 0)) {
      setValidationError('La población debe ser un número entero mayor o igual a cero.');
      return;
    }
    if (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
      setValidationError('La latitud debe estar entre -90 y 90.');
      return;
    }
    if (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
      setValidationError('La longitud debe estar entre -180 y 180.');
      return;
    }
    if ((latitude === null) !== (longitude === null)) {
      setValidationError('Ingresa ambas coordenadas o déjalas vacías para usar geocodificación.');
      return;
    }

    await onSave({
      name,
      department,
      province: values.province.trim() || null,
      population,
      latitude,
      longitude,
    });
  }

  return (
    <form onSubmit={event => void handleSubmit(event)} className="space-y-4 rounded-xl border border-sky-200 bg-sky-50/50 p-5 dark:border-sky-900 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-semibold">{initial ? `Editar distrito #${initial.id}` : 'Nuevo distrito'}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Los campos marcados con * son obligatorios.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          <span>Nombre *</span>
          <input className={fieldClass} value={values.name} onChange={e => update('name', e.target.value)} required maxLength={120} placeholder="Ej. Miraflores" />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Departamento *</span>
          <input className={fieldClass} value={values.department} onChange={e => update('department', e.target.value)} required maxLength={120} />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Provincia</span>
          <input className={fieldClass} value={values.province} onChange={e => update('province', e.target.value)} maxLength={120} />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Población</span>
          <input type="number" className={fieldClass} min={0} step={1} value={values.population} onChange={e => update('population', e.target.value)} placeholder="Opcional" />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Latitud</span>
          <input type="number" className={fieldClass} min={-90} max={90} step="any" value={values.latitude} onChange={e => update('latitude', e.target.value)} placeholder="Ej. -12.1211" />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Longitud</span>
          <input type="number" className={fieldClass} min={-180} max={180} step="any" value={values.longitude} onChange={e => update('longitude', e.target.value)} placeholder="Ej. -77.0297" />
        </label>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400">Si dejas ambas coordenadas vacías, el backend intentará obtenerlas por geocodificación.</p>
      {validationError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{validationError}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="rounded-lg bg-sky-800 px-4 py-2 font-medium text-white disabled:opacity-60">
          {saving ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear distrito'}
        </button>
        <button type="button" disabled={saving} onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-60 dark:border-slate-600">
          Cancelar
        </button>
      </div>
    </form>
  );
}
