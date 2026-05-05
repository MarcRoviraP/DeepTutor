import { defineConfig } from 'vite';

export default defineConfig({
  // El GLB es un asset estático — Vite lo copia al dist/ con hash
  assetsInclude: ['**/*.glb'],
});
