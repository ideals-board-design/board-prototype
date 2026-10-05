import { Agentation } from 'agentation'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/global.css'
import MeetingPage from './MeetingPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MeetingPage />
      <Agentation />
  </StrictMode>,
)
