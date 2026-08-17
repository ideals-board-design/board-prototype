import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Agentation } from 'agentation'
import '../styles/global.css'
import HubPage from './HubPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HubPage />
    {import.meta.env.DEV && <Agentation />}
  </StrictMode>,
)
