// frontend/src/pages/storage/StoragePage.tsx

import { Package } from 'lucide-react'

export default function StoragePage() {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Package size={18} style={{ color: 'var(--color-primary)' }} />
        จัดเก็บพลาสมา
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Form fields */}
        {[
          { label: 'ชนิดพลาสมา', type: 'select', options: ['FFP', 'Cryo'] },
          { label: 'หมู่เลือด', type: 'select', options: ['A', 'B', 'O', 'AB'] },
          { label: 'ตำแหน่งจัดเก็บ', type: 'select', options: ['ห้อง -30°C', 'ตู้ -30°C'] },
          { label: 'ชั้นวาง', type: 'select', options: ['M1', 'R1', 'R2', 'R3', 'L1', 'L2', 'L3'] },
        ].map((f) => (
          <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)' }}>{f.label}</label>
            <select
              style={{
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14,
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
              }}
            >
              {f.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)' }}>วันที่เจาะเก็บ</label>
          <input
            type="date"
            style={{
              padding: '8px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)' }}>หมายเลข Unit (คั่นด้วย comma)</label>
          <textarea
            placeholder="เช่น A001, A002, A003"
            style={{
              padding: '8px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              minHeight: 60,
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            style={{
              padding: '8px 18px',
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            💾 จัดเก็บ
          </button>
          <button
            style={{
              padding: '8px 18px',
              background: 'transparent',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ล้าง
          </button>
        </div>
      </div>
    </div>
  )
}
