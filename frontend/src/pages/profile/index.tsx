// ============================================================
//  src/pages/profile/index.tsx
// ============================================================

import { User } from 'lucide-react'
import { useAuth } from '../../Routes/AuthProtected'
import Toast from '../../components/common/Toast'
import useProfile from './services/useProfile'
import ChangePasswordForm from './components/ChangePasswordForm'
import ProfilePinSection from './components/ProfilePinSection'
import './profile.css'

export default function ProfilePage() {
  const { user } = useAuth()
  const { form, saving, toast, errors, handleChange, handleSubmit, dismissToast, setToast } = useProfile()

  return (
    <div className="profile-page">
      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="profile-head">
        <h2>โปรไฟล์</h2>
        <p>จัดการรหัสผ่านเข้าระบบ และ PIN สำหรับลงนามเอกสาร</p>
      </div>

      <div className="profile-card">
        <div className="profile-user">
          <div className="profile-avatar" aria-hidden="true">{user.name?.charAt(0) || <User size={20} />}</div>
          <div>
            <div className="profile-user__name">{user.name}</div>
            <div className="profile-user__meta">{user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'}</div>
          </div>
        </div>
      </div>

      <ChangePasswordForm form={form} saving={saving} errors={errors} onChange={handleChange} onSubmit={handleSubmit} />
      <ProfilePinSection onToast={setToast} />
    </div>
  )
}
