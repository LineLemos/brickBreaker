import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Screen from './screen.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Screen />
  </StrictMode>,
)
