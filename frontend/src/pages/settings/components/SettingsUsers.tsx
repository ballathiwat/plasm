// ============================================================
//  src/pages/settings/components/SettingsUsers.tsx
// ============================================================

import { Plus, X, UserCheck, UserX } from 'lucide-react'
import type { UserItem, UserFormData } from '../services/SettingsType'

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid var(--border, #E4E4E7)',
  borderRadius: 'var(--radius-sm, 6px)',
  fontSize: 14,
  background: 'var(--surface, #fff)',
  color: 'var(--text-primary)',
  width: '100%',
}

interface Props {
  users: UserItem[]
  loading: boolean
  showForm: boolean
  form: UserFormData
  saving: boolean
  onToggleForm: (show: boolean) => void
  onFormChange: (field: keyof UserFormData, value: string) => void
  onCreate: () => void
  onToggleActive: (user: UserItem) => void
}

export default function SettingsUsers({
  users, loading, showForm, form, saving,
  onToggleForm, onFormChange, onCreate, onToggleActive,
}: Props) {
  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: 24, boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>จัดการผู้ใช้</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            เพิ่ม/ปิดใช้งานบัญชีผู้ใช้ · {users.length} คน
          </p>
        </div>
        <button
          onClick={() => onToggleForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 'var(--radius-sm, 6px)',
            border: 'none', background: 'var(--primary, #2563EB)', color: '#fff',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'ปิด' : 'เพิ่มผู้ใช้'}
        </button>
      </div>

      {/* Add user form */}
      {showForm && (
        <div style={{
          padding: 16, marginBottom: 16,
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border)',
          background: 'var(--surface-raised, #F4F4F5)',
          animation: 'plasm-fade-in 0.2s ease',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block' }}>ชื่อผู้ใช้ *</label>
              <input
                type="text"
                placeholder="username"
                value={form.username}
                onChange={(e) => onFormChange('username', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block' }}>ชื่อ-สกุล *</label>
              <input
                type="text"
                placeholder="ชื่อที่แสดง"
                value={form.name}
                onChange={(e) => onFormChange('name', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block' }}>รหัสผ่าน *</label>
              <input
                type="password"
                placeholder="••••••"
                value={form.password}
                onChange={(e) => onFormChange('password', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block' }}>บทบาท</label>
              <select value={form.role} onChange={(e) => onFormChange('role', e.target.value)} style={inputStyle}>
                <option value="staff">เจ้าหน้าที่</option>
                <option value="admin">ผู้ดูแลระบบ</option>
              </select>
            </div>
          </div>
          <button
            onClick={onCreate}
            disabled={saving}
            style={{
              padding: '8px 20px', borderRadius: 'var(--radius-sm, 6px)',
              border: 'none', background: 'var(--primary)', color: '#fff',
              fontWeight: 600, fontSize: 13, cursor: saving ? 'wait' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'กำลังบันทึก...' : 'เพิ่มผู้ใช้'}
          </button>
        </div>
      )}

      {/* User list */}
      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {users.map((user, idx) => (
            <div key={user.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: idx < users.length - 1 ? '1px solid var(--border)' : 'none',
              opacity: user.active ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: '50%',
                  background: user.role === 'admin' ? '#DBEAFE' : '#F4F4F5',
                  color: user.role === 'admin' ? '#2563EB' : '#71717A',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {user.name.charAt(0)}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    @{user.username} · {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onToggleActive(user)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 12px', borderRadius: 'var(--radius-sm, 6px)',
                  border: `1px solid ${user.active ? '#FECACA' : '#BBF7D0'}`,
                  background: user.active ? '#FEF2F2' : '#F0FDF4',
                  color: user.active ? '#DC2626' : '#16A34A',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {user.active ? <UserX size={13} /> : <UserCheck size={13} />}
                {user.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
