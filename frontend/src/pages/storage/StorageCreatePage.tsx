// ============================================================
//  frontend/src/pages/storage/StorageCreatePage.tsx
//  ฟอร์มจัดเก็บกล่องใหม่ (/storage/new) — timeline ซ้าย + การ์ดสรุป sticky ขวา
// ============================================================

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ChevronDown, CircleCheck, Info, MapPin, Package, PackageCheck, Printer,
  RotateCcw, ScanBarcode, TriangleAlert, X,
} from 'lucide-react'
import useStorage from './services/useStorage'
import BarcodeLabel from './components/BarcodeLabel'
import StorageQuickAdd from './components/StorageQuickAdd'
import RackSlotPicker from './components/RackSlotPicker'
import StorageUnitScanner from './components/StorageUnitScanner'
import StorageSummaryCard from './components/StorageSummaryCard'
import TimelineSection from '../../components/shared/TimelineSection'
import Button from '../../components/common/Button'
import FormInput from '../../components/common/FormInput'
import SelectDropdown, { type OptionType } from '../../components/common/SelectDropdown'
import DateInput from '../../components/common/DateInput'
import Toast from '../../components/common/Toast'
import { ConfirmModal } from '../../components/common/Modal'
import { BOX_CAPACITY } from '../../helpers/rack'
import { todayISO } from './services/useStorage'
import '../../assets/styles/ext-blood-form.css'
import '../../assets/styles/ext-committee.css'
import '../../assets/styles/storage.css'

const WIDE_MIN = 860
const BOX_NAME_MAX = 60
const pick = (opts: OptionType[], v: string) => opts.find((o) => o.value === v) ?? null

/** กว้างพอสำหรับ 2 คอลัมน์หรือไม่ — วัดจาก container (ไม่ใช่ viewport เพราะ sidebar ย่อ/ขยายได้) */
function useWide<T extends HTMLElement>(min: number) {
  const ref = useRef<T>(null)
  const [wide, setWide] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setWide(el.clientWidth >= min)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [min])
  return [ref, wide] as const
}

