// ============================================================
//  src/pages/storage/components/StorageToast.tsx
// ============================================================

import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import type { ToastState } from '../services/StorageType'

interface Props {
  toast: ToastState | null
  onDismiss: () => void
}

export default function StorageToast({ toast, onDismiss }: Props) {
  if (!toast) return null

  return (
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
      <button onClick={onDismiss} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 8,
      }}>
        <X size={14} />
      </button>
    </div>
  )
}