// frontend/src/pages/ExtBlood/components/ExtExportModal.tsx
//
// นำออกถุงเลือด — เลือกถุง → รายละเอียด → ยืนยันด้วย PIN
// CSS: src/assets/styles/ext-blood.css (.ext-export__*)

import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Box, Building2, Check, Info, Lock, MapPin, PackageOpen, Search } from 'lucide-react'
import Modal from '../../../components/common/Modal'
import FormInput from '../../../components/common/FormInput'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import DateInput from '../../../components/common/DateInput'
import Button from '../../../components/common/Button'
import { bloodGroupClass } from '../services/extHelpers'
import type { ExtDocument, ExtExportReason } from '../services/ExtBloodType'

interface Props {
  doc: ExtDocument
  exportReasons: ExtExportReason[]
  onExport: (docId: string, bagIds: string[], reasonId: string, date: string, note: string, pin: string) => Promise<void>
  onClose: () => void
}

const SEARCH_THRESHOLD = 8
const CHIP_MAX = 6
const PIN_LENGTH = 6

/** yyyy-MM-dd ตามเวลาเครื่อง (ไม่ใช้ toISOString เพราะเป็น UTC — ก่อน 07:00 จะได้วันก่อนหน้า) */
const toLocalISO = (d: Date): string => {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** วันที่รับเลือดเป็น yyyy-MM-dd — รองรับทั้ง date-only, เที่ยงคืน UTC และ timestamp เต็ม */
const toDateOnly = (iso: string): string => {
  if (/^\d{4}-\d{2}-\d{2}($|T00:00:00(\.0+)?Z$)/.test(iso)) return iso.slice(0, 10)
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : toLocalISO(d)
}

const errorMessage = (e: unknown): string => {
  if (typeof e === 'object' && e !== null && 'message' in e && typeof e.message === 'string' && e.message) {
    return e.message
  }
  return 'นำออกไม่สำเร็จ กรุณาลองอีกครั้ง'
}

export default function ExtExportModal({ doc, exportReasons, onExport, onClose }: Props) {
  const uid = useId()
  const pinId = `${uid}-pin`
  const bodyRef = useRef<HTMLDivElement>(null)

  const inStock = useMemo(() => doc.bags.filter(b => b.status === 'IN_STOCK'), [doc.bags])
  const today = useMemo(() => toLocalISO(new Date()), [])
  const receivedDate = useMemo(() => toDateOnly(doc.receivedDate), [doc.receivedDate])

  const [selBags, setSelBags] = useState<string[]>(() => (inStock.length === 1 ? [inStock[0].id] : []))
  const [query, setQuery] = useState('')
  const [reasonId, setReasonId] = useState('')
  const [exportDate, setExportDate] = useState(today)
  const [note, setNote] = useState('')
  const [pin, setPin] = useState('')
  const [tried, setTried] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  /* ── ถุง ── */
  const q = query.trim().toLowerCase()
  const visibleBags = useMemo(
    () => (q ? inStock.filter(b => b.bagNumber.toLowerCase().includes(q)) : inStock),
    [inStock, q],
  )
  const selectedCount = selBags.length
  const left = inStock.length - selectedCount
  const allSelected = inStock.length > 0 && selectedCount === inStock.length
  const allVisibleSelected = visibleBags.length > 0 && visibleBags.every(b => selBags.includes(b.id))

  const toggleBag = (id: string) =>
    setSelBags(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]))
  // ระหว่างค้นหา เลือกเฉพาะถุงที่เห็น — กันนำออกถุงที่ถูกซ่อนอยู่โดยไม่ตั้งใจ
  const selectVisible = () =>
    setSelBags(p => [...p, ...visibleBags.filter(b => !p.includes(b.id)).map(b => b.id)])
  const clearSelected = () => setSelBags([])

  /* ── เหตุผล ── */
  const useChips = exportReasons.length <= CHIP_MAX
  const reasonOpts = useMemo<OptionType[]>(
    () => exportReasons.map(r => ({ value: r.id, label: r.name })),
    [exportReasons],
  )
  const selectedReason = reasonOpts.find(o => o.value === reasonId) ?? null

  const onReasonKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step || exportReasons.length === 0) return
    e.preventDefault()
    const cur = exportReasons.findIndex(r => r.id === reasonId)
    const next = (Math.max(cur, 0) + (cur < 0 && step > 0 ? 0 : step) + exportReasons.length) % exportReasons.length
    setReasonId(exportReasons[next].id)
    e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus()
  }

  /* ── Validation ── */
  const bagError = selectedCount === 0 ? 'เลือกถุงที่จะนำออกอย่างน้อย 1 ถุง' : ''
  const reasonError = !reasonId ? 'เลือกเหตุผลการนำออก' : ''
  const dateError = !exportDate ? 'ระบุวันที่นำออก'
    : exportDate > today ? 'วันที่นำออกต้องไม่เกินวันนี้'
    : receivedDate && exportDate < receivedDate ? 'วันที่นำออกต้องไม่ก่อนวันที่รับเลือด'
    : ''
  const pinError = pin.length !== PIN_LENGTH ? `กรอก PIN ให้ครบ ${PIN_LENGTH} หลัก` : ''
  const show = (msg: string) => (tried ? msg : '')

  const handlePin = (v: string) => {
    setPin(v.replace(/\D/g, '').slice(0, PIN_LENGTH))
    if (apiError) setApiError('')
  }

  const handleSubmit = async () => {
    if (loading) return
    setTried(true)
    setApiError('')
    const firstInvalid = bagError ? 'bags' : reasonError || dateError ? 'detail' : pinError ? 'auth' : ''
    if (firstInvalid) {
      bodyRef.current
        ?.querySelector(`[data-section="${firstInvalid}"]`)
        ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      return
    }
    setLoading(true)
    try {
      await onExport(doc.id, selBags, reasonId, exportDate, note.trim(), pin)
      onClose()
    } catch (e: unknown) {
      setApiError(errorMessage(e))
      setPin('')
      document.getElementById(pinId)?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => { if (!loading) onClose() }

  /* ── Render ── */
  const title = (
    <span className="ext-export__title">
      <span>นำออกถุงเลือด</span>
      <span className="ext-export__docno">{doc.docNumber}</span>
    </span>
  )

  const footer = (
    <>
      <span className="ext-export__summary" aria-live="polite">
        {selectedCount > 0
          ? <>นำออก <strong>{selectedCount}</strong> ถุง · เหลือ {left} ถุง</>
          : 'ยังไม่ได้เลือกถุง'}
      </span>
      <span className="ext-export__footer-actions">
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          ยกเลิก
        </Button>
        <Button variant="danger" icon={<PackageOpen size={16} />} onClick={handleSubmit} loading={loading}>
          {selectedCount > 0 ? `ยืนยันนำออก ${selectedCount} ถุง` : 'ยืนยันนำออก'}
        </Button>
      </span>
    </>
  )

  return (
    <Modal
      open
      onClose={handleClose}
      title={title}
      titleIcon={<PackageOpen size={18} />}
      size="md"
      footer={footer}
      footerAlign="between"
      closeOnEsc={!loading}
      closeOnOverlay={!loading}
      className="ext-export-modal"
    >
      <div className="ext-export" ref={bodyRef}>
        {/* 0. บริบทเอกสาร */}
        <div className="ext-export__context">
          <span className={`blood-badge ${bloodGroupClass(doc.bloodGroup)} ext-export__group`}>{doc.bloodGroup}</span>
          <div className="ext-export__context-main">
            <div className="ext-export__product">
              {doc.bloodProduct.code}{doc.bloodProduct.name ? ` · ${doc.bloodProduct.name}` : ''}
            </div>
            <div className="ext-export__meta">
              <span><Box size={12} aria-hidden="true" />{doc.boxLabel || '-'}</span>
              <span><MapPin size={12} aria-hidden="true" />{doc.storage.name}</span>
              <span><Building2 size={12} aria-hidden="true" />{doc.source.name}</span>
            </div>
          </div>
          <div className="ext-export__stock">
            <div className="ext-export__stock-num">{inStock.length}/{doc.bagCount}</div>
            <div className="ext-export__stock-label">คงคลัง</div>
          </div>
        </div>

        {/* 1. เลือกถุง */}
        <section className="ext-export__section" data-section="bags">
          <div className="ext-export__head">
            <h4 className="ext-export__heading">
              <span className="ext-export__step" aria-hidden="true">1</span>
              เลือกถุงที่จะนำออก <span className="ext-export__req" aria-hidden="true">*</span>
            </h4>
            <div className="ext-export__head-actions">
              <span className="ext-export__count">{selectedCount}/{inStock.length}</span>
              <button
                type="button"
                className="ext-export__mini-btn"
                onClick={selectVisible}
                disabled={allVisibleSelected || visibleBags.length === 0}
              >
                {q ? `เลือกที่พบ (${visibleBags.length})` : 'เลือกทั้งหมด'}
              </button>
              <button
                type="button"
                className="ext-export__mini-btn"
                onClick={clearSelected}
                disabled={selectedCount === 0}
              >
                ล้างที่เลือก
              </button>
            </div>
          </div>

          {inStock.length > SEARCH_THRESHOLD && (
            <FormInput
              type="search"
              size="sm"
              mono
              icon={<Search size={14} />}
              placeholder="ค้นหาเลขถุง"
              aria-label="ค้นหาเลขถุง"
              value={query}
              onChange={setQuery}
            />
          )}

          {visibleBags.length > 0 ? (
            <div
              className={`ext-export__grid${show(bagError) ? ' ext-export__grid--error' : ''}`}
              role="group"
              aria-label="ถุงเลือดคงคลัง"
            >
              {visibleBags.map(bag => {
                const checked = selBags.includes(bag.id)
                return (
                  <label key={bag.id} className={`ext-export__bag${checked ? ' ext-export__bag--selected' : ''}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleBag(bag.id)} />
                    <span className="ext-export__bag-no">{bag.bagNumber}</span>
                    {checked && <PackageOpen size={14} aria-hidden="true" />}
                  </label>
                )
              })}
            </div>
          ) : (
            <p className="ext-export__empty">
              {q ? (
                <>
                  ไม่พบเลขถุง "{query.trim()}" — ตรวจเลขอีกครั้งหรือ{' '}
                  <button type="button" className="ext-export__link" onClick={() => setQuery('')}>ล้างคำค้น</button>
                </>
              ) : 'ไม่มีถุงคงคลังให้นำออก'}
            </p>
          )}

          {show(bagError) && <p className="ext-export__error" role="alert">{bagError}</p>}

          {allSelected && (
            <div className="ext-export__warning" role="status">
              <Info size={16} aria-hidden="true" />
              <span>นำออกครบทุกถุง — เอกสารจะเปลี่ยนเป็น "นำออกแล้ว" และแก้ไขไม่ได้อีก</span>
            </div>
          )}
        </section>

        {/* 2. รายละเอียด */}
        <section className="ext-export__section" data-section="detail">
          <h4 className="ext-export__heading">
            <span className="ext-export__step" aria-hidden="true">2</span>
            รายละเอียดการนำออก
          </h4>

          <div>
            <span className="ext-export__label" id={`${uid}-reason`}>
              เหตุผล <span className="ext-export__req" aria-hidden="true">*</span>
            </span>
            {useChips ? (
              <div
                className="ext-export__chips"
                role="radiogroup"
                aria-labelledby={`${uid}-reason`}
                aria-required="true"
                onKeyDown={onReasonKeyDown}
              >
                {exportReasons.map((r, i) => {
                  const checked = r.id === reasonId
                  return (
                    <button
                      key={r.id}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      tabIndex={checked || (!reasonId && i === 0) ? 0 : -1}
                      className={`ext-export__chip${checked ? ' ext-export__chip--selected' : ''}`}
                      onClick={() => setReasonId(r.id)}
                    >
                      {checked && <Check size={14} aria-hidden="true" />}
                      {r.name}
                    </button>
                  )
                })}
              </div>
            ) : (
              <SelectDropdown
                placeholder="เลือกเหตุผล..."
                options={reasonOpts}
                value={selectedReason}
                onChange={opt => setReasonId(opt?.value ?? '')}
                isClearable={false}
                isSearchable
                error={show(reasonError) || undefined}
              />
            )}
            {useChips && show(reasonError) && <p className="ext-export__error" role="alert">{reasonError}</p>}
          </div>

          <div className="ext-export__row">
            <div>
              <span className="ext-export__label">
                วันที่นำออก <span className="ext-export__req" aria-hidden="true">*</span>
              </span>
              <DateInput
                value={exportDate}
                onChange={setExportDate}
                min={receivedDate || undefined}
                max={today}
                error={show(dateError) || undefined}
              />
            </div>
            <FormInput
              label="หมายเหตุ (ไม่บังคับ)"
              placeholder="เช่น HN ผู้ป่วย, เลขใบเบิก"
              value={note}
              onChange={setNote}
              maxLength={200}
            />
          </div>
        </section>

        {/* 3. ยืนยันตัวตน */}
        <section className="ext-export__section ext-export__section--auth" data-section="auth">
          <h4 className="ext-export__heading">
            <span className="ext-export__step" aria-hidden="true">3</span>
            ยืนยันตัวตน
          </h4>
          <FormInput
            id={pinId}
            label={`PIN ${PIN_LENGTH} หลัก`}
            required
            type="password"
            mono
            icon={<Lock size={14} />}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={PIN_LENGTH}
            placeholder="••••••"
            value={pin}
            onChange={handlePin}
            error={apiError || show(pinError) || undefined}
            helper="การนำออกจะบันทึกในประวัติเอกสารพร้อมชื่อผู้ดำเนินการ"
            onKeyDown={e => { if (e.key === 'Enter') void handleSubmit() }}
          />
        </section>
      </div>
    </Modal>
  )
}
