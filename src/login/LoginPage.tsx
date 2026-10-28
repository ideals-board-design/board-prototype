/* LoginPage — password gate shown before the hub.

   On Vercel, middleware.ts rewrites every unauthenticated request to this
   page, so it renders at whatever URL the visitor opened. On success the
   page reloads that same URL — now with the session cookie — which lands the
   visitor on the hub (or the deep link they followed). */

import { useState, type FormEvent } from 'react'
import { TextField } from '../components/TextField/TextField'
import { Button } from '../components/Button/Button'
import { useTheme } from '../hooks/useTheme'
import logoSvg from '../hub/logo-sidebar.svg?raw'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  useTheme() // keep the visitor's saved light/dark preference on this screen too

  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!password) {
      setError('Enter the password')
      return
    }
    setLoading(true)
    setError(undefined)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        // /login.html itself is not a destination — go to the hub instead.
        window.location.replace(window.location.pathname === '/login.html' ? '/' : window.location.href)
        return
      }
      setError(res.status === 401 ? 'Incorrect password' : 'Something went wrong. Try again.')
    } catch {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className={styles.shell}>
      <main className={styles.card}>
        <span className={styles.logo} dangerouslySetInnerHTML={{ __html: logoSvg }} aria-hidden />

        <div className={styles.heading}>
          <h1 className={styles.title}>Enter password</h1>
          <p className={styles.subtitle}>These prototypes are private. Enter the password to continue.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <TextField
            id="password"
            name="password"
            type="password"
            size="l"
            label="Password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={e => {
              setPassword(e.target.value)
              if (error) setError(undefined)
            }}
            error={error}
          />
          <Button type="submit" size="l" loading={loading} className={styles.submit}>
            Continue
          </Button>
        </form>
      </main>
    </div>
  )
}
