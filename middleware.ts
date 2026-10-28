/* Vercel Routing Middleware — password gate for the whole prototype site.

   Runs on Vercel's edge before any page is served (it does nothing under
   `npm run dev`). Every request without a valid session cookie is rewritten
   to /login.html, so the password screen is the first thing a visitor sees,
   at whatever URL they opened.

   The password is never in the repo: it lives in the Vercel env var
   SITE_PASSWORD. The cookie holds a SHA-256 of it (not the password itself),
   so changing SITE_PASSWORD signs everyone out.

   Endpoints handled here:
     POST /api/login   { password }  → 204 + Set-Cookie, or 401
     GET  /api/logout                 → clears the cookie, redirects to / */

export const config = {
  // Hashed build assets stay public so the login page itself can load.
  matcher: ['/((?!assets/).*)'],
}

const COOKIE = 'board_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

async function sessionToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`board-gate:v1:${password}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('')
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get('cookie') ?? ''
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return v.join('=')
  }
  return undefined
}

// Same contract as `next()` / `rewrite()` from @vercel/functions.
const next = () => new Response(null, { headers: { 'x-middleware-next': '1' } })
const rewrite = (url: URL) => new Response(null, { headers: { 'x-middleware-rewrite': url.toString() } })

export default async function middleware(req: Request): Promise<Response> {
  const password = process.env.SITE_PASSWORD
  // Fail closed: never serve the site unprotected because of a missing env var.
  if (!password) return new Response('SITE_PASSWORD is not configured.', { status: 503 })

  const url = new URL(req.url)
  const expected = await sessionToken(password)
  const authed = safeEqual(readCookie(req, COOKIE) ?? '', expected)

  if (url.pathname === '/api/login') {
    if (req.method !== 'POST') return new Response(null, { status: 405 })
    let input = ''
    try {
      input = String((await req.json() as { password?: unknown }).password ?? '')
    } catch { /* malformed body → treated as wrong password */ }

    if (!safeEqual(await sessionToken(input), expected)) {
      // Slow down guessing — there is no shared state at the edge for a real lockout.
      await new Promise(r => setTimeout(r, 1000))
      return new Response(null, { status: 401 })
    }
    return new Response(null, {
      status: 204,
      headers: {
        'set-cookie': `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        'cache-control': 'no-store',
      },
    })
  }

  if (url.pathname === '/api/logout') {
    return new Response(null, {
      status: 303,
      headers: {
        location: '/',
        'set-cookie': `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
      },
    })
  }

  if (authed) {
    // Already signed in — don't show the password screen again.
    if (url.pathname === '/login.html') return Response.redirect(new URL('/', url), 303)
    return next()
  }

  if (url.pathname === '/login.html') return next()
  return rewrite(new URL('/login.html', url))
}
