import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const owner = process.env.GITHUB_REPOSITORY_OWNER ?? 'sukalov';
const repo =
  process.env.GITHUB_REPOSITORY?.split('/')[1] ??
  process.env.GITHUB_REPOSITORY_NAME ??
  'elizgrome';

export default defineConfig({
  output: 'static',
  site: `https://${owner}.github.io`,
  base: `/${repo}/`,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
