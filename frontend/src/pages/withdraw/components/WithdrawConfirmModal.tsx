// ============================================================
//  src/pages/withdraw/components/WithdrawConfirmModal.tsx
// ============================================================

import { AlertTriangle } from 'lucide-react'
import type { ConfirmAction } from '../services/WithdrawType'

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