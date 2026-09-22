import { Agentation } from 'agentation'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/global.css'
import BoardMemberPage from './BoardMemberPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BoardMemberPage />
      <Agentation />
  </StrictMode>,
)
