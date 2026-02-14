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
      // This shim allows the code to access the API key via process.env.API_KEY
      // prioritizing the system environment variable over local .env files
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.VITE_GEMINI_API_KEY || '')
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