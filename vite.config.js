import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ⚠️  GitHub Pages: set base to your repo name, e.g. '/my-portfolio/'
// If using a custom domain (username.github.io), keep base as '/'
export default defineConfig({
  plugins: [react()],
  base: '/personal-site/',
});
