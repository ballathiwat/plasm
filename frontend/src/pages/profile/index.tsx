// ============================================================
//  src/pages/profile/index.tsx
// ============================================================

import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, X, User } from 'lucide-react'
import { useAuth } from '../../Routes/AuthProtected'
import useProfile from './services/useProfile'
import ChangePasswordForm from './components/ChangePasswordForm'

export default function ProfilePage() {
  const { user } = useAuth()
  const {
    form, saving, toast, errors,
    handleChange, handleSubmit, dismissToast,
  } = useProfile()

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(dismissToast, 4000)
      return () => clearTimeout(t)
    }
  }, [toast, dismissToast])

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 20px',
          borderRadius: 'var(--radius-md, 8px)',
          background: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
          color: toast.type === 'success' ? '#166534' : '#991B1B',
          fontSize: 13, fontWeight: 500,
          boxShadow: 'var(--shadow-md)',
          animation: 'plasm-fade-in 0.2s ease',
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
          <button onClick={dismissToast} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 8 }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>โปรไฟล์</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          จัดการข้อมูลบัญชีและรหัสผ่านของคุณ
        </p>
      </div>

      {/* User info card */}
      <div style={{
        background: 'var(--surface, #fff)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg, 10px)',
        padding: 24, boxShadow: 'var(--shadow-sm)',
        maxWidth: 480, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#2563EB', fontWeight: 700, fontSize: 18,
          }}>
            {user.name?.charAt(0) || <User size={20} />}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{user.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'}
            </div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <ChangePasswordForm
        form={form}
        saving={saving}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  )
}