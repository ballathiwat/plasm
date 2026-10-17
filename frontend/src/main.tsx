// frontend/src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './globals.css'

// ===== Fake Backend — ลบบรรทัดนี้เมื่อเชื่อม API จริง =====
import fakeBackend from './helpers/fakeBackend'
fakeBackend()
// ============================================================

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)