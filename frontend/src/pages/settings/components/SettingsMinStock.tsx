// frontend/src/pages/settings/components/SettingsMinStock.tsx
// ตั้งค่า › ระบบ › สต็อกขั้นต่ำ — กำหนดแยกตาม ชนิดเลือด × หมู่เลือด (ต้องกด "บันทึก")
//   container ≥ 760px = ตาราง matrix · แคบกว่านั้น = การ์ดต่อชนิดเลือด (วัดจาก container ไม่ใช่ window)
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Copy, EyeOff, Gauge, History, Rows3, Save } from 'lucide-react'
import Button from '../../../components/common/Button'
import Modal from '../../../components/common/Modal'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import MinStatusPill from '../../../components/common/MinStatusPill'
import ExtRowMenu from '../../ExtBlood/components/ExtRowMenu'
import { cellKey, parseCell, type MinStockType } from '../../../helpers/minStock'
import { MIN_STOCK_ERROR, parseMinInput, type MinStockSettings } from '../services/useMinStockSettings'
import { card, linkBtn } from './settingsStyles'
import '../../../assets/styles/ext-committee.css' // .ext-row-menu (เมนู ⋯)
import '../../../assets/styles/settings-min-stock.css'

interface Props {
  m: MinStockSettings
  hiddenGroups: string[]
  /** ค่าจาก query ?cell=FFP|A → focus + select ช่องนั้น */
  focusCell: string | null
  onOpenGroups: () => void
}

const WIDE_MIN = 760

const fmtUpdated = (iso: string) => {
  const d = new Date(iso)
  const date = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' })
  const time = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' })
  return `${date} ${time} น.`
}
const showVal = (v: number | null) => (v == null ? 'ไม่ได้ตั้งค่า' : `${v.toLocaleString()} unit`)

