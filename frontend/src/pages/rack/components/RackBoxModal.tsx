// ============================================================
//  src/pages/rack/components/RackBoxModal.tsx
//  Modal กล่อง: ดู / นำออก / แก้ไขข้อมูล (สแกนผิด) / ย้าย — สลับโหมดใน modal เดียว
// ============================================================

import { useEffect, useMemo, useState } from 'react'
import {
  History, Lock, MapPin, Package, PackageOpen, Pencil, Printer, TriangleAlert, Undo2, X,
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import FormInput from '../../../components/common/FormInput'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import { groupInk, groupSurface } from '../../../helpers/blood'
import {
  BOX_CAPACITY, LEVEL_LIST, POSITION_LIST, cleanUnit, slotLabel,
} from '../../../helpers/rack'
import BagStack from './BagStack'
import rackService from '../services/RackService'
import type { ApiError, PanelMode, RackBox, RackLevel, RemovalReason } from '../services/RackType'

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
const fmtDateTime = (iso: string) => {
  const d = new Date(iso)
  return `${fmtDate(iso)} ${d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`
}

const SCAN_ID = 'rack-box-scan'

interface Props {
  open: boolean
  code: string
  zoneId: string
  box: RackBox | undefined
  levels: RackLevel[]
  rackCodes: string[]
  reasons: RemovalReason[]
  mode: PanelMode
  lockedBy: string | null
  highlight: string | null
  /** ปิด Esc ระหว่างที่ dialog ยืนยันทิ้งข้อมูลเปิดอยู่ */
  escEnabled: boolean
  onClose: () => void
  onMode: (m: PanelMode) => void
  onDirty: (dirty: boolean) => void
  onPrint: (box: RackBox) => void
  onDone: (msg: string, jump?: { code: string; level: number; position: number }) => void
  onError: (msg: string, conflict: boolean) => void
}

export default function RackBoxModal(props: Props) {
  const { open, box, mode, escEnabled, onClose } = props
  if (!box) return null

  const sub =
    mode === 'edit' ? 'แก้ไขข้อมูล'
    : mode === 'withdraw' ? 'นำออก'
    : mode === 'move' ? 'ย้ายตำแหน่ง'
    : `${props.code}-${box.level} · ช่อง ${box.position}`
  const icon =
    mode === 'edit' ? <Pencil size={18} color="var(--primary)" />
    : mode === 'withdraw' ? <PackageOpen size={18} color="var(--danger)" />
    : mode === 'move' ? <MapPin size={18} color="var(--primary)" />
    : <Package size={18} color="var(--primary)" />

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      closeOnOverlay={mode === 'view'}
      closeOnEsc={escEnabled}
      titleIcon={icon}
      title={
        <span className="rack-bm-title">
          <span className="rack-bm-title__label">{box.boxLabel}</span>
          <span className="rack-bm-title__sub">{sub}</span>
        </span>
      }
    >
      <RackBoxBody {...props} box={box} />
    </Modal>
  )
}

/* ============================================================ */

