import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/global.css'
import ChatsPage from './ChatsPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatsPage />
  </StrictMode>,
)
