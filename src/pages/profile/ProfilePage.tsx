import { zodResolver } from '@hookform/resolvers/zod';
import { BellOff, BellRing, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { toAppError } from '../../api/errors';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { districtService } from '../../services/districtService';
import { userService } from '../../services/userService';
import { PHONE_REGEX, toE164, toLocalPhone } from '../../utils/phone';

const ROLE_LABELS = { USER: 'Ciudadano', MODERATOR: 'Moderador', ADMIN: 'Administrador' } as const;

const schema = z
  .object({
    fullName: z.string().trim().min(3, 'Ingresa tu nombre completo'),
    phone: z.string().regex(PHONE_REGEX, 'Celular de 9 dígitos que empieza con 9').or(z.literal('')),
    districtId: z.string(),
    preferredChannel: z.enum(['PUSH', 'SMS']),
    alertRadiusKm: z.string().regex(/^\d+$/, 'Ingresa un número entero').refine(v => Number(v) >= 1, 'Mínimo 1 km'),
  })
  .refine(d => d.preferredChannel !== 'SMS' || d.phone !== '', {
    path: ['phone'],
    message: 'Para recibir SMS necesitas registrar un celular',
  });
type ProfileForm = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const districts = useFetch(signal => districtService.getAll(signal), []);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      fullName: user?.fullName ?? '',
      phone: toLocalPhone(user?.phone),
      districtId: user?.districtId ? String(user.districtId) : '',
      preferredChannel: user?.preferredChannel ?? 'PUSH',
      alertRadiusKm: String(user?.alertRadiusKm ?? 5),
    },
  });

  if (!user) return null; // ProtectedRoute ya garantiza sesión; esto solo satisface a TypeScript

  const onSubmit = async (values: ProfileForm) => {
    try {
      const updated = await userService.updateMe({
        fullName: values.fullName,
        phone: toE164(values.phone),
        districtId: values.districtId ? Number(values.districtId) : undefined,
        preferredChannel: values.preferredChannel,
        alertRadiusKm: Number(values.alertRadiusKm),
      });
      setUser(updated);
      reset(values); // el formulario vuelve a quedar "sin cambios"
      toast.success('Perfil actualizado');
    } catch (err) {
      toast.error(toAppError(err).message);
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[1fr_2fr]">
      <section className="h-fit rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-2xl font-bold text-sky-900">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <h1 className="mt-3 text-center text-lg font-semibold">{user.fullName}</h1>
        <p className="text-center text-sm text-slate-500">{user.email}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Rol</dt>
            <dd className="font-medium">{ROLE_LABELS[user.role]}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Distrito</dt>
            <dd className="font-medium">{user.districtName ?? 'Sin elegir'}</dd>
          </div>
        </dl>
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
          {user.pushRegistered ? (
            <BellRing className="h-4 w-4 text-green-600" aria-hidden />
          ) : (
            <BellOff className="h-4 w-4 text-slate-400" aria-hidden />
          )}
          {user.pushRegistered ? 'Notificaciones push activas' : 'Push no registrado (actívalo desde la app móvil)'}
        </p>
        <Button variant="secondary" className="mt-4 w-full" onClick={() => setConfirmLogout(true)}>
          <LogOut className="h-4 w-4" aria-hidden />
          Cerrar sesión
        </Button>
      </section>

      <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <h2 className="text-lg font-semibold">Mis datos y alertas</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 flex flex-col gap-4">
          <Input label="Nombre completo" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
          <Input
            label="Celular"
            inputMode="numeric"
            placeholder="987654321"
            hint="9 dígitos. Lo usamos solo para las alertas por SMS."
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Select label="Distrito donde vives" disabled={districts.loading} {...register('districtId')}>
            <option value="">{districts.loading ? 'Cargando distritos…' : 'Sin elegir'}</option>
            {districts.data?.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.department})
              </option>
            ))}
          </Select>

          <fieldset>
            <legend className="text-sm font-medium text-slate-700 dark:text-slate-200">¿Cómo quieres recibir las alertas?</legend>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="PUSH" {...register('preferredChannel')} />
                Notificación push
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="SMS" {...register('preferredChannel')} />
                SMS
              </label>
            </div>
          </fieldset>

          <Input
            label="Radio de alerta (km)"
            type="number"
            min={1}
            inputMode="numeric"
            hint="Te avisamos si hay riesgo en distritos dentro de este radio."
            error={errors.alertRadiusKm?.message}
            {...register('alertRadiusKm')}
          />

          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </section>

      <ConfirmDialog
        open={confirmLogout}
        title="Cerrar sesión"
        description="¿Seguro que quieres salir de DengueTrace?"
        confirmLabel="Cerrar sesión"
        onConfirm={logout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}
