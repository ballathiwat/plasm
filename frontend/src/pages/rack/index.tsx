// ============================================================
//  src/pages/rack/index.tsx
//  /map/rack/:code?level=&slot= — rack → ชั้น → ช่อง → ถุง (ห้อง -30°C)
// ============================================================

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, CircleCheck, Info, Layers } from 'lucide-react'
import { ConfirmModal } from '../../components/common/Modal'
import StorageToast from '../storage/components/StorageToast'
import BarcodeLabel, { type BarcodeLabelData } from '../storage/components/BarcodeLabel'
import type { ToastState } from '../storage/services/StorageType'
import { BOX_CAPACITY, RACK_LEVELS, RACK_POSITIONS, positionLabel, rackUrl } from '../../helpers/rack'
import useRack from './services/useRack'
import RackSearch from './components/RackSearch'
import RackLevelPicker from './components/RackLevelPicker'
import RackLevelPlan from './components/RackLevelPlan'
import RackBoxPanel, { RackEmptyPanel } from './components/RackBoxPanel'
import RackAddBoxModal, { type SavedBox } from './components/RackAddBoxModal'
import type { ApiError, PanelMode, RackBox, RackSearchResult } from './services/RackType'
import './rack.css'

const NOTICE_MS = 3500

export default function RackPage() {
  const { code: rawCode = '' } = useParams<{ code: string }>()
  const code = rawCode.toUpperCase()
  const navigate = useNavigate()

  const {
    zone, rackCodes, plasmaTypes, bloodTypes, reasons,
    rack, currentLevel, loading, error, refetch,
    level, slot, select, lockOf, acquire, release,
  } = useRack(code)

  const [mode, setMode] = useState<PanelMode>('view')
  const [adding, setAdding] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [askDiscard, setAskDiscard] = useState<null | (() => void)>(null)
  const [highlight, setHighlight] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ msg: string; tone: 'success' | 'info' } | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [printData, setPrintData] = useState<BarcodeLabelData | null>(null)

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), NOTICE_MS)
    return () => clearTimeout(t)
  }, [notice])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  // ── derived ──
  const box: RackBox | undefined = slot && currentLevel ? currentLevel.slots[slot] : undefined
  const slotLockedBy = slot ? lockOf(level, slot) : null
  const totals = useMemo(() => {
    let boxes = 0
    let units = 0
    rack?.levels.forEach((l) => Object.values(l.slots).forEach((b) => { boxes++; units += b.units.length }))
    return { boxes, units }
  }, [rack])
  const bloodOrder = useMemo(() => {
    const list = [...bloodTypes]
    rack?.levels.forEach((l) => Object.values(l.slots).forEach((b) => { if (!list.includes(b.blood)) list.push(b.blood) }))
    return list
  }, [bloodTypes, rack])
  const tabs = rackCodes.includes(code) || !code ? rackCodes : [...rackCodes, code]

  // ── edit lifecycle ──
  const leaveEdit = useCallback(() => {
    setMode('view')
    setAdding(false)
    setDirty(false)
    void release()
  }, [release])

  /** ถ้ามีข้อมูลค้าง → ถามก่อน */
  const guard = (fn: () => void) => {
    if (dirty) setAskDiscard(() => fn)
    else fn()
  }

  const handleConflict = (msg: string, conflict: boolean) => {
    setToast({ type: 'error', msg })
    if (conflict) {
      leaveEdit()
      void refetch()
    }
  }

  const lockSlot = async (pos: number | null = slot): Promise<boolean> => {
    if (!pos) return false
    try {
      await acquire({ level, position: pos })
      return true
    } catch (e) {
      const ae = e as ApiError
      handleConflict(ae?.message || 'ไม่สามารถล็อกช่องได้', true)
      return false
    }
  }

  const openAdd = async (pos: number | null = slot) => {
    if (await lockSlot(pos)) {
      setDirty(false)
      setAdding(true)
    }
  }

  const changeMode = async (m: PanelMode) => {
    if (m === 'view') { guard(leaveEdit); return }
    if (await lockSlot()) {
      setDirty(false)
      setMode(m)
    }
  }

  // ── navigation ──
  const pickLevel = (lv: number) => guard(() => {
    leaveEdit()
    setHighlight(null)
    select({ level: lv, slot: null })
  })

  const pickSlot = (p: number) => {
    const empty = !currentLevel?.slots[p]
    const free = empty && !lockOf(level, p)
    if (p === slot && (adding || mode !== 'view')) return
    guard(() => {
      leaveEdit()
      setHighlight(null)
      select({ slot: p })
      // คลิกช่องว่าง → เปิด "กล่องใหม่" ทันที
      if (free) void openAdd(p)
    })
  }

  const switchRack = (c: string) => {
    if (c === code) return
    guard(() => {
      leaveEdit()
      setHighlight(null)
      navigate(rackUrl(c))
    })
  }

  const onSearchPick = (r: RackSearchResult) => guard(() => {
    leaveEdit()
    if (r.level == null || r.position == null) {
      setNotice({
        tone: 'info',
        msg: `${r.matchedUnit ? `Unit ${r.matchedUnit} ในกล่อง ${r.box.boxLabel}` : r.box.boxLabel} อยู่ที่ ${r.zoneName} · ${positionLabel(r)}`,
      })
      return
    }
    setHighlight(r.matchedUnit)
    if (r.shelf.toUpperCase() !== code) navigate(rackUrl(r.shelf, r.level, r.position))
    else select({ level: r.level, slot: r.position })
  })

  // ── results ──
  const toPrint = (b: { boxLabel: string; type: string; blood: string; collectionDate: string; units: string[] }, lv: number, pos: number) => {
    setPrintData({
      boxLabel: b.boxLabel,
      type: b.type,
      blood: b.blood,
      location: zone?.name ?? 'ห้อง -30°C',
      shelf: `${code}-${lv} ช่อง ${pos}`,
      collectionDate: b.collectionDate,
      unitCount: b.units.length,
    })
  }

  const onPanelDone = (msg: string, jump?: { code: string; level: number; position: number }) => {
    leaveEdit()
    setHighlight(null)
    setNotice({ tone: 'success', msg })
    if (jump && jump.code !== code) {
      navigate(rackUrl(jump.code, jump.level, jump.position))
      return
    }
    if (jump) select({ level: jump.level, slot: jump.position })
    void refetch()
  }

  const onAddSaved = (b: SavedBox) => {
    if (!slot) return
    leaveEdit()
    setNotice({ tone: 'success', msg: `จัดเก็บ ${b.boxLabel} ที่ ${code}-${level} ช่อง ${slot} แล้ว` })
    toPrint(b, level, slot)
    void refetch()
  }

  // ── render ──
  if (loading && !rack) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
  }

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <StorageToast toast={toast} onDismiss={() => setToast(null)} />
      {printData && <BarcodeLabel data={printData} onClose={() => setPrintData(null)} />}

      {/* ── Header ── */}
      <nav className="rack-breadcrumb" aria-label="breadcrumb">
        <button type="button" className="rack-breadcrumb__back" onClick={() => guard(() => { leaveEdit(); navigate('/map') })}>
          <ChevronLeft size={14} /> แผนผังจัดเก็บ
        </button>
        <span aria-hidden="true">›</span>
        <span>{zone?.name ?? 'ห้อง -30°C'}</span>
        <span aria-hidden="true">›</span>
        <span className="rack-breadcrumb__current" aria-current="page">Rack {code}</span>
      </nav>

      <div className="rack-head">
        <div>
          <h2 className="rack-title">
            <Layers size={18} color="var(--primary)" />
            Rack {code}
          </h2>
          <p className="rack-sub">
            {zone?.name ?? 'ห้อง -30°C'} · {totals.boxes}/{RACK_LEVELS * RACK_POSITIONS} กล่อง · {totals.units} units · ชั้น 1 = บนสุด
          </p>
        </div>
        <div className="rack-tabs" role="tablist" aria-label="เลือก rack">
          {tabs.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={c === code}
              className="rack-tab"
              onClick={() => switchRack(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="rack-toolbar">
        <RackSearch onPick={onSearchPick} />
        {notice && (
          <div className={`rack-notice${notice.tone === 'info' ? ' rack-notice--info' : ''}`} role="status">
            {notice.tone === 'info' ? <Info size={16} /> : <CircleCheck size={16} />}
            {notice.msg}
          </div>
        )}
      </div>

      {error && !rack && (
        <div className="rack-banner rack-banner--danger" role="alert">
          <span>{error}</span>
        </div>
      )}

      {rack && currentLevel && zone && (
        <div className="rack-card">
          <RackLevelPicker
            code={code}
            levels={rack.levels}
            active={level}
            bloodOrder={bloodOrder}
            onPick={pickLevel}
          />

          <RackLevelPlan
            code={code}
            level={currentLevel}
            selected={slot}
            pending={adding ? slot : null}
            lockOf={lockOf}
            onSelect={pickSlot}
          />

          {box ? (
            <RackBoxPanel
              code={code}
              zoneId={zone.id}
              box={box}
              levels={rack.levels}
              rackCodes={tabs}
              reasons={reasons}
              mode={mode}
              lockedBy={slotLockedBy}
              highlight={highlight}
              onMode={(m) => void changeMode(m)}
              onDirty={setDirty}
              onPrint={(b) => toPrint(b, b.level, b.position)}
              onDone={onPanelDone}
              onError={handleConflict}
            />
          ) : (
            <RackEmptyPanel position={slot} lockedBy={slotLockedBy} onAdd={() => void openAdd()} />
          )}
        </div>
      )}

      {zone && slot && !box && (
        <RackAddBoxModal
          open={adding}
          zoneId={zone.id}
          code={code}
          level={level}
          position={slot}
          plasmaTypes={plasmaTypes}
          bloodTypes={bloodTypes}
          escEnabled={!askDiscard}
          onClose={() => guard(leaveEdit)}
          onDirty={setDirty}
          onSaved={onAddSaved}
          onError={handleConflict}
        />
      )}

      <ConfirmModal
        open={!!askDiscard}
        type="danger"
        title="ยกเลิกการแก้ไขที่ยังไม่บันทึก?"
        message="การเปลี่ยนแปลงที่ยังไม่ได้บันทึกจะหายไป"
        cancelText="กรอกต่อ"
        confirmText="ทิ้งข้อมูล"
        onClose={() => setAskDiscard(null)}
        onConfirm={() => {
          const fn = askDiscard
          setAskDiscard(null)
          leaveEdit()
          fn?.()
        }}
      />

      <p className="rack-hint" style={{ marginTop: 12 }}>
        กล่องละไม่เกิน {BOX_CAPACITY} ถุง · ถุงที่ 1 = ด้านหน้า (ฝาเปิด)
      </p>
    </div>
  )
}
