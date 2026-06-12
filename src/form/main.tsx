import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/global.css'
import MeetingForm from './MeetingForm'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MeetingForm />
  </StrictMode>,
)
