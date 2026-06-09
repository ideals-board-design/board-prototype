import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/global.css'
import PublicPageApp from './features/public-page/PublicPageApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PublicPageApp />
  </StrictMode>,
)