function RackBoxBody({
  code, zoneId, box, levels, rackCodes, reasons, mode, lockedBy, highlight,
  onMode, onDirty, onPrint, onDone, onError,
}: Props & { box: RackBox }) {
  const ink = groupInk(box.blood)
  const surface = groupSurface(box.blood)
  const locked = !!lockedBy
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  // ── withdraw ──
  const [picked, setPicked] = useState<string[]>([])
  const [confirmW, setConfirmW] = useState(false)

  // ── edit ──
  const [units, setUnits] = useState<string[]>(box.units)
  const [scan, setScan] = useState('')
  const [removed, setRemoved] = useState<Record<string, { reasonId: string; reasonName: string; detail: string }>>({})
  const [pending, setPending] = useState<string | null>(null)
  const [reason, setReason] = useState<OptionType | null>(null)
  const [detail, setDetail] = useState('')

  // ── move ──
  const [mvCode, setMvCode] = useState(code)
  const [mvLevel, setMvLevel] = useState(box.level)
  const [mvPos, setMvPos] = useState<number | null>(null)
  const [mvConfirm, setMvConfirm] = useState(false)
  const [targetLevels, setTargetLevels] = useState<RackLevel[] | null>(levels)

  // reset ทุกครั้งที่เปลี่ยนกล่อง/โหมด
  useEffect(() => {
    setErr('')
    setPicked([]); setConfirmW(false)
    setUnits(box.units); setScan(''); setRemoved({}); setPending(null); setReason(null); setDetail('')
    setMvCode(code); setMvLevel(box.level); setMvPos(null); setMvConfirm(false)
  }, [box, mode, code])

  const editChanged = units.join('|') !== box.units.join('|')

  useEffect(() => {
    onDirty(
      mode === 'withdraw' ? picked.length > 0
      : mode === 'edit' ? editChanged || !!pending
      : mode === 'move' ? mvPos !== null
      : false,
    )
  }, [mode, picked, editChanged, pending, mvPos, onDirty])

  // rack ปลายทางสำหรับโหมดย้าย
  useEffect(() => {
    if (mode !== 'move') return
    if (mvCode === code) { setTargetLevels(levels); return }
    let alive = true
    setTargetLevels(null)
    rackService.getRack(zoneId, mvCode)
      .then((r) => { if (alive) setTargetLevels(r.levels) })
      .catch(() => { if (alive) setTargetLevels([]) })
    return () => { alive = false }
  }, [mode, mvCode, code, zoneId, levels])

  const freeIn = (lv: number) => {
    const l = targetLevels?.find((x) => x.level === lv)
    return POSITION_LIST.filter((p) => !l?.slots[p])
  }

  const fail = (e: unknown) => {
    const ae = e as ApiError
    const msg = ae?.message || 'เกิดข้อผิดพลาด'
    setErr(msg)
    onError(msg, ae?.statusCode === 409)
  }

  // ───────────────── actions ─────────────────
  const doWithdraw = async () => {
    setBusy(true)
    try {
      const res = await rackService.withdrawUnits(box.id, picked)
      onDone(
        res.allWithdrawn
          ? `นำออกทั้งกล่อง ${box.boxLabel} (${picked.length} ถุง) แล้ว`
          : `นำออก ${picked.length} ถุงจาก ${box.boxLabel} แล้ว`,
      )
    } catch (e) { fail(e) } finally { setBusy(false) }
  }

  const addUnit = async () => {
    const u = cleanUnit(scan)
    if (!u || pending) return
    setErr('')
    if (units.length >= BOX_CAPACITY) { setErr(`กล่องเต็มแล้ว (สูงสุด ${BOX_CAPACITY} ถุง)`); return }
    if (units.includes(u)) { setErr(`Unit ${u} อยู่ในกล่องนี้แล้ว`); setScan(''); return }
    if (removed[u]) {
      const next = { ...removed }; delete next[u]
      setRemoved(next); setUnits([...units, u]); setScan('')
      return
    }
    try {
      const chk = await rackService.checkUnit(u)
      if (chk.exists) {
        setErr(chk.status === 'withdrawn' ? `Unit ${u} ถูกนำออกไปแล้ว` : `Unit ${u} อยู่ในกล่อง ${chk.boxLabel}`)
        setScan('')
        return
      }
    } catch { /* ตรวจไม่ได้ → ให้ backend ตรวจซ้ำตอนบันทึก */ }
    setUnits([...units, u]); setScan('')
  }

  const askRemove = (u: string) => {
    if (pending) return
    setErr('')
    if (box.units.includes(u)) { setPending(u); setReason(null); setDetail('') }
    else setUnits(units.filter((x) => x !== u))
  }

  const confirmRemove = () => {
    if (!pending) return
    if (!reason) { setErr('กรุณาเลือกหมายเหตุการลบ'); return }
    setUnits(units.filter((x) => x !== pending))
    setRemoved({ ...removed, [pending]: { reasonId: reason.value, reasonName: reason.label, detail: detail.trim() } })
    setPending(null)
    setErr('')
    setTimeout(() => document.getElementById(SCAN_ID)?.focus(), 50)
  }

  const restore = (u: string) => {
    if (units.length >= BOX_CAPACITY) { setErr(`กล่องเต็มแล้ว (สูงสุด ${BOX_CAPACITY} ถุง)`); return }
    const next = { ...removed }; delete next[u]
    setRemoved(next); setUnits([...units, u])
  }

  const saveUnits = async () => {
    if (pending) { setErr('ยืนยันหรือยกเลิกการลบถุงที่ค้างอยู่ก่อน'); return }
    if (!units.length) { setErr('กล่องต้องมีอย่างน้อย 1 ถุง'); return }
    setBusy(true)
    try {
      await rackService.updateUnits(
        box.id,
        units,
        Object.entries(removed).map(([unitNumber, r]) => ({ unitNumber, reasonId: r.reasonId, detail: r.detail || undefined })),
      )
      const nRem = Object.keys(removed).length
      onDone(`บันทึก units ของ ${box.boxLabel} แล้ว · ${units.length} ถุง${nRem ? ` (ลบ ${nRem})` : ''}`)
    } catch (e) { fail(e) } finally { setBusy(false) }
  }

  const saveMove = async () => {
    if (!mvPos || !mvConfirm) return
    setBusy(true)
    try {
      await rackService.moveBox(box.id, { zoneId, shelf: mvCode, level: mvLevel, position: mvPos })
      onDone(`ย้าย ${box.boxLabel} ไป ${mvCode}-${mvLevel} ช่อง ${mvPos} แล้ว`, {
        code: mvCode, level: mvLevel, position: mvPos,
      })
    } catch (e) { fail(e) } finally { setBusy(false) }
  }

  // ───────────────── options ─────────────────
  const reasonOpts = useMemo<OptionType[]>(() => reasons.map((r) => ({ value: r.id, label: r.name })), [reasons])
  const rackOpts = rackCodes.map((c) => ({ value: c, label: `Rack ${c}` }))
  const levelOpts = LEVEL_LIST.map((l) => ({ value: String(l), label: `ชั้น ${l} · ว่าง ${freeIn(l).length}` }))
  const posOpts = freeIn(mvLevel).map((p) => ({ value: String(p), label: slotLabel(p) }))

  // ════════════════════ edit (layout แบบ modal เพิ่มกล่อง) ════════════════════
  if (mode === 'edit') {
    const added = units.filter((u) => !box.units.includes(u)).length
    const nRemoved = Object.keys(removed).length
    const rows = Array.from({ length: BOX_CAPACITY }, (_, i) => BOX_CAPACITY - i)

    return (
      <div className="rack-add">
        <div className="rack-add__fields">
          <div className="rack-add__lockbar">
            <span className="rack-badge" style={{ width: 24, height: 24, fontSize: 11, background: surface, color: ink }}>{box.blood}</span>
            <span style={{ whiteSpace: 'nowrap' }}>{box.type} · เก็บ {fmtDate(box.collectionDate)}</span>
            <strong>{box.boxLabel}</strong>
          </div>

          <div className="rack-banner rack-banner--warning" style={{ margin: 0 }}>
            <TriangleAlert size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>ใช้แก้กรณีสแกนผิด/บันทึกผิดเท่านั้น — การเบิกใช้ถุงให้กด "นำออก"</span>
          </div>

          <div>
            <label htmlFor={SCAN_ID} className="rack-field-label">เพิ่มถุง · {units.length}/{BOX_CAPACITY}</label>
            <div className="rack-scan">
              <FormInput
                id={SCAN_ID}
                autoFocus
                size="sm"
                mono
                autoComplete="off"
                disabled={units.length >= BOX_CAPACITY || !!pending}
                placeholder={
                  pending ? 'ยืนยันการลบก่อน'
                  : units.length >= BOX_CAPACITY ? 'กล่องเต็ม'
                  : `สแกนถุงที่ ${units.length + 1}`
                }
                value={scan}
                onChange={(v) => { setScan(v.toUpperCase()); setErr('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void addUnit() } }}
              />
              <Button size="sm" variant="outline" disabled={units.length >= BOX_CAPACITY || !!pending} onClick={() => void addUnit()}>
                เพิ่ม
              </Button>
            </div>
            {err && <p role="alert" className="rack-field-error">{err}</p>}
          </div>

          {pending && (
            <div className="rack-confirm" role="group" aria-label={`ลบ ${pending} ออกจากกล่อง`}>
              <p>ลบ <span style={{ fontFamily: 'var(--font-mono)' }}>{pending}</span> ออกจากกล่อง</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <SelectDropdown
                  label="หมายเหตุ (บังคับเลือก)"
                  placeholder="— เลือกหมายเหตุการลบ —"
                  options={reasonOpts}
                  value={reason}
                  onChange={(o) => { setReason(o); setErr('') }}
                  isClearable={false}
                />
                <FormInput aria-label="รายละเอียดเพิ่มเติม" size="sm" placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" value={detail} onChange={setDetail} maxLength={300} />
                <div className="rack-mode__foot">
                  <Button size="sm" variant="secondary" onClick={() => setPending(null)}>ไม่ลบ</Button>
                  <Button size="sm" variant="danger" disabled={!reason} style={{ flex: 1 }} onClick={confirmRemove}>ยืนยันลบ</Button>
                </div>
              </div>
            </div>
          )}

          {nRemoved > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger-ink)', marginBottom: 4 }}>
                จะลบเมื่อกดบันทึก ({nRemoved})
              </div>
              {Object.entries(removed).map(([u, r]) => (
                <div key={u} className="rack-removed">
                  <span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{u}</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: 6 }}>{r.reasonName}{r.detail ? ` — ${r.detail}` : ''}</span>
                  </span>
                  <button type="button" className="rack-link" onClick={() => restore(u)} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                    <Undo2 size={11} /> คืน
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="bag-stack__ends" aria-hidden="true"><span>หลัง</span><span>ถุงที่</span></div>
          <ol className="bag-stack" aria-label="ถุงในกล่อง จากหลังลงมาหน้า">
            {rows.map((n) => {
              const u = units[n - 1]
              const next = !u && n === units.length + 1
              const isPending = !!u && u === pending
              const cls = ['bag', u && 'bag--filled', next && 'bag--next', isPending && 'bag--pending'].filter(Boolean).join(' ')
              return (
                <li key={n} className={cls} style={u && !isPending ? { background: surface } : undefined}>
                  <span className="bag__no">{n}</span>
                  {u ? (
                    <span className="bag__unit" style={{ color: isPending ? 'var(--danger-ink)' : ink }}>
                      {u}
                      {!box.units.includes(u) && <span className="bag__new">ใหม่</span>}
                    </span>
                  ) : (
                    <span className="bag__empty">{next ? 'สแกนถัดไป' : 'ว่าง'}</span>
                  )}
                  {u && (
                    <button
                      type="button"
                      className="bag__x"
                      aria-label={`ลบ ${u}`}
                      disabled={!!pending}
                      onClick={() => askRemove(u)}
                    >
                      <X size={13} />
                    </button>
                  )}
                </li>
              )
            })}
          </ol>
          <div className="bag-stack__foot">หน้า (เปิดฝา)</div>
        </div>

        <div className="rack-add__foot">
          <span className="rack-add__hint" role="status">
            {added || nRemoved
              ? `เปลี่ยนแปลง: เพิ่ม ${added} · ลบ ${nRemoved} ถุง`
              : editChanged ? 'เปลี่ยนลำดับถุง' : 'ยังไม่มีการเปลี่ยนแปลง'}
          </span>
          <Button variant="secondary" onClick={() => onMode('view')}>ยกเลิก</Button>
          <Button loading={busy} disabled={!editChanged || !!pending} style={{ flex: 1 }} onClick={saveUnits}>
            บันทึก
          </Button>
        </div>
      </div>
    )
  }

  // ════════════════════ view / withdraw / move ════════════════════
  const header = (
    <>
      {lockedBy && (
        <div className="rack-banner rack-banner--warning" role="status" style={{ marginBottom: 0 }}>
          <Lock size={14} style={{ marginTop: 1, flexShrink: 0 }} />
          <span><strong>{lockedBy}</strong> กำลังแก้ไขช่องนี้อยู่ — ดูได้อย่างเดียว</span>
        </div>
      )}
      <div className="rack-panel__head" style={{ marginBottom: 0 }}>
        <span className="rack-badge" style={{ width: 40, height: 40, fontSize: 15, background: surface, color: ink }}>{box.blood}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>{box.type} · หมู่ {box.blood}</div>
          <div className="rack-panel__meta" style={{ whiteSpace: 'nowrap' }}>เก็บ {fmtDate(box.collectionDate)}</div>
        </div>
      </div>
      <div className="rack-chips" style={{ marginBottom: 0 }}>
        <span className="rack-chip rack-chip--pos">{code}-{box.level} · {slotLabel(box.position)}</span>
        <span className="rack-chip rack-chip--count">{box.units.length}/{BOX_CAPACITY} ถุง</span>
      </div>
      {box.lastAction && (
        <p className="rack-last" style={{ margin: 0 }}>
          <History size={12} />
          ล่าสุด: {box.lastAction.userName ?? '-'} · {fmtDateTime(box.lastAction.timestamp)}
        </p>
      )}
    </>
  )

  return (
    <div className="rack-add">
      <div className="rack-add__fields">
        {header}

        {/* ── view ── */}
        {mode === 'view' && (
          <div className="rack-actions rack-actions--lg" role="toolbar" aria-label="จัดการกล่อง">
            <Button variant="outline-danger" disabled={locked} icon={<PackageOpen size={15} />} onClick={() => onMode('withdraw')}>นำออก</Button>
            <Button variant="secondary" disabled={locked} icon={<Pencil size={15} />} onClick={() => onMode('edit')}>แก้ไขข้อมูล</Button>
            <Button variant="secondary" disabled={locked} icon={<MapPin size={15} />} onClick={() => onMode('move')}>ย้าย</Button>
            <Button variant="secondary" icon={<Printer size={15} />} onClick={() => onPrint(box)}>พิมพ์</Button>
          </div>
        )}

        {/* ── withdraw ── */}
        {mode === 'withdraw' && (
          <div className="rack-mode">
            <div className="rack-mode__head">
              <span className="rack-mode__title">นำออก</span>
              <span style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="rack-link" onClick={() => { setPicked(box.units); setConfirmW(false) }}>เลือกทั้งกล่อง</button>
                <button type="button" className="rack-link" disabled={!picked.length} onClick={() => { setPicked([]); setConfirmW(false) }}>ยกเลิกทั้งหมด</button>
              </span>
            </div>
            <p className="rack-hint" style={{ margin: 0 }}>เลือกถุงที่จะนำออกจากรายการด้านขวา</p>
            {err && <p role="alert" className="rack-field-error">{err}</p>}
            {!confirmW ? (
              <div className="rack-mode__foot">
                <Button variant="secondary" onClick={() => onMode('view')}>ยกเลิก</Button>
                <Button variant="danger" disabled={!picked.length} style={{ flex: 1 }} icon={<PackageOpen size={15} />} onClick={() => setConfirmW(true)}>
                  นำออก {picked.length} ถุง
                </Button>
              </div>
            ) : (
              <div className="rack-confirm" role="alertdialog" aria-label="ยืนยันนำออก">
                <p>นำออก {picked.length} ถุง{picked.length === box.units.length ? ' (ทั้งกล่อง — ช่องจะว่าง)' : ''}?</p>
                <div className="rack-mode__foot">
                  <Button size="sm" variant="secondary" onClick={() => setConfirmW(false)}>กลับ</Button>
                  <Button size="sm" variant="danger" loading={busy} style={{ flex: 1 }} onClick={doWithdraw}>ยืนยันนำออก</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── move ── */}
        {mode === 'move' && (
          <div className="rack-mode">
            <SelectDropdown
              label="Rack"
              options={rackOpts}
              value={rackOpts.find((o) => o.value === mvCode) ?? null}
              onChange={(o) => { if (o) { setMvCode(o.value); setMvLevel(1); setMvPos(null) } }}
              isClearable={false}
            />
            <SelectDropdown
              label="ชั้น"
              options={levelOpts}
              value={levelOpts.find((o) => o.value === String(mvLevel)) ?? null}
              onChange={(o) => { if (o) { setMvLevel(Number(o.value)); setMvPos(null) } }}
              isClearable={false}
              isLoading={!targetLevels}
            />
            <SelectDropdown
              label="ช่อง (เฉพาะช่องว่าง)"
              placeholder={targetLevels ? 'เลือกช่องปลายทาง...' : 'กำลังโหลด...'}
              options={posOpts}
              value={mvPos ? { value: String(mvPos), label: slotLabel(mvPos) } : null}
              onChange={(o) => setMvPos(o ? Number(o.value) : null)}
              noOptionsMessage="ชั้นนี้ไม่มีช่องว่าง"
              disabled={!targetLevels}
            />
            <label className="rack-check">
              <input type="checkbox" checked={mvConfirm} onChange={(e) => setMvConfirm(e.target.checked)} />
              ย้ายกล่องในห้องเย็นแล้ว และวางตรงช่องปลายทางจริง
            </label>
            <p className="rack-move-summary">
              {code}-{box.level} ช่อง {box.position} →{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {mvPos ? `${mvCode}-${mvLevel} ช่อง ${mvPos}` : 'ยังไม่ได้เลือก'}
              </strong>
            </p>
            {err && <p role="alert" className="rack-field-error">{err}</p>}
            <div className="rack-mode__foot">
              <Button variant="secondary" onClick={() => onMode('view')}>ยกเลิก</Button>
              <Button loading={busy} disabled={!mvPos || !mvConfirm} style={{ flex: 1 }} onClick={saveMove}>บันทึกตำแหน่ง</Button>
            </div>
          </div>
        )}
      </div>

      {/* ── คอลัมน์ขวา ── */}
      <div>
        {mode === 'withdraw' ? (
          <>
            <div className="bag-stack__ends" aria-hidden="true"><span>หลัง</span><span>ถุงที่</span></div>
            <ol className="bag-stack rack-withdraw-list" aria-label="เลือกถุงที่จะนำออก จากหลังลงมาหน้า">
              {box.units.map((u, i) => ({ u, n: i + 1 })).reverse().map(({ u, n }) => {
                const on = picked.includes(u)
                return (
                  <li key={u} className={`bag bag--filled${on ? ' bag--picked' : ''}`} style={{ background: surface }}>
                    <label className="bag-check">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => {
                          setConfirmW(false)
                          setPicked(on ? picked.filter((x) => x !== u) : [...picked, u])
                        }}
                      />
                      <span className="bag__no">{n}</span>
                      <span className="bag__unit" style={{ color: ink }}>{u}</span>
                    </label>
                  </li>
                )
              })}
            </ol>
            <div className="bag-stack__foot">หน้า (เปิดฝา)</div>
          </>
        ) : (
          <BagStack blood={box.blood} units={box.units} highlight={mode === 'view' ? highlight : null} />
        )}
      </div>
    </div>
  )
}
