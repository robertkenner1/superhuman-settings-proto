import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['id.localhost', 'home.localhost', 'settings.localhost', 'account.localhost', 'admin.localhost', 'components.localhost'],
  },
})
