import { Agentation } from 'agentation'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../styles/global.css'
import MinutesAiPage from './MinutesAiPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MinutesAiPage />
      <Agentation />
  </StrictMode>,
)
