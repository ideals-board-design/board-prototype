import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Honor a harness-assigned port (autoPort) via the PORT env var;
    // falls back to Vite's default 5173 for a normal `npm run dev`.
    port: Number(process.env.PORT) || 5173,
  },
  build: {
    rollupOptions: {
      input: {
        main:             'index.html',
        'design-system':  'design-system.html',
        tasks:            'tasks.html',
        dashboard:        'dashboard.html',
        'cs-before-meeting': 'cs-before-meeting.html',
        'meeting-creation-public': 'meeting-creation-public.html',
        blank:            'blank.html',
        form:             'form.html',
        documents:        'documents.html',
        chats:            'chats.html',
      },
    },
  },
})
