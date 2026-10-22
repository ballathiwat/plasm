// ============================================================
//  src/pages/settings/components/SettingsZones.tsx
// ============================================================

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { ZoneItem, ShelfItem } from '../services/SettingsType'

const inputStyle: React.CSSProperties = {
  padding: '7px 12px', fontSize: 13, width: 160,
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm, 6px)',
  background: 'var(--surface, #fff)', color: 'var(--text-primary)',
}
const addBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px',
  borderRadius: 'var(--radius-sm, 6px)', border: 'none',
  background: 'var(--primary, #2563EB)', color: '#fff',
  fontWeight: 600, fontSize: 12, cursor: 'pointer',
}

interface Props {
  zones: ZoneItem[]
  loading: boolean
  onAddZone: (name: string) => Promise<boolean>
  onToggleZone: (z: ZoneItem) => void
  onAddShelf: (zoneId: string, code: string) => Promise<boolean>
  onToggleShelf: (s: ShelfItem) => void
}

export default function SettingsZones({
  zones, loading, onAddZone, onToggleZone, onAddShelf, onToggleShelf,
}: Props) {
  const [zoneName, setZoneName] = useState('')
  const [shelfInputs, setShelfInputs] = useState<Record<string, string>>({})

  const submitZone = async () => {
    if (!zoneName.trim()) return
    if (await onAddZone(zoneName.trim())) setZoneName('')
  }

  const submitShelf = async (zoneId: string) => {
    const code = (shelfInputs[zoneId] || '').trim()
    if (!code) return
    if (await onAddShelf(zoneId, code)) setShelfInputs((s) => ({ ...s, [zoneId]: '' }))
  }

  return (
    <div style={{
      background: 'var(--surface, #fff)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg, 10px)', padding: 24, boxShadow: 'var(--shadow-sm)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>สถานที่จัดเก็บ</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 16px' }}>
        กำหนดห้อง/ตู้ และชั้นวางในแต่ละที่
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          value={zoneName}
          placeholder="ชื่อห้อง/ตู้ใหม่"
          onChange={(e) => setZoneName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submitZone() }}
          style={{ ...inputStyle, width: 240 }}
        />
        <button
          onClick={submitZone}
          disabled={!zoneName.trim()}
          style={{ ...addBtn, opacity: zoneName.trim() ? 1 : 0.6 }}
        >
          <Plus size={13} /> เพิ่มสถานที่
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {zones.map((z) => (
            <div key={z.id} style={{
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md, 8px)',
              padding: 16, opacity: z.active ? 1 : 0.55,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <strong style={{ fontSize: 15 }}>{z.name}</strong>
                <button
                  onClick={() => onToggleZone(z)}
                  style={{
                    padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    border: `1px solid ${z.active ? '#BBF7D0' : '#FECACA'}`,
                    background: z.active ? '#F0FDF4' : '#FEF2F2',
                    color: z.active ? '#16A34A' : '#DC2626',
                  }}
                >
                  {z.active ? 'ใช้งาน' : 'ปิดอยู่'}
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {z.shelves.length === 0 && (
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ยังไม่มีชั้นวาง</span>
                )}
                {z.shelves.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onToggleShelf(s)}
                    title={s.active ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'}
                    style={{
                      padding: '4px 12px', borderRadius: 'var(--radius-sm, 6px)', cursor: 'pointer',
                      fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                      border: '1px solid var(--border)',
                      background: s.active ? 'var(--surface-raised, #F4F4F5)' : 'transparent',
                      color: s.active ? 'var(--text-primary)' : 'var(--text-disabled)',
                      textDecoration: s.active ? 'none' : 'line-through',
                    }}
                  >
                    {s.code}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={shelfInputs[z.id] || ''}
                  placeholder="ชั้นใหม่ เช่น R4"
                  maxLength={20}
                  onChange={(e) => setShelfInputs((s) => ({ ...s, [z.id]: e.target.value.toUpperCase() }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitShelf(z.id) }}
                  style={inputStyle}
                />
                <button onClick={() => submitShelf(z.id)} style={addBtn}>
                  <Plus size={13} /> เพิ่มชั้น
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}