import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const HF_BACKEND = 'https://ahmed-x-18-aries-datapipe.hf.space';
const AI_BACKEND = 'https://datapipe-ai-assistant.onrender.com';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_PROXY_TARGET || HF_BACKEND;
  const aiProxyTarget = env.VITE_AI_API_PROXY_TARGET || AI_BACKEND;

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
        '/ai-api': {
          target: aiProxyTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/ai-api/, ''),
        },
      },
    },
  };
});
