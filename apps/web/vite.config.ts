import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Use @brayanguti/react-chessmaster from its source (see its package.json "exports"),
    // so the site needs no package build and gets HMR on package edits
    conditions: ['source'],
  },
})
