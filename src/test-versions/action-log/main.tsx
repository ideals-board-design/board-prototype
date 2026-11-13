import { Agentation } from 'agentation'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../styles/global.css'
import ActionLogTestPage from './ActionLogTestPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ActionLogTestPage />
      <Agentation />
  </StrictMode>,
)
