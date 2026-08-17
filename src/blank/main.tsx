import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Agentation } from 'agentation'
import '../styles/global.css'
import BlankPage from './BlankPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BlankPage />
    {import.meta.env.DEV && <Agentation />}
  </StrictMode>,
)
