import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main:             'index.html',
        'design-system':  'design-system.html',
        tasks:            'tasks.html',
        dashboard:        'dashboard.html',
        'cs-before-meeting': 'cs-before-meeting.html',
        blank:            'blank.html',
        form:             'form.html',
      },
    },
  },
})
