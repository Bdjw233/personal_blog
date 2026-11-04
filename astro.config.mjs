// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// 部署为 GitHub Pages「项目站点」：https://Bdjw233.github.io/personal_blog/
// 仓库名若变化，改这里的 base，并同步改 src/data/profile.ts 的 siteUrl 与 public/robots.txt
const site = process.env.SITE_URL ?? 'https://Bdjw233.github.io';
const base = '/personal_blog/';

export default defineConfig({
  site,
  base,
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: false,
    },
  },
});
