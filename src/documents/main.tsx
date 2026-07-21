import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/global.css'
import DocumentsPage from './DocumentsPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DocumentsPage />
  </StrictMode>,
)
