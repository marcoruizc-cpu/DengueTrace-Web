import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { toAppError } from '../../api/errors';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { FormAlert } from '../../components/layout/FormAlert';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  email: z.string().min(1, 'Ingresa tu correo').email('Correo no válido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});
type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    mode: 'onChange', // validación en tiempo real
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginForm) => {
    setServerError(null);
    try {
      await login(values);
      toast.success('¡Bienvenido de vuelta!');
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(toAppError(err, { 401: 'Correo o contraseña incorrectos.' }).message);
    }
  };

  return (
    <AuthLayout title="Inicia sesión" subtitle="Consulta el riesgo de dengue en tu distrito">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormAlert message={serverError} />
        <Input label="Correo" type="email" autoComplete="email" placeholder="tu@correo.com" error={errors.email?.message} {...register('email')} />
        <Input label="Contraseña" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <Button type="submit" loading={isSubmitting}>
          Ingresar
        </Button>
        <p className="text-center text-sm text-slate-600 dark:text-slate-300">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-sky-700 underline dark:text-sky-300">
            Regístrate
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
