import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { toAppError } from '../../api/errors';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { FormAlert } from '../../components/layout/FormAlert';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { districtService } from '../../services/districtService';
import { PHONE_REGEX, toE164 } from '../../utils/phone';

const schema = z
  .object({
    fullName: z.string().trim().min(3, 'Ingresa tu nombre completo'),
    email: z.string().min(1, 'Ingresa tu correo').email('Correo no válido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Repite tu contraseña'),
    phone: z.string().regex(PHONE_REGEX, 'Celular de 9 dígitos que empieza con 9').or(z.literal('')),
    districtId: z.string(), // valor del <select>; '' = elegir después
  })
  .refine(d => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Las contraseñas no coinciden' });
type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
  // `register` de React Hook Form choca con `register` del contexto: se renombra.
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const districts = useFetch(signal => districtService.getAll(signal), []);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', phone: '', districtId: '' },
  });

  const onSubmit = async ({ fullName, email, password, phone, districtId }: RegisterForm) => {
    setServerError(null);
    setFieldErrors([]);
    try {
      await registerUser({
        fullName,
        email,
        password,
        phone: toE164(phone),
        districtId: districtId ? Number(districtId) : undefined,
      });
      toast.success('¡Cuenta creada! Bienvenido a DengueTrace.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const appError = toAppError(err, { 409: 'Ya existe una cuenta con ese correo.' });
      setServerError(appError.message);
      setFieldErrors(appError.fieldErrors);
    }
  };

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Recibe alertas de dengue de tu distrito">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormAlert message={serverError} details={fieldErrors} />
        <Input label="Nombre completo" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Correo" type="email" autoComplete="email" placeholder="tu@correo.com" error={errors.email?.message} {...register('email')} />
        <Input label="Contraseña" type="password" autoComplete="new-password" hint="Mínimo 8 caracteres" error={errors.password?.message} {...register('password')} />
        <Input label="Repite la contraseña" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Input
          label="Celular (opcional)"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="987654321"
          hint="Para recibir alertas por SMS"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Select
          label="Distrito donde vives (opcional)"
          disabled={districts.loading}
          hint={districts.error ? 'No pudimos cargar los distritos. Puedes elegirlo luego en tu perfil.' : undefined}
          {...register('districtId')}
        >
          <option value="">{districts.loading ? 'Cargando distritos…' : 'Elegir después'}</option>
          {districts.data?.map(d => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.department})
            </option>
          ))}
        </Select>
        <Button type="submit" loading={isSubmitting}>
          Crear cuenta
        </Button>
        <p className="text-center text-sm text-slate-600 dark:text-slate-300">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-sky-700 underline dark:text-sky-300">
            Inicia sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
