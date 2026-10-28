/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/* Runs the Vercel password gate (middleware.ts) under `npm run dev` too, but
   only when SITE_PASSWORD is set — e.g. `SITE_PASSWORD=... npm run dev`.
   Only pages and /api/* are gated; Vite's own module requests pass through. */
function passwordGate(): Plugin {
  return {
    name: 'password-gate',
    apply: 'serve',
    configureServer(server) {
      if (!process.env.SITE_PASSWORD) return
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url ?? '/').split('?')[0]
        if (!(path === '/' || path.endsWith('.html') || path.startsWith('/api/'))) return next()

        const { default: middleware } = await server.ssrLoadModule('/middleware.ts')
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const request = new Request(new URL(req.url ?? '/', `http://${req.headers.host}`), {
          method: req.method,
          headers: req.headers as Record<string, string>,
          body: chunks.length ? Buffer.concat(chunks) : undefined,
        })
        const response: Response = await middleware(request)

        if (response.headers.get('x-middleware-next')) return next()
        const rewrite = response.headers.get('x-middleware-rewrite')
        if (rewrite) {
          req.url = new URL(rewrite).pathname
          return next()
        }
        res.statusCode = response.status
        response.headers.forEach((value, key) => res.setHeader(key, value))
        res.end(Buffer.from(await response.arrayBuffer()))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), passwordGate()],
  test: {
    // jsdom gives the sanitizer/validation tests a real DOMParser + document.
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  server: {
    // Honor a harness-assigned port (autoPort) via the PORT env var;
    // falls back to Vite's default 5173 for a normal `npm run dev`.
    port: Number(process.env.PORT) || 5173,
  },
  build: {
    rollupOptions: {
      input: {
        main:             'index.html',
        login:            'login.html',
        'design-system':  'design-system.html',
        tasks:            'tasks.html',
        dashboard:        'dashboard.html',
        'cs-before-meeting': 'cs-before-meeting.html',
        'meeting-creation-public': 'meeting-creation-public.html',
        blank:            'blank.html',
        form:             'form.html',
        documents:        'documents.html',
        meeting:          'meeting.html',
        'board-member':   'board-member.html',
        chats:            'chats.html',
        'board-book-page-nav': 'board-book-page-nav.html',
        'minutes-ai':       'minutes-ai.html',
        vtt:              'vtt.html',
      },
    },
  },
})
