// frontend/src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './assets/styles/globals.css'     // Tailwind + design tokens
import './assets/scss/themes.scss'       // page-level styles// ลบ fakeBackend() ออกทั้งหมด

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)