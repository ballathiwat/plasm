// frontend/src/App.tsx

import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './Routes'
import SessionExpiredModal from './components/common/SessionExpiredModal'

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <SessionExpiredModal />
    </BrowserRouter>
  )
}
