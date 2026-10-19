
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // Preserve the existing local development URL.
  // Use the root path for production builds on Vercel.
  base: command === 'serve'
    ? '/security-compliance-scanner-frontend/'
    : '/',

  plugins: [react()],

  server: {
    host: true,
    port: 5173
  }
}));
