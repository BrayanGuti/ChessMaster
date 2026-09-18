import { defineConfig, transformWithEsbuild, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';

/** Minifies the engine worker, which is inlined into the package as a string (see jsChessEngine.ts). */
function minifyWorker(): Plugin {
  return {
    name: 'minify-worker',
    async renderChunk(code, chunk) {
      const result = await transformWithEsbuild(code, chunk.fileName, { minify: true, legalComments: 'inline' });
      return { code: result.code, map: result.map };
    },
  };
}

/*
 * Library build: dist/index.js (ESM) + dist/style.css + dist/index.d.ts.
 * - react, zustand and js-chess-engine stay external: the host app provides a single copy of each.
 * - The entry banner makes the bundle a client component in Next.js and imports the CSS, so users
 *   never have to import a stylesheet themselves.
 * - Images and sounds are inlined as data URIs (Vite library mode), so there are no extra
 *   files to serve and no bundler configuration needed on the host side.
 * - The engine runs in an inlined Web Worker, in a lazily loaded chunk (only fetched when a game
 *   against the computer starts). The worker bundles its own copy of js-chess-engine (MIT).
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
  worker: {
    format: 'es',
    plugins: () => [minifyWorker()],
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
      external: [/^react(\/.*)?$/, /^zustand(\/.*)?$/, /^js-chess-engine(\/.*)?$/],
      output: {
        banner: (chunk) => (chunk.isEntry ? '"use client";\nimport "./style.css";' : ''),
      },
    },
  },
});
