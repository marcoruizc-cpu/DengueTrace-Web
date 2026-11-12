# DengueTrace — Frontend Web

Plataforma de vigilancia y predicción del dengue en Perú. Esta es la aplicación web (React + TypeScript) que consume la API REST de [DengueTrace-Backend](https://github.com/elireyes-web/DengueTrace-Backend).

- **Producción:** https://dengue-trace-web.vercel.app
- **App móvil:** [DengueTrace-Mobile](https://github.com/marcoruizc-cpu/DengueTrace-Mobile)

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · React Router · Axios · React Hook Form + Zod · react-hot-toast · lucide-react

## Funcionalidades

- Registro, inicio de sesión y perfil (canal de alertas PUSH/SMS, distrito, radio de alerta).
- Sesión con JWT: access token en memoria, refresh token en `sessionStorage`, renovación automática (single-flight) y cierre de sesión forzado si el refresh falla.
- Cliente Axios centralizado con interceptores, `AbortController` en todas las consultas y reintentos con backoff solo en GET.
- Rutas protegidas por sesión y por rol (USER, MODERATOR, ADMIN), carga diferida con `React.lazy`, página 404 y breadcrumbs.
- Panel de administración: distritos (CRUD), alertas, casos históricos, datos climáticos y generación del modelo predictivo.
- Listados paginados consumiendo endpoints paginados del backend.
- Manejo de errores con mensajes en español por código HTTP, `ErrorBoundary` y validación en tiempo real.

## Cómo correrlo

Requisitos: Node 20 o superior.

```bash
npm install
cp .env.example .env   # en Windows: copy .env.example .env
npm run dev            # http://localhost:5173
```

Otros comandos: `npm run build` (compila a `dist/`) y `npm run lint`.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | Ruta base de la API. Con `/api/v1` (o vacía) se usa el proxy de Vite en desarrollo y la regla de `vercel.json` en producción. |
| `VITE_API_PROXY_TARGET` | Backend al que reenvía el proxy de Vite en desarrollo (por ejemplo `http://localhost:8080`). |
| `VITE_GOOGLE_MAPS_API_KEY` | Key de Google Maps para el navegador (restringida por dominio). |
| `VITE_GOOGLE_MAPS_MAP_ID` | Map ID de Google Maps. |

Los valores reales van en `.env`, que no se sube al repositorio.

## Estructura

```text
src/
  api/          cliente Axios, tokens y traductor de errores
  services/     una capa por recurso del backend (GET/POST/PUT/PATCH/DELETE)
  contexts/     estado global de la sesión (useReducer)
  hooks/        useAuth, useFetch, paginación, debounce
  components/   ui/ (kit reutilizable), layout/, admin/
  pages/        vistas por módulo
  routes/       router, rutas protegidas y por rol
  config/       lectura de variables de entorno
  types/        tipos que reflejan los DTOs del backend
  utils/        constantes, geolocalización, teléfono
```

## Despliegue

Vercel, desde la rama `main`. `vercel.json` reenvía `/api/*` al backend y el resto de rutas a `index.html` (SPA).
