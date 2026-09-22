import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Agentation } from 'agentation'
import '../styles/global.css'
import App from '../app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App initialPage="meetings" meetingsVariant="create-public" />
    {import.meta.env.DEV && <Agentation />}
  </StrictMode>,
)
