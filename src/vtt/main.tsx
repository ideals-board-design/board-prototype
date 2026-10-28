import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Agentation } from 'agentation'
import '../styles/global.css'
import VttConverterPage from './VttConverterPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VttConverterPage />
    {import.meta.env.DEV && <Agentation />}
  </StrictMode>,
)
