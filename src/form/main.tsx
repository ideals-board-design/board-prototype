import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Agentation } from 'agentation'
import '../styles/global.css'
import MeetingForm from './MeetingForm'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MeetingForm />
    {import.meta.env.DEV && <Agentation />}
  </StrictMode>,
)
