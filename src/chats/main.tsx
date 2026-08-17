import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Agentation } from 'agentation'
import '../styles/global.css'
import ChatsPage from './ChatsPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatsPage />
    {import.meta.env.DEV && <Agentation />}
  </StrictMode>,
)
