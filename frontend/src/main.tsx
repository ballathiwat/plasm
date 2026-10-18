// frontend/src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './globals.css'

// ลบ fakeBackend() ออกทั้งหมด

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)