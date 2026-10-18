// ============================================================
//  src/pages/withdraw/components/WithdrawConfirmModal.tsx
// ============================================================

import { AlertTriangle, CheckCircle2, AlertCircle, X } from 'lucide-react'
import type { ConfirmAction, ToastState } from '../services/WithdrawType'

// ── Toast ──
export function WithdrawToast({ toast, onDismiss }: { toast: ToastState | null; onDismiss: () => void }) {
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
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 8 }}>
        <X size={14} />
      </button>
    </div>
  )
}

// ── Confirm Dialog ──
export function WithdrawConfirmDialog({
  action,
  onCancel,
}: {
  action: ConfirmAction | null
  onCancel: () => void
}) {
  if (!action) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1001,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface, #fff)', borderRadius: 'var(--radius-lg, 10px)',
        padding: 24, width: 400, maxWidth: '90vw', boxShadow: 'var(--shadow-md)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={18} color="#D97706" />
          {action.title}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
          {action.msg}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '8px 18px', borderRadius: 'var(--radius-sm, 6px)',
            border: '1px solid var(--border)', background: 'transparent',
            fontSize: 14, cursor: 'pointer',
          }}>
            ยกเลิก
          </button>
          <button onClick={action.onConfirm} style={{
            padding: '8px 18px', borderRadius: 'var(--radius-sm, 6px)',
            border: 'none', background: '#DC2626', color: '#fff',
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>
            ยืนยันนำออก
          </button>
        </div>
      </div>
    </div>
  )
}