const StorageCreatePage = () => {
  const navigate = useNavigate()
  const s = useStorage()
  const [ref, wide] = useWide<HTMLDivElement>(WIDE_MIN)
  const [leave, setLeave] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [barOpen, setBarOpen] = useState(false)

  const typeO = useMemo<OptionType[]>(() => s.master.plasmaTypes.map((t) => ({ value: t.code, label: t.code })), [s.master.plasmaTypes])
  const bloodO = useMemo<OptionType[]>(() => s.master.bloodTypes.map((b) => ({ value: b.code, label: b.code })), [s.master.bloodTypes])
  const zoneO = useMemo<OptionType[]>(() => s.master.zones.map((z) => ({ value: z.id, label: z.name })), [s.master.zones])
  const shelfO = useMemo<OptionType[]>(() => s.availableShelves.map((x) => ({ value: x.code, label: x.code })), [s.availableShelves])

  const n = s.scannedUnits.length
  const err = s.tried ? s.errors : {}
  const infoLeft = [s.errors.type, s.errors.blood, s.errors.collectionDate].filter(Boolean).length
  const parts = [infoLeft === 0, !!s.locationLabel, n > 0]
  const doneN = parts.filter(Boolean).length
  const missing = Object.values(s.errors)

  const goList = () => navigate('/storage')
  const back = () => (n > 0 ? setLeave(true) : goList())

  const saveBtn = (size?: 'sm', block?: boolean) => (
    <Button size={size} block={block} variant="primary" icon={<PackageCheck size={16} />} onClick={s.handleSubmit} loading={s.submitting}>
      {n > 0 ? `จัดเก็บ ${n} ถุง` : 'จัดเก็บกล่อง'}
    </Button>
  )
  const clearBtn = (size?: 'sm', block?: boolean) => (
    <Button size={size} block={block} variant="ghost" icon={<RotateCcw size={16} />} onClick={() => setConfirmClear(true)} disabled={s.submitting}>
      ล้างฟอร์ม
    </Button>
  )
  const summary = (actions?: React.ReactNode) => (
    <StorageSummaryCard
      parts={parts}
      nextLabel={s.nextLabel}
      boxName={s.form.boxName}
      type={s.form.type}
      blood={s.form.blood}
      collectionDate={s.form.collectionDate}
      location={s.locationLabel}
      unitCount={n}
      actions={actions}
    />
  )

  return (
    <div ref={ref} className="sto-create" style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <Toast toast={s.toast} onDismiss={s.dismissToast} />
      {s.printData && <BarcodeLabel data={s.printData} onClose={s.closePrint} />}

      <ConfirmModal
        open={leave}
        type="danger"
        title="ออกจากหน้านี้?"
        message={`ถุงที่สแกนไว้ ${n} ถุงยังไม่ได้บันทึก และจะหายไป`}
        confirmText="ออกโดยไม่บันทึก"
        cancelText="อยู่ต่อ"
        onClose={() => setLeave(false)}
        onConfirm={goList}
      />
      <ConfirmModal
        open={confirmClear}
        type="warning"
        title="ล้างฟอร์ม?"
        message={n > 0 ? `ข้อมูลที่กรอกและถุงที่สแกนไว้ ${n} ถุงจะถูกล้างทั้งหมด` : 'ข้อมูลที่กรอกไว้จะถูกล้างทั้งหมด'}
        confirmText="ล้างฟอร์ม"
        onClose={() => setConfirmClear(false)}
        onConfirm={() => { s.resetForm(); setConfirmClear(false) }}
      />

      <div className="ext-form-header">
        <Button variant="outline" className="sto-create__back" icon={<ArrowLeft size={18} />} aria-label="กลับไปรายการกล่อง" onClick={back} />
        <p className="sto-header__desc">กรอกข้อมูลกล่อง เลือกตำแหน่ง แล้วสแกนถุง — ระบบรันหมายเลขกล่องและพิมพ์ฉลากให้อัตโนมัติ</p>
      </div>

      {s.saved && (
        <div className="sto-banner sto-banner--success" role="status">
          <CircleCheck size={18} aria-hidden="true" />
          <p className="sto-banner__text">
            จัดเก็บ <b className="sto-mono">{s.saved.boxLabel}</b> · {s.saved.unitCount} ถุง{s.saved.location ? ` · ${s.saved.location}` : ''} — ฟอร์มพร้อมสำหรับกล่องถัดไป (ชนิด หมู่ และชั้นวางเดิม)
          </p>
          <div className="sto-banner__actions">
            <Button size="sm" variant="outline" icon={<Printer size={14} />} onClick={() => s.saved && s.openPrint(s.saved.print)}>พิมพ์ฉลาก</Button>
            <Button size="sm" variant="ghost" onClick={back}>ดูรายการกล่อง</Button>
            <button type="button" className="sto-icon-btn" aria-label="ปิดข้อความ" onClick={s.dismissSaved}><X size={16} /></button>
          </div>
        </div>
      )}
      {s.tried && !s.valid && (
        <div className="sto-banner sto-banner--danger" role="alert">
          <TriangleAlert size={18} aria-hidden="true" />
          <p className="sto-banner__text">ยังไม่ครบ: {missing.join(' · ')}</p>
        </div>
      )}
      {s.submitError && (
        <div className="sto-banner sto-banner--danger" role="alert">
          <TriangleAlert size={18} aria-hidden="true" />
          <p className="sto-banner__text">{s.submitError}</p>
        </div>
      )}

      {/* จอแคบ: แถบสรุปติดบน */}
      {!wide && (
        <div className="sto-sumbar">
          <div className="sto-sumbar__row">
            <button type="button" className="sto-sumbar__toggle" aria-expanded={barOpen} onClick={() => setBarOpen(!barOpen)}>
              <span className="sto-sumbar__parts">{doneN}/3 ส่วน</span>
              <span className="sto-muted">· {n} ถุง</span>
              <ChevronDown size={16} className={`sto-sumbar__chev ${barOpen ? 'is-open' : ''}`} aria-hidden="true" />
            </button>
            <div className="sto-sumbar__actions">{clearBtn('sm')}{saveBtn('sm')}</div>
          </div>
          {barOpen && <div className="sto-sumbar__card">{summary()}</div>}
        </div>
      )}

      <div className={`sto-create__layout ${wide ? 'is-wide' : ''}`}>
        <div className="sto-create__main">
          <TimelineSection icon={<Package size={16} />} title="ข้อมูลกล่อง" done={parts[0]} hint={parts[0] ? 'ครบแล้ว' : `เหลือ ${infoLeft} ช่อง`}>
            <div className="ext-form-content">
              <div className="sto-create__grid">
                <div>
                  <SelectDropdown label="ชนิดเลือด" required placeholder="เลือกชนิดเลือด" options={typeO} value={pick(typeO, s.form.type)}
                    onChange={(o) => s.handleFormChange('type', o?.value ?? '')} isClearable={false} error={err.type} />
                  <StorageQuickAdd placeholder="ชนิดใหม่ เช่น FFP" onAdd={(v) => s.handleQuickAdd('type', v)} />
                </div>
                <div>
                  <SelectDropdown label="หมู่เลือด" required placeholder="เลือกหมู่เลือด" options={bloodO} value={pick(bloodO, s.form.blood)}
                    onChange={(o) => s.handleFormChange('blood', o?.value ?? '')} isClearable={false} error={err.blood} />
                  <StorageQuickAdd placeholder="หมู่เลือดใหม่" uppercase onAdd={(v) => s.handleQuickAdd('blood', v)} />
                </div>
                <DateInput label="วันที่เก็บ" required value={s.form.collectionDate} max={todayISO()}
                  onChange={(iso) => s.handleFormChange('collectionDate', iso)} error={err.collectionDate} />
                <FormInput label="ชื่อกล่อง (ไม่บังคับ)" placeholder="เช่น กล่องสำรองฉุกเฉิน" maxLength={BOX_NAME_MAX}
                  value={s.form.boxName} onChange={(v) => s.handleFormChange('boxName', v)} />
              </div>
            </div>
          </TimelineSection>

          <TimelineSection icon={<MapPin size={16} />} title="ตำแหน่งจัดเก็บ" done={parts[1]} hint={s.locationLabel || 'เลือกห้อง/ตู้ ชั้นวาง และช่องที่จะวางกล่อง'}>
            <div className="ext-form-content">
              <div className="sto-create__grid">
                <div>
                  <SelectDropdown label="ห้อง/ตู้" required placeholder="เลือกห้อง/ตู้" options={zoneO} value={pick(zoneO, s.form.zoneId)}
                    onChange={(o) => s.handleFormChange('zoneId', o?.value ?? '')} isClearable={false} isSearchable={false} error={err.zoneId} />
                  <StorageQuickAdd placeholder="ชื่อห้อง/ตู้ใหม่" maxLength={40} onAdd={(v) => s.handleQuickAdd('zone', v)} />
                </div>
                <div>
                  <SelectDropdown label="ชั้นวาง" required placeholder={s.form.zoneId ? 'เลือกชั้นวาง' : 'เลือกห้อง/ตู้ก่อน'} options={shelfO} value={pick(shelfO, s.form.shelf)}
                    onChange={(o) => s.handleFormChange('shelf', o?.value ?? '')} disabled={!s.form.zoneId} isClearable={false} isSearchable={false}
                    error={s.form.zoneId ? err.shelf : undefined} />
                  <StorageQuickAdd placeholder="รหัสชั้นวางใหม่" uppercase disabled={!s.form.zoneId} onAdd={(v) => s.handleQuickAdd('shelf', v)} />
                </div>
              </div>

              {s.form.shelf && (s.isRackZone ? (
                <RackSlotPicker
                  level={s.rackLevel}
                  position={s.rackPosition}
                  freeSlots={s.freeSlots}
                  occupantLabel={s.occupantLabel}
                  onLevelChange={s.setRackLevel}
                  onPositionChange={s.setRackPosition}
                  error={err.slot}
                  disabled={s.submitting}
                />
              ) : (
                <p className="sto-info"><Info size={16} aria-hidden="true" /> ตู้ไม่ใช้ rack — วางกล่องในชั้น {s.form.shelf} ได้เลย</p>
              ))}
            </div>
          </TimelineSection>

          <TimelineSection icon={<ScanBarcode size={16} />} title="สแกนถุง" done={parts[2]}
            hint={n > 0 ? `${n}/${BOX_CAPACITY} ถุง` : `สูงสุด ${BOX_CAPACITY} ถุง · ตรวจ Unit ซ้ำอัตโนมัติ`} last>
            <div className="ext-form-content">
              <StorageUnitScanner
                units={s.scannedUnits}
                input={s.unitInput}
                error={s.unitError || err.units}
                checking={s.checking}
                disabled={s.submitting}
                onInputChange={s.setUnitInput}
                onAdd={s.handleAddUnit}
                onKeyDown={s.handleUnitKeyDown}
                onRemove={s.handleRemoveUnit}
              />
            </div>
          </TimelineSection>
        </div>

        {wide && (
          <div className="sto-create__aside">
            {summary(<>{saveBtn(undefined, true)}{clearBtn(undefined, true)}<p className="sto-sum__note">บันทึกแล้วพิมพ์ฉลากบาร์โค้ดได้ทันที</p></>)}
          </div>
        )}
      </div>
    </div>
  )
}

export default StorageCreatePage
