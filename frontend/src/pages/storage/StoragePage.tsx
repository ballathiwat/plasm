// frontend/src/pages/storage/StoragePage.tsx

import { useEffect, useState, useCallback } from 'react'
import { Package, Plus, X, Search, Filter, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Box, BloodGroup, PlasmaType, StorageLocation } from '../../types/models'
import { getBoxes, postBox } from '../../helpers/backend_helper'

// ── Design tokens ──
const GROUP_COLOR: Record<BloodGroup, string> = {
  A: 'var(--group-a, #3B82F6)', B: 'var(--group-b, #10B981)',
  O: 'var(--group-o, #F59E0B)', AB: 'var(--group-ab, #8B5CF6)',
}
const GROUP_SURFACE: Record<BloodGroup, string> = {
  A: 'var(--group-a-surface, #DBEAFE)', B: 'var(--group-b-surface, #D1FAE5)',
  O: 'var(--group-o-surface, #FEF3C7)', AB: 'var(--group-ab-surface, #EDE9FE)',
}

const SHELVES_ROOM = ['M1', 'R1', 'R2', 'R3', 'L1', 'L2', 'L3']
const SHELVES_CABINET = ['C1', 'C2', 'C3']

interface FormData {
  boxLabel: string
  type: PlasmaType
  blood: BloodGroup
  location: StorageLocation
  shelf: string
  collectionDate: string
  unitNumbers: string
}

const INITIAL_FORM: FormData = {
  boxLabel: '',
  type: 'FFP',
  blood: 'A',
  location: 'room',
  shelf: 'M1',
  collectionDate: new Date().toISOString().split('T')[0],
  unitNumbers: '',
}

// ── Shared styles ──
const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid var(--border, #E4E4E7)',
  borderRadius: 'var(--radius-sm, 6px)',
  fontSize: 14,
  background: 'var(--surface, #fff)',
  color: 'var(--text-primary, #18181B)',
  width: '100%',
}
const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 500, color: 'var(--text-secondary, #71717A)', marginBottom: 4,
}

