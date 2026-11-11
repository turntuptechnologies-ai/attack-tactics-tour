import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/dotgothic16/400.css'
import '@fontsource/press-start-2p/400.css'
import '@fontsource/zen-kaku-gothic-new/400.css'
import '@fontsource/zen-kaku-gothic-new/700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
