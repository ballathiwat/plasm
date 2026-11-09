// src/pages/settings/components/SettingsZones.tsx — ห้อง/ตู้ และชั้นวาง (สวิตช์ + เลิกทำหลังปิด/เปิดชั้น)
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import type { ZoneItem, ShelfItem } from '../services/SettingsType'
import Button from '../../../components/common/Button'
import FormInput from '../../../components/common/FormInput'
import StgSwitch from './StgSwitch'
import { card, h3, sub } from './settingsStyles'

interface Props {
  zones: ZoneItem[]
  loading: boolean
  onAddZone: (name: string) => Promise<boolean>
  onToggleZone: (z: ZoneItem) => void
  onAddShelf: (zoneId: string, code: string) => Promise<boolean>
  onToggleShelf: (s: ShelfItem) => Promise<boolean> | void
}

export default function SettingsZones({ zones, loading, onAddZone, onToggleZone, onAddShelf, onToggleShelf }: Props) {
  const [zoneName, setZoneName] = useState('')
  const [shelfInputs, setShelfInputs] = useState<Record<string, string>>({})
  const [shelfErr, setShelfErr] = useState<Record<string, string>>({})
  const [undo, setUndo] = useState<{ shelf: ShelfItem; msg: string } | null>(null)

  useEffect(() => { if (!undo) return; const t = setTimeout(() => setUndo(null), 6000); return () => clearTimeout(t) }, [undo])

  const submitZone = async () => {
    const n = zoneName.trim()
    if (!n) return
    if (await onAddZone(n)) setZoneName('')
  }

  const submitShelf = async (z: ZoneItem) => {
    const code = (shelfInputs[z.id] || '').trim()
    if (!code) return
    if (z.shelves.some((s) => s.code.toUpperCase() === code.toUpperCase())) {
      setShelfErr((e) => ({ ...e, [z.id]: `ชั้น ${code} มีอยู่แล้วใน ${z.name}` })); return
    }
    if (await onAddShelf(z.id, code)) setShelfInputs((s) => ({ ...s, [z.id]: '' }))
  }

  const toggleShelf = async (z: ZoneItem, s: ShelfItem) => {
    await onToggleShelf(s)
    // หลังสลับ สถานะจริงคือ !s.active — ส่งตัวที่ "สลับแล้ว" ไปให้ปุ่มเลิกทำ เพื่อให้สลับกลับได้ถูกทิศ
    setUndo({ shelf: { ...s, active: !s.active }, msg: `${s.active ? 'ปิด' : 'เปิด'}ชั้น ${s.code} ใน ${z.name} แล้ว` })
  }

  return (
    <div style={card}>
      <h3 style={h3}>สถานที่จัดเก็บ</h3>
      <p style={sub}>กำหนดห้อง/ตู้ และชั้นวางในแต่ละที่ · ใช้กับการจัดเก็บพลาสมา</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <FormInput
          style={{ flex: '1 1 240px', maxWidth: 320 }}
          aria-label="ชื่อห้อง/ตู้ใหม่"
          value={zoneName}
          placeholder="ชื่อห้อง/ตู้ใหม่"
          onChange={setZoneName}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') submitZone() }}
        />
        <Button icon={<Plus size={14} />} onClick={submitZone} disabled={!zoneName.trim()}>เพิ่มสถานที่</Button>
      </div>

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {zones.map((z) => (
            <div key={z.id} style={{
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md, 8px)', padding: 16,
              background: z.active ? 'var(--surface, #fff)' : 'var(--surface-raised)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <strong style={{ fontSize: 15, color: z.active ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
                  {z.name}
                  {!z.active && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 8 }}>ปิดอยู่ — เลือกเป็นที่จัดเก็บไม่ได้</span>}
                </strong>
                <StgSwitch on={z.active} label={z.name} onChange={() => onToggleZone(z)} />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {z.shelves.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ยังไม่มีชั้นวาง — เพิ่มชั้นแรกด้านล่าง</span>}
                {z.shelves.map((s) => (
                  <span key={s.id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 4px 2px 10px', borderRadius: 6,
                    border: '1px solid var(--border)', background: s.active ? 'var(--surface, #fff)' : 'var(--surface-raised)',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13, color: s.active ? 'var(--text-primary)' : 'var(--text-disabled)', textDecoration: s.active ? 'none' : 'line-through' }}>{s.code}</span>
                    <StgSwitch on={s.active} showText={false} size={20} label={`ชั้น ${s.code} (${z.name})`} onChange={() => toggleShelf(z, s)} />
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <FormInput
                  style={{ flex: '0 1 200px' }}
                  mono
                  aria-label={`ชั้นใหม่ใน ${z.name}`}
                  value={shelfInputs[z.id] || ''}
                  placeholder="ชั้นใหม่ เช่น R4"
                  maxLength={20}
                  error={shelfErr[z.id] || undefined}
                  onChange={(v: string) => { setShelfInputs((s) => ({ ...s, [z.id]: v.toUpperCase() })); setShelfErr((e) => ({ ...e, [z.id]: '' })) }}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') submitShelf(z) }}
                />
                <Button variant="outline" icon={<Plus size={14} />} onClick={() => submitShelf(z)} disabled={!(shelfInputs[z.id] || '').trim()}>เพิ่มชั้น</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {undo && (
        <div role="status" style={{
          position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: 16, padding: '10px 12px 10px 16px', borderRadius: 8,
          background: 'var(--text-primary)', color: 'var(--surface, #fff)', fontSize: 13, boxShadow: 'var(--shadow-md)',
        }}>
          <span>{undo.msg}</span>
          <button type="button" onClick={() => { onToggleShelf(undo.shelf); setUndo(null) }} style={{
            background: 'none', border: 'none', color: 'var(--primary-surface)', font: 'inherit', fontSize: 13,
            fontWeight: 700, cursor: 'pointer', padding: '4px 6px',
          }}>เลิกทำ</button>
        </div>
      )}
    </div>
  )
}
