import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

/*
 * Library build: dist/index.js (ESM) + dist/style.css + dist/index.d.ts.
 * - react and zustand stay external: the host app provides a single copy of each.
 * - The banner makes the bundle a client component in Next.js and imports the CSS, so users
 *   never have to import a stylesheet themselves.
 * - Images and sounds are inlined as data URIs (Vite library mode), so there are no extra
 *   files to serve and no bundler configuration needed on the host side.
 */
export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/__tests__'],
      // One declaration file with only the public API from src/index.ts
      rollupTypes: true,
    }),
  ],
  css: {
    modules: {
      // Readable and namespaced, so class names are easy to inspect and never clash with the host
      generateScopedName: 'rcm_[local]_[hash:base64:5]',
    },
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    // The host app minifies; readable output is easier to debug and review
    minify: false,
    rollupOptions: {
      external: [/^react(\/.*)?$/, /^zustand(\/.*)?$/],
      output: {
        banner: '"use client";\nimport "./style.css";',
      },
    },
  },
});
