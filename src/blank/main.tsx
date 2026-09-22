import { Agentation } from 'agentation'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/global.css'
import BlankPage from './BlankPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BlankPage />
      <Agentation />
  </StrictMode>,
)
