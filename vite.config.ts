import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const HF_BACKEND = 'https://ahmed-x-18-aries-datapipe.hf.space';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_PROXY_TARGET || HF_BACKEND;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
