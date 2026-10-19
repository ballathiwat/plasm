// ============================================================
//  src/pages/settings/index.tsx
// ============================================================

import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import useSettings from './services/useSettings'
import SettingsMinStock from './components/SettingsMinStock'
import SettingsUsers from './components/SettingsUsers'

const TABS = [
  { key: 'stock' as const, label: 'ค่าขั้นต่ำ' },
  { key: 'users' as const, label: 'จัดการผู้ใช้' },
]

const SettingsPage = () => {
  const {
    activeTab, setActiveTab,
    minimumStock, savingSettings,
    handleMinStockChange, handleSaveMinimumStock,
    users, loadingUsers,
    showUserForm, setShowUserForm,
    userForm, savingUser,
    handleUserFormChange, handleCreateUser, handleToggleActive,
    toast, dismissToast,
  } = useSettings()

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 20px', borderRadius: 'var(--radius-md, 8px)',
          background: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
          color: toast.type === 'success' ? '#166534' : '#991B1B',
          fontSize: 13, fontWeight: 500, boxShadow: 'var(--shadow-md)',
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
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>ตั้งค่า</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          กำหนดค่าขั้นต่ำสต็อกและจัดการบัญชีผู้ใช้
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid var(--border, #E4E4E7)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              border: 'none', background: 'transparent',
              fontSize: 14, fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? 'var(--primary, #2563EB)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.key ? '2px solid var(--primary, #2563EB)' : '2px solid transparent',
              marginBottom: -2,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'stock' && (
        <SettingsMinStock
          minimumStock={minimumStock}
          saving={savingSettings}
          onChange={handleMinStockChange}
          onSave={handleSaveMinimumStock}
        />
      )}

      {activeTab === 'users' && (
        <SettingsUsers
          users={users}
          loading={loadingUsers}
          showForm={showUserForm}
          form={userForm}
          saving={savingUser}
          onToggleForm={setShowUserForm}
          onFormChange={handleUserFormChange}
          onCreate={handleCreateUser}
          onToggleActive={handleToggleActive}
        />
      )}
    </div>
  )
}

export default SettingsPage