export default function StoragePage() {
  // ── State ──
  const [boxes, setBoxes] = useState<Box[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Filter
  const [filterBlood, setFilterBlood] = useState<string>('')
  const [filterLocation, setFilterLocation] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('stored')
  const [searchQuery, setSearchQuery] = useState('')

  // Sort
  const [sortField, setSortField] = useState<'storedAt' | 'boxLabel' | 'blood'>('storedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // ── Load boxes ──
  const loadBoxes = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filterBlood) params.blood = filterBlood
      if (filterLocation) params.location = filterLocation
      if (filterStatus) params.status = filterStatus
      const data = await getBoxes(params) as Box[]
      setBoxes(data)
    } catch {
      setBoxes([])
    } finally {
      setLoading(false)
    }
  }, [filterBlood, filterLocation, filterStatus])

  useEffect(() => { loadBoxes() }, [loadBoxes])

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  // ── Filtered + sorted boxes ──
  const filteredBoxes = boxes
    .filter((b) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return b.boxLabel.toLowerCase().includes(q) || b.units.some((u) => u.toLowerCase().includes(q))
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortField === 'storedAt') cmp = new Date(a.storedAt).getTime() - new Date(b.storedAt).getTime()
      else if (sortField === 'boxLabel') cmp = a.boxLabel.localeCompare(b.boxLabel)
      else if (sortField === 'blood') cmp = a.blood.localeCompare(b.blood)
      return sortDir === 'desc' ? -cmp : cmp
    })

  // ── Shelves for current location ──
  const availableShelves = form.location === 'room' ? SHELVES_ROOM : SHELVES_CABINET

  // Reset shelf when location changes
  const handleLocationChange = (loc: StorageLocation) => {
    const shelves = loc === 'room' ? SHELVES_ROOM : SHELVES_CABINET
    setForm((f) => ({ ...f, location: loc, shelf: shelves[0] }))
  }

  // ── Submit form ──
  const handleSubmit = async () => {
    if (!form.boxLabel.trim()) { setToast({ type: 'error', msg: 'กรุณาระบุหมายเลขกล่อง' }); return }
    if (!form.collectionDate) { setToast({ type: 'error', msg: 'กรุณาระบุวันที่เจาะเก็บ' }); return }

    const units = form.unitNumbers
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean)

    setSubmitting(true)
    try {
      await postBox({
        boxLabel: form.boxLabel.trim(),
        type: form.type,
        blood: form.blood,
        location: form.location.toUpperCase(),
        shelf: form.shelf,
        collectionDate: form.collectionDate,
        units,
      })
      setToast({ type: 'success', msg: `จัดเก็บกล่อง ${form.boxLabel} สำเร็จ (${units.length} units)` })
      setForm(INITIAL_FORM)
      setShowForm(false)
      loadBoxes()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'เกิดข้อผิดพลาด'
      setToast({ type: 'error', msg })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Sort toggle ──
  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ChevronDown size={12} style={{ opacity: 0.3 }} />
    return sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />
  }

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>

      {/* ═══ Toast ═══ */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 20px', borderRadius: 'var(--radius-md, 8px)',
          background: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
          color: toast.type === 'success' ? '#166534' : '#991B1B',
          fontSize: 13, fontWeight: 500,
          boxShadow: 'var(--shadow-md)',
          animation: 'plasm-fade-in 0.2s ease',
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 8 }}>
            <X size={14} color={toast.type === 'success' ? '#166534' : '#991B1B'} />
          </button>
        </div>
      )}

      {/* ═══ Header ═══ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            จัดเก็บพลาสมา
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            จัดการกล่องพลาสมา · ทั้งหมด {boxes.length} กล่อง
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 18px', borderRadius: 'var(--radius-sm, 6px)',
            border: 'none', background: 'var(--primary, #2563EB)', color: '#fff',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'ปิดฟอร์ม' : 'จัดเก็บกล่องใหม่'}
        </button>
      </div>

      {/* ═══ New Box Form ═══ */}
      {showForm && (
        <div style={{
          background: 'var(--surface, #fff)',
          border: '1px solid var(--border, #E4E4E7)',
          borderRadius: 'var(--radius-lg, 10px)',
          padding: 24, marginBottom: 16,
          boxShadow: 'var(--shadow-sm)',
          animation: 'plasm-fade-in 0.2s ease',
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={16} style={{ color: 'var(--primary)' }} />
            จัดเก็บกล่องใหม่
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {/* Box Label */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>หมายเลขกล่อง *</label>
              <input
                type="text"
                placeholder="เช่น BOX-2024-001"
                value={form.boxLabel}
                onChange={(e) => setForm((f) => ({ ...f, boxLabel: e.target.value }))}
                style={inputStyle}
              />
            </div>

            {/* Plasma Type */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>ชนิดพลาสมา</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PlasmaType }))}
                style={inputStyle}
              >
                <option value="FFP">FFP</option>
                <option value="Cryo">Cryo</option>
              </select>
            </div>

            {/* Blood Group */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>หมู่เลือด</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['A', 'B', 'O', 'AB'] as BloodGroup[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, blood: g }))}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 'var(--radius-sm, 6px)',
                      border: form.blood === g ? `2px solid ${GROUP_COLOR[g]}` : '1px solid var(--border, #E4E4E7)',
                      background: form.blood === g ? GROUP_SURFACE[g] : 'var(--surface, #fff)',
                      color: form.blood === g ? GROUP_COLOR[g] : 'var(--text-secondary)',
                      fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>ตำแหน่งจัดเก็บ</label>
              <select
                value={form.location}
                onChange={(e) => handleLocationChange(e.target.value as StorageLocation)}
                style={inputStyle}
              >
                <option value="room">ห้อง -30°C</option>
                <option value="cabinet">ตู้ -30°C</option>
              </select>
            </div>

            {/* Shelf */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>ชั้นวาง</label>
              <select
                value={form.shelf}
                onChange={(e) => setForm((f) => ({ ...f, shelf: e.target.value }))}
                style={inputStyle}
              >
                {availableShelves.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Collection Date */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>วันที่เจาะเก็บ *</label>
              <input
                type="date"
                value={form.collectionDate}
                onChange={(e) => setForm((f) => ({ ...f, collectionDate: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Unit Numbers */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>
              หมายเลข Unit (คั่นด้วย comma หรือ ขึ้นบรรทัดใหม่)
              {form.unitNumbers.trim() && (
                <span style={{ marginLeft: 8, color: 'var(--primary)', fontWeight: 600 }}>
                  {form.unitNumbers.split(/[,\n]/).filter((s) => s.trim()).length} units
                </span>
              )}
            </label>
            <textarea
              placeholder="เช่น U001, U002, U003 หรือแต่ละ unit ต่อบรรทัด"
              value={form.unitNumbers}
              onChange={(e) => setForm((f) => ({ ...f, unitNumbers: e.target.value }))}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 24px', borderRadius: 'var(--radius-sm, 6px)',
                border: 'none', background: 'var(--primary, #2563EB)', color: '#fff',
                fontWeight: 600, fontSize: 14, cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              <Package size={14} />
              {submitting ? 'กำลังบันทึก...' : 'จัดเก็บ'}
            </button>
            <button
              onClick={() => setForm(INITIAL_FORM)}
              style={{
                padding: '10px 18px', borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border, #E4E4E7)', background: 'transparent',
                color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer',
              }}
            >
              ล้าง
            </button>
          </div>
        </div>
      )}

      {/* ═══ Filters ═══ */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="ค้นหากล่อง หรือ unit number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--text-secondary)' }} />

          <select value={filterBlood} onChange={(e) => setFilterBlood(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="">ทุกหมู่เลือด</option>
            {(['A', 'B', 'O', 'AB'] as const).map((g) => <option key={g} value={g}>{g}</option>)}
          </select>

          <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="">ทุกตำแหน่ง</option>
            <option value="room">ห้อง -30°C</option>
            <option value="cabinet">ตู้ -30°C</option>
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="">ทุกสถานะ</option>
            <option value="stored">เก็บอยู่</option>
            <option value="withdrawn">นำออกแล้ว</option>
          </select>
        </div>
      </div>

      {/* ═══ Box List Table ═══ */}
      <div style={{
        background: 'var(--surface, #fff)',
        border: '1px solid var(--border, #E4E4E7)',
        borderRadius: 'var(--radius-lg, 10px)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '160px 60px 70px 100px 80px 80px 120px 1fr',
          gap: 8, padding: '12px 20px',
          background: 'var(--surface-raised, #F4F4F5)',
          borderBottom: '1px solid var(--border, #E4E4E7)',
          fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #71717A)',
        }}>
          <span onClick={() => toggleSort('boxLabel')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            กล่อง <SortIcon field="boxLabel" />
          </span>
          <span>ชนิด</span>
          <span onClick={() => toggleSort('blood')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            หมู่เลือด <SortIcon field="blood" />
          </span>
          <span>ตำแหน่ง</span>
          <span>ชั้น</span>
          <span>Units</span>
          <span onClick={() => toggleSort('storedAt')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            วันจัดเก็บ <SortIcon field="storedAt" />
          </span>
          <span>สถานะ</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            กำลังโหลด...
          </div>
        ) : filteredBoxes.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            {searchQuery ? 'ไม่พบกล่องที่ค้นหา' : 'ยังไม่มีกล่อง'}
          </div>
        ) : (
          filteredBoxes.map((box) => {
            const isStored = box.status === 'stored'
            return (
              <div key={box.id} style={{
                display: 'grid',
                gridTemplateColumns: '160px 60px 70px 100px 80px 80px 120px 1fr',
                gap: 8, padding: '12px 20px',
                borderBottom: '1px solid var(--border, #E4E4E7)',
                fontSize: 13, alignItems: 'center',
                opacity: isStored ? 1 : 0.5,
              }}>
                {/* Box Label */}
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {box.boxLabel}
                </span>

                {/* Type */}
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                  background: box.type === 'FFP' ? '#DBEAFE' : '#FEE2E2',
                  color: box.type === 'FFP' ? '#1D4ED8' : '#991B1B',
                  textAlign: 'center',
                }}>
                  {box.type}
                </span>

                {/* Blood */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 24, borderRadius: 99,
                  fontSize: 12, fontWeight: 700,
                  background: GROUP_SURFACE[box.blood] || '#f0f0f0',
                  color: GROUP_COLOR[box.blood] || '#666',
                }}>
                  {box.blood}
                </span>

                {/* Location */}
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {box.location === 'room' ? 'ห้อง' : 'ตู้'} -30°C
                </span>

                {/* Shelf */}
                <span style={{ fontWeight: 600 }}>{box.shelf}</span>

                {/* Units count */}
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                  {box.units.length}
                </span>

                {/* Stored date */}
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {new Date(box.storedAt).toLocaleDateString('th-TH', {
                    day: 'numeric', month: 'short', year: '2-digit',
                  })}
                </span>

                {/* Status */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 12, fontWeight: 600,
                  color: isStored ? '#16A34A' : '#DC2626',
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: isStored ? '#16A34A' : '#DC2626',
                  }} />
                  {isStored ? 'เก็บอยู่' : 'นำออกแล้ว'}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
