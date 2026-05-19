import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables including system ones
  const env = loadEnv(mode, process.cwd(), '');
  
  // Cloud Run provides the port in the PORT environment variable
  const port = parseInt(process.env.PORT || '8080');

  return {
    plugins: [react()],
    define: {
    },
    server: {
      port: port,
      host: '0.0.0.0'
    },
    preview: {
      port: port,
      host: '0.0.0.0'
    }
  };
});