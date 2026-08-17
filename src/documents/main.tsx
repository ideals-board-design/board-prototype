import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Agentation } from 'agentation'
import '../styles/global.css'
import DocumentsPage from './DocumentsPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DocumentsPage />
    {import.meta.env.DEV && <Agentation />}
  </StrictMode>,
)
