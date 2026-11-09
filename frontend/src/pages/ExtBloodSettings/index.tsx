// frontend/src/pages/ExtBloodSettings/index.tsx
// รวมเข้าหน้า ตั้งค่า แล้ว — เก็บไว้เป็น redirect เผื่อมีลิงก์เก่า
import { Navigate } from 'react-router-dom'

export default function ExtBloodSettingsPage() {
  return <Navigate to="/settings/forms?tab=extSources" replace />
}