export default function SettingsMinStock({ m, hiddenGroups, focusCell, onOpenGroups }: Props) {
  const { types, groups, draft } = m
  const boxRef = useRef<HTMLDivElement>(null)
  const [wide, setWide] = useState(true)
  const [target, setTarget] = useState<string | null>(null)

  // modal: ใช้ค่าเดียวกันทุกหมู่ / คัดลอกจากชนิดอื่น / ยืนยันบันทึก
  const [fillFor, setFillFor] = useState<MinStockType | null>(null)
  const [fillValue, setFillValue] = useState('')
  const [copyFor, setCopyFor] = useState<MinStockType | null>(null)
  const [copyFrom, setCopyFrom] = useState<OptionType | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // วัดความกว้างของ container (ไม่ใช่ window) — Sidebar ย่อ/ขยายก็สลับ layout ได้ถูก
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWide(entry.contentRect.width >= WIDE_MIN))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ?cell=FFP|A → focus + select + focus ring
  const focused = useRef<string | null>(null)
  useEffect(() => {
    const c = parseCell(focusCell)
    if (!c || m.loading || focused.current === focusCell) return
    const key = cellKey(c.type, c.group)
    const el = Array.from(boxRef.current?.querySelectorAll<HTMLInputElement>('input[data-cell]') ?? [])
      .find((x) => x.dataset.cell === key)
    if (!el) return
    focused.current = focusCell
    setTarget(key)
    el.scrollIntoView({ block: 'center' })
    el.focus()
    el.select()
  }, [focusCell, m.loading, wide, types, groups])

  const fillParsed = parseMinInput(fillValue)
  const copyOptions = useMemo<OptionType[]>(() => types
    .filter((t) => t.code !== copyFor?.code)
    .map((t) => ({
      value: t.code,
      label: `${t.code} — ${groups.map((g) => `${g} ${draft[cellKey(t.code, g)]?.trim() || '—'}`).join(' · ')}`,
    })), [types, groups, draft, copyFor])

  const rowMenu = (t: MinStockType) => (
    <ExtRowMenu items={[
      { icon: <Rows3 size={15} />, label: 'ใช้ค่าเดียวกันทุกหมู่…', onClick: () => { setFillValue(''); setFillFor(t) } },
      { icon: <Copy size={15} />, label: 'คัดลอกค่าจากชนิดเลือดอื่น…', onClick: () => { setCopyFrom(null); setCopyFor(t) } },
    ]} />
  )

  const cell = (t: MinStockType, g: string, showGroupLabel: boolean) => {
    const key = cellKey(t.code, g)
    const invalid = m.isInvalid(key)
    const dirty = m.isDirty(key)
    const errId = `ms-err-${key}`
    return (
      <div className="ms-cell">
        <label className={`ms-cell__box${dirty ? ' is-dirty' : ''}${invalid ? ' is-invalid' : ''}${target === key ? ' is-target' : ''}`}>
          {showGroupLabel && <span className="ms-cell__group" aria-hidden="true">{g}</span>}
          <input
            className="ms-cell__input"
            inputMode="numeric"
            autoComplete="off"
            placeholder="—"
            data-cell={key}
            aria-label={`ขั้นต่ำ ${t.code} หมู่ ${g}`}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errId : undefined}
            value={draft[key] ?? ''}
            onChange={(e) => m.setCell(t.code, g, e.target.value)}
            onBlur={() => { if (target === key) setTarget(null) }}
          />
          <span className="ms-cell__suffix" aria-hidden="true">unit</span>
        </label>
        {invalid && <p id={errId} className="ms-cell__error" role="alert">{MIN_STOCK_ERROR}</p>}
      </div>
    )
  }

  const total = (t: MinStockType) => {
    const v = m.rowTotal(t.code)
    return v == null ? '—' : v.toLocaleString()
  }

  const typeLabel = (t: MinStockType) => (
    <>
      <span className="ms-type__code">{t.code}</span>
      {t.name && <span className="ms-type__name">{t.name}</span>}
    </>
  )

  return (
    <div ref={boxRef} style={{ ...card, position: 'relative' }}>
      <div className="ms-head">
        <div style={{ minWidth: 0 }}>
          <h3 className="ms-head__title">สต็อกขั้นต่ำ</h3>
          <p className="ms-head__desc">
            กำหนด unit ขั้นต่ำแยกตามชนิดเลือดและหมู่เลือด — เว้นว่างไว้ถ้าไม่ต้องการแจ้งเตือน
          </p>
          <div className="ms-head__legend" aria-label="ความหมายของสถานะ">
            <MinStatusPill status="danger" size="sm" label="ต่ำกว่าขั้นต่ำ · น้อยกว่าขั้นต่ำที่ตั้งไว้" />
            <MinStatusPill status="warning" size="sm" label="ใกล้ต่ำ · 100–120%" />
            <MinStatusPill status="normal" size="sm" label="ปกติ · มากกว่า 120%" />
          </div>
        </div>
        <p className="ms-head__meta">
          <History size={14} aria-hidden="true" />
          {m.meta.updatedAt
            ? <span>แก้ล่าสุดโดย <strong>{m.meta.updatedBy ?? 'ไม่ทราบผู้ใช้'}</strong> · {fmtUpdated(m.meta.updatedAt)}</span>
            : <span>ยังไม่เคยบันทึก</span>}
        </p>
      </div>

      {m.loading ? (
        <div className="ms-state">กำลังโหลด...</div>
      ) : m.loadError ? (
        <div className="ms-state" role="alert">
          โหลดค่าขั้นต่ำไม่สำเร็จ — <button type="button" style={linkBtn} onClick={m.reload}>ลองใหม่</button>
        </div>
      ) : types.length === 0 || groups.length === 0 ? (
        <div className="ms-state">ยังไม่มีชนิดเลือดหรือหมู่เลือดที่เปิดใช้งาน — เพิ่มได้ที่ ข้อมูลหลัก</div>
      ) : (
        <>
          {m.serverEmpty && (
            <div className="ms-empty" role="note">
              <Gauge size={18} aria-hidden="true" />
              <span>
                <strong>ยังไม่ได้ตั้งค่าขั้นต่ำ</strong> — ระบบจึงยังไม่แจ้งเตือนสต็อกต่ำ เริ่มจากชนิดที่ใช้บ่อยที่สุด
                กรอกทีละช่อง หรือใช้ ⋯ › ใช้ค่าเดียวกันทุกหมู่ แล้วค่อยปรับ
              </span>
            </div>
          )}

          {wide ? (
            <table className="ms-matrix">
              <thead>
                <tr>
                  <th scope="col" className="ms-matrix__type">ชนิดเลือด</th>
                  {groups.map((g) => <th key={g} scope="col">หมู่ {g}</th>)}
                  <th scope="col" className="ms-matrix__total">รวมขั้นต่ำ</th>
                  <th scope="col" className="ms-matrix__menu"><span className="ms-sr">เมนู</span></th>
                </tr>
              </thead>
              <tbody>
                {types.map((t) => (
                  <tr key={t.code}>
                    <th scope="row" className="ms-matrix__type">{typeLabel(t)}</th>
                    {groups.map((g) => <td key={g}>{cell(t, g, false)}</td>)}
                    <td className="ms-matrix__total">{total(t)}</td>
                    <td className="ms-matrix__menu">{rowMenu(t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="ms-cards">
              {types.map((t) => (
                <section key={t.code} className="ms-card" aria-label={`ขั้นต่ำของ ${t.code}`}>
                  <header className="ms-card__head">
                    <div className="ms-card__type">{typeLabel(t)}</div>
                    <span className="ms-card__total">รวม {total(t)}</span>
                    {rowMenu(t)}
                  </header>
                  <div className="ms-card__grid">
                    {groups.map((g) => <div key={g}>{cell(t, g, true)}</div>)}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}

      {hiddenGroups.length > 0 && (
        <p className="ms-hidden-note">
          <EyeOff size={14} aria-hidden="true" />หมู่เลือดที่ปิดใช้งาน ({hiddenGroups.join(', ')}) ไม่แสดงที่นี่และไม่แจ้งเตือน —
          <button type="button" onClick={onOpenGroups} style={linkBtn}>เปิดได้ที่ หมู่เลือด</button>
        </p>
      )}

      {/* แถบบันทึก — แสดงเมื่อมีการแก้ */}
      {m.dirtyCount > 0 && (
        <div className="ms-savebar" role="status">
          <span className="ms-savebar__text">
            แก้ไข {m.dirtyCount} ช่อง ยังไม่บันทึก
            {m.invalidCount > 0 && <span className="ms-savebar__error"> · ค่าไม่ถูกต้อง {m.invalidCount} ช่อง</span>}
          </span>
          <div className="ms-savebar__actions">
            <Button variant="ghost" size="sm" onClick={m.reset} disabled={m.saving}>ยกเลิก</Button>
            <Button size="sm" icon={<Save size={14} />} onClick={() => setConfirmOpen(true)} disabled={m.invalidCount > 0 || m.saving}>
              บันทึก
            </Button>
          </div>
        </div>
      )}

      {/* ใช้ค่าเดียวกันทุกหมู่ */}
      <Modal
        open={!!fillFor}
        onClose={() => setFillFor(null)}
        size="sm"
        title={`ใช้ค่าเดียวกันทุกหมู่ — ${fillFor?.code ?? ''}`}
        footer={<>
          <Button variant="ghost" onClick={() => setFillFor(null)}>ยกเลิก</Button>
          <Button
            disabled={!fillParsed.ok}
            onClick={() => { if (fillFor) m.fillRow(fillFor.code, fillValue); setFillFor(null) }}
          >ใช้กับ {groups.length} หมู่</Button>
        </>}
      >
        <form onSubmit={(e) => { e.preventDefault(); if (fillFor && fillParsed.ok) { m.fillRow(fillFor.code, fillValue); setFillFor(null) } }}>
          <label className="ms-modal__label" htmlFor="ms-fill-input">ขั้นต่ำต่อหมู่ (เว้นว่าง = ไม่ต้องการแจ้งเตือน)</label>
          <div className="ms-cell">
            <span className={`ms-cell__box${fillParsed.ok ? '' : ' is-invalid'}`}>
              <input
                id="ms-fill-input"
                className="ms-cell__input"
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                placeholder="—"
                aria-invalid={!fillParsed.ok || undefined}
                aria-describedby={fillParsed.ok ? undefined : 'ms-fill-err'}
                value={fillValue}
                onChange={(e) => setFillValue(e.target.value)}
              />
              <span className="ms-cell__suffix" aria-hidden="true">unit</span>
            </span>
            {!fillParsed.ok && <p id="ms-fill-err" className="ms-cell__error" role="alert">{MIN_STOCK_ERROR}</p>}
          </div>
          <p className="ms-modal__note">เปลี่ยนเฉพาะค่าในฟอร์ม — ยังไม่บันทึกจนกว่าจะกด "บันทึก"</p>
        </form>
      </Modal>

      {/* คัดลอกค่าจากชนิดเลือดอื่น */}
      <Modal
        open={!!copyFor}
        onClose={() => setCopyFor(null)}
        size="md"
        title={`คัดลอกค่าจากชนิดเลือดอื่น → ${copyFor?.code ?? ''}`}
        footer={<>
          <Button variant="ghost" onClick={() => setCopyFor(null)}>ยกเลิก</Button>
          <Button
            icon={<Copy size={14} />}
            disabled={!copyFrom}
            onClick={() => { if (copyFor && copyFrom) m.copyRow(copyFrom.value, copyFor.code); setCopyFor(null) }}
          >คัดลอก</Button>
        </>}
      >
        <div style={{ minHeight: 220 }}>
          <SelectDropdown
            label="ชนิดเลือดต้นทาง"
            placeholder="เลือกชนิดเลือด..."
            options={copyOptions}
            value={copyFrom}
            onChange={setCopyFrom}
            noOptionsMessage="ไม่มีชนิดเลือดอื่น"
          />
          <p className="ms-modal__note">
            ค่าทุกหมู่ของ {copyFor?.code} จะถูกแทนด้วยค่าของชนิดต้นทาง — เปลี่ยนเฉพาะค่าในฟอร์ม ยังไม่บันทึกจนกว่าจะกด "บันทึก"
          </p>
        </div>
      </Modal>

      {/* ยืนยันก่อนบันทึก */}
      <Modal
        open={confirmOpen}
        onClose={() => { if (!m.saving) setConfirmOpen(false) }}
        size="md"
        title="ยืนยันการเปลี่ยนค่าขั้นต่ำ"
        closeOnOverlay={!m.saving}
        footer={<>
          <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={m.saving}>กลับไปแก้ไข</Button>
          <Button
            icon={<Save size={14} />}
            loading={m.saving}
            disabled={m.saving || m.changes.length === 0}
            onClick={async () => { if (await m.save()) setConfirmOpen(false) }}
          >บันทึก {m.changes.length} รายการ</Button>
        </>}
      >
        <div className="ms-diff__wrap">
          <table className="ms-diff">
            <thead>
              <tr>
                <th scope="col">ชนิด · หมู่</th>
                <th scope="col">ค่าเดิม</th>
                <th scope="col"><span className="ms-sr">เปลี่ยนเป็น</span></th>
                <th scope="col">ค่าใหม่</th>
              </tr>
            </thead>
            <tbody>
              {m.changes.map((c) => (
                <tr key={cellKey(c.type, c.group)}>
                  <th scope="row">{c.type} · หมู่ {c.group}</th>
                  <td className={c.from == null ? 'is-unset' : undefined}>{showVal(c.from)}</td>
                  <td className="ms-diff__arrow"><ArrowRight size={14} aria-hidden="true" /></td>
                  <td className={c.to == null ? 'is-unset' : 'is-new'}>{showVal(c.to)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="ms-modal__note">สถานะบนแดชบอร์ดและการแจ้งเตือนจะคำนวณใหม่ทันทีหลังบันทึก</p>
      </Modal>
    </div>
  )
}
