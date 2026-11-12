import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          // El navegador manda Origin: http://127.0.0.1:5173 y el CORS del backend lo rechaza con 403.
          // Como el proxy ya hace que la petición sea "del mismo origen", se quita ese encabezado.
          configure: proxy => {
            proxy.on('proxyReq', proxyReq => {
              proxyReq.removeHeader('origin');
            });
          },
        },
      },
    },
  };
});
