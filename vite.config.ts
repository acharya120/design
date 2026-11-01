import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: { exclude: ['replicad-opencascadejs'] },
  build: { chunkSizeWarningLimit: 2500 },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
