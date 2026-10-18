// ============================================================
//  src/pages/storage/components/StorageNewBoxForm.tsx
// ============================================================

import { X, Printer } from 'lucide-react'
import type { BloodGroup } from '../../../types/models'
import type { StorageFormData } from '../services/StorageType'

const GROUP_COLOR: Record<BloodGroup, string> = {
  A: 'var(--group-a, #3B82F6)', B: 'var(--group-b, #10B981)',
  O: 'var(--group-o, #F59E0B)', AB: 'var(--group-ab, #8B5CF6)',
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  border: '1px solid var(--border, #E4E4E7)',
  borderRadius: 'var(--radius-sm, 6px)',
  fontSize: 14,
  background: 'var(--surface, #fff)',
  color: 'var(--text-primary, #18181B)',
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #18181B)', marginBottom: 6,
}

interface Props {
  form: StorageFormData
  boxLabel: string
  scannedUnits: string[]
  unitInput: string
  submitting: boolean
  availableShelves: string[]
  onFormChange: (field: keyof StorageFormData, value: string) => void
  onUnitInputChange: (value: string) => void
  onAddUnit: () => void
  onUnitKeyDown: (e: React.KeyboardEvent) => void
  onRemoveUnit: (unit: string) => void
  onSubmit: () => void
}

export default function StorageNewBoxForm({
  form, boxLabel, scannedUnits, unitInput, submitting, availableShelves,
  onFormChange, onUnitInputChange, onAddUnit, onUnitKeyDown, onRemoveUnit, onSubmit,
}: Props) {
  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: '24px 28px',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: 20,
    }}>
      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
        กล่องใหม่
      </h3>

      {/* ── Row 1: main fields ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16, marginBottom: 20,
      }}>
        {/* Box Label (auto) */}
        <div>
          <label style={labelStyle}>หมายเลขกล่อง (อัตโนมัติ)</label>
          <input
            type="text"
            value={boxLabel}
            readOnly
            style={{ ...inputStyle, background: 'var(--surface-raised, #F4F4F5)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
          />
        </div>

        {/* Blood Group */}
        <div>
          <label style={labelStyle}>หมู่เลือด</label>
          <select
            value={form.blood}
            onChange={(e) => onFormChange('blood', e.target.value)}
            style={inputStyle}
          >
            {(['A', 'B', 'O', 'AB'] as const).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Collection Date */}
        <div>
          <label style={labelStyle}>วันที่เก็บ</label>
          <input
            type="date"
            value={form.collectionDate}
            onChange={(e) => onFormChange('collectionDate', e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Location */}
        <div>
          <label style={labelStyle}>ตำแหน่งจัดเก็บ</label>
          <select
            value={form.location}
            onChange={(e) => onFormChange('location', e.target.value)}
            style={inputStyle}
          >
            <option value="room">ห้อง -30°C</option>
            <option value="cabinet">ตู้ -30°C</option>
          </select>
        </div>

        {/* Shelf */}
        <div>
          <label style={labelStyle}>ชั้นวาง</label>
          <select
            value={form.shelf}
            onChange={(e) => onFormChange('shelf', e.target.value)}
            style={inputStyle}
          >
            {availableShelves.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Unit input ── */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>
          Unit ที่สแกนแล้ว · {scannedUnits.length} units
          <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 8 }}>
            (ตรวจจับ Unit ซ้ำอัตโนมัติ)
          </span>
        </label>

        {/* Input row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="พิมพ์หรือสแกนหมายเลข Unit แล้วกด Enter"
            value={unitInput}
            onChange={(e) => onUnitInputChange(e.target.value)}
            onKeyDown={onUnitKeyDown}
            style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
          />
          <button
            onClick={onAddUnit}
            style={{
              padding: '10px 18px', borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border)', background: 'var(--surface-raised)',
              fontSize: 14, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            เพิ่ม
          </button>
        </div>

        {/* Unit pills */}
        {scannedUnits.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {scannedUnits.map((unit) => (
              <span key={unit} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border, #E4E4E7)',
                background: 'var(--surface, #fff)',
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                color: GROUP_COLOR[form.blood] || 'var(--text-primary)',
              }}>
                {unit}
                <button
                  onClick={() => onRemoveUnit(unit)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, display: 'flex', alignItems: 'center',
                  }}
                >
                  <X size={13} color="var(--text-secondary)" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Submit ── */}
      <button
        onClick={onSubmit}
        disabled={submitting || scannedUnits.length === 0}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 28px', borderRadius: 'var(--radius-sm, 6px)',
          border: 'none', background: 'var(--primary, #2563EB)', color: '#fff',
          fontWeight: 600, fontSize: 14, cursor: submitting ? 'wait' : 'pointer',
          opacity: submitting || scannedUnits.length === 0 ? 0.6 : 1,
        }}
      >
        <Printer size={16} />
        {submitting ? 'กำลังบันทึก...' : 'บันทึกและพิมพ์บาร์โค้ด'}
      </button>
    </div>
  )
}