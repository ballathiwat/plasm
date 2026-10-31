// ============================================================
//  src/pages/rack/components/RackBoxPanel.tsx
//  แผงกล่อง: ดู / นำออก / แก้ไขข้อมูล (สแกนผิด) / ย้าย
// ============================================================

import { useEffect, useMemo, useState } from 'react'
import {
  History, Lock, MapPin, Package, PackageOpen, Pencil, Plus, Printer, TriangleAlert, Undo2, X,
} from 'lucide-react'
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

interface Props {
  code: string
  zoneId: string
  box: RackBox
  levels: RackLevel[]
  rackCodes: string[]
  reasons: RemovalReason[]
  mode: PanelMode
  lockedBy: string | null
  highlight: string | null
  onMode: (m: PanelMode) => void
  onDirty: (dirty: boolean) => void
  onPrint: (box: RackBox) => void
  onDone: (msg: string, jump?: { code: string; level: number; position: number }) => void
  onError: (msg: string, conflict: boolean) => void
}

export default function RackBoxPanel({
  code, zoneId, box, levels, rackCodes, reasons, mode, lockedBy, highlight,
  onMode, onDirty, onPrint, onDone, onError,
}: Props) {
  const ink = groupInk(box.blood)
  const surface = groupSurface(box.blood)
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

  // dirty
  useEffect(() => {
    const dirty =
      mode === 'withdraw' ? picked.length > 0
      : mode === 'edit' ? units.join('|') !== box.units.join('|') || !!pending
      : mode === 'move' ? mvPos !== null || mvConfirm
      : false
    onDirty(dirty)
  }, [mode, picked, units, pending, mvPos, mvConfirm, box.units, onDirty])

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
    if (!u) return
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
  }

  const restore = (u: string) => {
    if (units.length >= BOX_CAPACITY) { setErr(`กล่องเต็มแล้ว (สูงสุด ${BOX_CAPACITY} ถุง)`); return }
    const next = { ...removed }; delete next[u]
    setRemoved(next); setUnits([...units, u])
  }

  const saveUnits = async () => {
    if (pending) { setErr('ยืนยันหรือยกเลิกการลบ unit ที่ค้างอยู่ก่อน'); return }
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
  const locked = !!lockedBy
  const shownCount = mode === 'edit' ? units.length : box.units.length

  return (
    <div className="rack-panel" key={box.id}>
      {lockedBy && (
        <div className="rack-banner rack-banner--warning" role="status">
          <Lock size={14} style={{ marginTop: 1, flexShrink: 0 }} />
          <span><strong>{lockedBy}</strong> กำลังแก้ไขช่องนี้อยู่ — ดูได้อย่างเดียว แก้ไขได้เมื่ออีกฝ่ายบันทึกหรือออกจากหน้านี้</span>
        </div>
      )}

      <div className="rack-panel__head">
        <span className="rack-badge" style={{ width: 40, height: 40, fontSize: 15, background: surface, color: ink }}>{box.blood}</span>
        <div style={{ minWidth: 0 }}>
          <div className="rack-panel__label">{box.boxLabel}</div>
          <div className="rack-panel__meta">{box.type} · เก็บ {fmtDate(box.collectionDate)}</div>
        </div>
      </div>

      <div className="rack-chips">
        <span className="rack-chip rack-chip--pos">{code}-{box.level} · {slotLabel(box.position)}</span>
        <span className="rack-chip rack-chip--count">{shownCount}/{BOX_CAPACITY} ถุง</span>
      </div>

      {box.lastAction && (
        <p className="rack-last">
          <History size={12} />
          ล่าสุด: {box.lastAction.userName ?? '-'} · {fmtDateTime(box.lastAction.timestamp)}
        </p>
      )}

      {/* ───────── view ───────── */}
      {mode === 'view' && (
        <>
          <div className="rack-actions" role="toolbar" aria-label="จัดการกล่อง">
            <Button size="sm" variant="outline-danger" disabled={locked} icon={<PackageOpen size={13} />} onClick={() => onMode('withdraw')}>นำออก</Button>
            <Button size="sm" variant="secondary" disabled={locked} icon={<Pencil size={13} />} onClick={() => onMode('edit')}>แก้ไขข้อมูล</Button>
            <Button size="sm" variant="secondary" disabled={locked} icon={<MapPin size={13} />} onClick={() => onMode('move')}>ย้าย</Button>
            <Button size="sm" variant="secondary" icon={<Printer size={13} />} onClick={() => onPrint(box)}>พิมพ์</Button>
          </div>
          <BagStack blood={box.blood} units={box.units} highlight={highlight} />
          <p className="rack-hint">สแกนถุงที่ 1–{BOX_CAPACITY} จากหน้าไปหลัง · กล่องละ 8–{BOX_CAPACITY} ถุง</p>
        </>
      )}

      {/* ───────── withdraw ───────── */}
      {mode === 'withdraw' && (
        <div className="rack-mode">
          <div className="rack-mode__head">
            <span className="rack-mode__title">นำออก</span>
            <span style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="rack-link" onClick={() => { setPicked(box.units); setConfirmW(false) }}>เลือกทั้งกล่อง</button>
              <button type="button" className="rack-link" disabled={!picked.length} onClick={() => { setPicked([]); setConfirmW(false) }}>ยกเลิกทั้งหมด</button>
            </span>
          </div>
          <ol className="bag-stack" aria-label="เลือกถุงที่จะนำออก จากหลังลงมาหน้า">
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
          {err && <p role="alert" className="rack-field-error">{err}</p>}
          {!confirmW ? (
            <div className="rack-mode__foot">
              <Button size="sm" variant="secondary" onClick={() => onMode('view')}>ยกเลิก</Button>
              <Button size="sm" variant="danger" disabled={!picked.length} style={{ flex: 1 }} icon={<PackageOpen size={13} />} onClick={() => setConfirmW(true)}>
                นำออก {picked.length} ถุง
              </Button>
            </div>
          ) : (
            <div className="rack-confirm" role="alertdialog" aria-label="ยืนยันนำออก">
              <p>
                นำออก {picked.length} ถุง{picked.length === box.units.length ? ' (ทั้งกล่อง — ช่องจะว่าง)' : ''}?
              </p>
              <div className="rack-mode__foot">
                <Button size="sm" variant="secondary" onClick={() => setConfirmW(false)}>กลับ</Button>
                <Button size="sm" variant="danger" loading={busy} style={{ flex: 1 }} onClick={doWithdraw}>ยืนยันนำออก</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────── edit ───────── */}
      {mode === 'edit' && (
        <div className="rack-mode">
          <div className="rack-mode__head">
            <span className="rack-mode__title">แก้ไขข้อมูล (สแกนผิด)</span>
            <span className="rack-mode__aside">เรียง หลัง → หน้า</span>
          </div>
          <div className="rack-scan">
            <FormInput
              aria-label="สแกนเพิ่ม unit"
              autoFocus
              size="sm"
              mono
              disabled={units.length >= BOX_CAPACITY}
              placeholder={units.length >= BOX_CAPACITY ? 'กล่องเต็ม' : `สแกนถุงที่ ${units.length + 1}`}
              value={scan}
              onChange={(v) => { setScan(v.toUpperCase()); setErr('') }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void addUnit() } }}
            />
            <Button size="sm" variant="outline" icon={<Plus size={13} />} disabled={units.length >= BOX_CAPACITY} onClick={() => void addUnit()}>เพิ่ม</Button>
          </div>
          {err && <p role="alert" className="rack-field-error" style={{ marginTop: -4 }}>{err}</p>}
          <div className="rack-banner rack-banner--warning" style={{ margin: 0, fontSize: 11 }}>
            <TriangleAlert size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>ใช้แก้กรณีสแกนผิด/บันทึกผิดเท่านั้น — การเบิกใช้ถุงให้กด "นำออก"</span>
          </div>
          <ol className="bag-stack" aria-label="ถุงในกล่อง จากหลังลงมาหน้า" style={{ maxHeight: 320, overflowY: 'auto' }}>
            {units.map((u, i) => ({ u, n: i + 1 })).reverse().map(({ u, n }) => (
              <li
                key={u}
                className={`bag bag--filled${pending === u ? ' bag--picked' : ''}`}
                style={{ background: surface, flexWrap: 'wrap' }}
              >
                <span className="bag__no">{n}</span>
                <span className="bag__unit" style={{ color: ink }}>
                  {u}
                  {!box.units.includes(u) && <span className="bag__new">ใหม่</span>}
                </span>
                {pending !== u && (
                  <button type="button" className="bag__x" aria-label={`ลบ ${u}`} onClick={() => askRemove(u)}>
                    <X size={13} />
                  </button>
                )}
                {pending === u && (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                    <SelectDropdown
                      placeholder="— เลือกหมายเหตุการลบ —"
                      options={reasonOpts}
                      value={reason}
                      onChange={setReason}
                      isClearable={false}
                    />
                    <FormInput aria-label="รายละเอียดเพิ่มเติม" size="sm" placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" value={detail} onChange={setDetail} maxLength={300} />
                    <div className="rack-mode__foot">
                      <Button size="sm" variant="danger" disabled={!reason} style={{ flex: 1 }} onClick={confirmRemove}>ยืนยันลบ</Button>
                      <Button size="sm" variant="secondary" onClick={() => setPending(null)}>ยกเลิก</Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
          {Object.keys(removed).length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger-ink)', marginBottom: 4 }}>
                จะลบเมื่อกดบันทึก ({Object.keys(removed).length})
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
          <div className="rack-mode__foot">
            <Button size="sm" variant="secondary" onClick={() => onMode('view')}>ยกเลิก</Button>
            <Button
              size="sm"
              loading={busy}
              style={{ flex: 1 }}
              disabled={units.join('|') === box.units.join('|') || !!pending}
              onClick={saveUnits}
            >
              บันทึก
            </Button>
          </div>
        </div>
      )}

      {/* ───────── move ───────── */}
      {mode === 'move' && (
        <div className="rack-mode">
          <span className="rack-mode__title">ย้ายกล่อง</span>
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
          {mvPos && (
            <p className="rack-move-summary">
              {code}-{box.level} ช่อง {box.position} → <strong style={{ color: 'var(--text-primary)' }}>{mvCode}-{mvLevel} ช่อง {mvPos}</strong>
            </p>
          )}
          {err && <p role="alert" className="rack-field-error">{err}</p>}
          <div className="rack-mode__foot">
            <Button size="sm" variant="secondary" onClick={() => onMode('view')}>ยกเลิก</Button>
            <Button size="sm" loading={busy} disabled={!mvPos || !mvConfirm} style={{ flex: 1 }} onClick={saveMove}>บันทึกตำแหน่ง</Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------- */
interface EmptyProps {
  position: number | null
  lockedBy: string | null
  onAdd: () => void
}

export function RackEmptyPanel({ position, lockedBy, onAdd }: EmptyProps) {
  return (
    <div className="rack-panel">
      {lockedBy && (
        <div className="rack-banner rack-banner--warning" role="status">
          <Lock size={14} style={{ marginTop: 1, flexShrink: 0 }} />
          <span><strong>{lockedBy}</strong> กำลังแก้ไขช่องนี้อยู่ — ดูได้อย่างเดียว</span>
        </div>
      )}
      <div className="rack-empty">
        <Package size={36} style={{ opacity: 0.25, marginBottom: 8 }} />
        <p>{position ? `ช่อง ${position} ว่าง` : 'เลือกช่องเพื่อดูถุงในกล่อง'}</p>
        <small>{position ? slotLabel(position) : 'คลิกช่องว่าง (เส้นประ) เพื่อเพิ่มกล่องใหม่'}</small>
        {position && (
          <div style={{ marginTop: 14 }}>
            <Button size="sm" disabled={!!lockedBy} icon={<Plus size={14} />} onClick={onAdd}>
              เพิ่มกล่องที่ช่องนี้
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
