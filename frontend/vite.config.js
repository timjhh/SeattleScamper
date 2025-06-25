import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  plugins: [react()],
  define: {
    'import.meta.env.ENV_VARIABLE': JSON.stringify(process.env.ENV_VARIABLE),
    'process.env': env,
    // By default, Vite doesn't include shims for NodeJS/
    // necessary for segment analytics lib to work
    global: {
    },
  },
  }
})
