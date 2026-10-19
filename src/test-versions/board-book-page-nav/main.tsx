import { Agentation } from 'agentation'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../styles/global.css'
import BoardBookPageNavPage from './BoardBookPageNavPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BoardBookPageNavPage />
      <Agentation />
  </StrictMode>,
)
