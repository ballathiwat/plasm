// ============================================================
//  src/pages/settings/components/SettingsZones.tsx
// ============================================================

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { ZoneItem, ShelfItem } from '../services/SettingsType'
import Button from '../../../components/common/Button'
import FormInput from '../../../components/common/FormInput'

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

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <FormInput
          style={{ flex: '1 1 240px', maxWidth: 320 }}
          value={zoneName}
          placeholder="ชื่อห้อง/ตู้ใหม่"
          onChange={setZoneName}
          onKeyDown={(e) => { if (e.key === 'Enter') submitZone() }}
        />
        <Button
          icon={<Plus size={14} />}
          onClick={submitZone}
          disabled={!zoneName.trim()}
        >
          เพิ่มสถานที่
        </Button>
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
                <Button
                  pill
                  size="sm"
                  variant={z.active ? 'outline-success' : 'outline-danger'}
                  onClick={() => onToggleZone(z)}
                >
                  {z.active ? 'ใช้งาน' : 'ปิดอยู่'}
                </Button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {z.shelves.length === 0 && (
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ยังไม่มีชั้นวาง</span>
                )}
                {z.shelves.map((s) => (
                  <Button
                    key={s.id}
                    size="sm"
                    variant={s.active ? 'secondary' : 'ghost'}
                    title={s.active ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'}
                    onClick={() => onToggleShelf(s)}
                    style={{
                      fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13,
                      textDecoration: s.active ? 'none' : 'line-through',
                      color: s.active ? undefined : 'var(--text-disabled)',
                    }}
                  >
                    {s.code}
                  </Button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <FormInput
                  style={{ flex: '0 1 200px' }}
                  mono
                  value={shelfInputs[z.id] || ''}
                  placeholder="ชั้นใหม่ เช่น R4"
                  maxLength={20}
                  onChange={(v) => setShelfInputs((s) => ({ ...s, [z.id]: v.toUpperCase() }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitShelf(z.id) }}
                />
                <Button
                  variant="outline"
                  icon={<Plus size={14} />}
                  onClick={() => submitShelf(z.id)}
                  disabled={!(shelfInputs[z.id] || '').trim()}
                >
                  เพิ่มชั้น
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}