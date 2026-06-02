import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const owner = process.env.GITHUB_REPOSITORY_OWNER ?? 'username';

export default defineConfig({
  output: 'static',
  site: `https://${owner}.github.io`,
  base: '/',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
