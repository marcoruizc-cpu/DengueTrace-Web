import type { District } from '../../types/api';

interface AdminDistrictSelectProps {
  districts: District[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  includeAll?: boolean;
  required?: boolean;
  disabled?: boolean;
}

export function AdminDistrictSelect({
  districts,
  value,
  onChange,
  label,
  includeAll = false,
  required = false,
  disabled = false,
}: AdminDistrictSelectProps) {
  return (
    <label className="block space-y-1 text-sm font-medium">
      <span>{label}{required ? ' *' : ''}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-sky-600 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
        <option value="">{includeAll ? 'Todos los distritos' : 'Selecciona un distrito'}</option>
        {districts.map(district => (
          <option key={district.id} value={String(district.id)}>
            {district.name} — {district.department}
          </option>
        ))}
      </select>
    </label>
  );
}
