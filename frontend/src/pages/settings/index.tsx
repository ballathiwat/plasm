// ============================================================
//  src/pages/settings/index.tsx
//  ตั้งค่า — /settings/:group?tab=<key>
//  group: system | master | forms  (ตรงกับเมนูย่อยใน Sidebar)
//  URL เป็นแหล่งความจริงเดียว → Sidebar, เมนูในหน้า และปุ่มย้อนกลับของเบราว์เซอร์ตรงกันเสมอ
// ============================================================
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Gauge, Users, Droplet, TestTube, Warehouse, Eraser, Building2, Archive, LogOut,
  Cloud, Hand, type LucideIcon,
} from 'lucide-react'
import Toast from '../../components/common/Toast'
import { ConfirmModal } from '../../components/common/Modal'
import SelectDropdown, { type OptionType } from '../../components/common/SelectDropdown'
import { useAuth } from '../../Routes/AuthProtected'
import useSettings from './services/useSettings'
import useMasterData from './services/useMasterData'
import useExtSettings from '../ExtBloodSettings/services/useExtSettings'
import SettingsMinStock from './components/SettingsMinStock'
import SettingsUsers from './components/SettingsUsers'
import SettingsCodeList from './components/SettingsCodeList'
import SettingsZones from './components/SettingsZones'
import SettingsOptionList, { type OptionItem } from './components/SettingsOptionList'
import type { MinimumStock } from './services/SettingsType'

type TabKey = 'stock' | 'users' | 'plasma' | 'blood' | 'zones' | 'removal' | 'extSources' | 'extStorages' | 'extReasons'
interface NavGroup { key: 'system' | 'master' | 'forms'; label: string; note?: string; items: { k: TabKey; label: string; icon: LucideIcon }[] }

const NAV: NavGroup[] = [
  { key: 'system', label: 'ระบบ', items: [
    { k: 'stock', label: 'ค่าขั้นต่ำสต็อก', icon: Gauge },
    { k: 'users', label: 'ผู้ใช้', icon: Users },
  ] },
  { key: 'master', label: 'ข้อมูลหลัก', note: 'ใช้ร่วมกันทั้งพลาสมาและเลือดภายนอก', items: [
    { k: 'plasma', label: 'ชนิดเลือด', icon: Droplet },
    { k: 'blood', label: 'หมู่เลือด', icon: TestTube },
    { k: 'zones', label: 'สถานที่จัดเก็บ', icon: Warehouse },
  ] },
  { key: 'forms', label: 'ตัวเลือกในฟอร์ม', items: [
    { k: 'removal', label: 'หมายเหตุการลบ unit', icon: Eraser },
    { k: 'extSources', label: 'สถานที่ส่งเลือด', icon: Building2 },
    { k: 'extStorages', label: 'ตำแหน่งจัดเก็บเลือดภายนอก', icon: Archive },
    { k: 'extReasons', label: 'เหตุผลการนำออก', icon: LogOut },
  ] },
]
const FLAT = NAV.flatMap((g) => g.items.map((it) => ({ ...it, group: g })))
const groupOf = (k: string) => FLAT.find((x) => x.k === k)?.group

const sameStock = (a: MinimumStock, b: MinimumStock) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  return [...keys].every((k) => (a[k] ?? null) === (b[k] ?? null))
}

function useWide(min = 1024) {
  const q = `(min-width: ${min}px)`
  const [wide, setWide] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const f = () => setWide(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [q])
  return wide
}

export default function SettingsPage() {
  const { group } = useParams()
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const wide = useWide()
  const { user } = useAuth()

  const g = NAV.find((x) => x.key === group)
  const tabParam = sp.get('tab') as TabKey | null
  const tab: TabKey = g && tabParam && g.items.some((i) => i.k === tabParam) ? tabParam : (g ?? NAV[0]).items[0].k
  const cur = FLAT.find((x) => x.k === tab)!

  useEffect(() => { if (!g) navigate('/settings/system?tab=stock', { replace: true }) }, [g, navigate])

  const go = (k: TabKey) => navigate(`/settings/${groupOf(k)!.key}?tab=${k}`)

  const s = useSettings()
  const master = useMasterData(s.notify)
  const ext = useExtSettings()
  const dirty = !sameStock(s.minimumStock, s.savedMinimum)

  // เตือนเมื่อออกจากหมวดค่าขั้นต่ำโดยยังไม่บันทึก (ทั้งจากเมนูในหน้าและ Sidebar)
  const prevTab = useRef<TabKey>(tab)
  const [leaveAsk, setLeaveAsk] = useState(false)
  useEffect(() => {
    if (prevTab.current === 'stock' && tab !== 'stock' && dirty) setLeaveAsk(true)
    prevTab.current = tab
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])
  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  const navOpts: OptionType[] = FLAT.map((x) => ({ value: x.k, label: `${x.group.label} · ${x.label}` }))
  const ensureOk = async (fn: () => Promise<unknown>, okMsg?: string) => {
    await fn()
    if (okMsg) s.notify({ type: 'success', msg: okMsg })
  }
  const toItems = (xs: OptionItem[]) => xs
  const minFor = (code: string) => s.minimumStock[code]

  const navButton = (it: (typeof FLAT)[number]) => {
    const on = it.k === tab
    const Icon = it.icon
    return (
      <button
        key={it.k}
        type="button"
        aria-current={on ? 'page' : undefined}
        onClick={() => go(it.k)}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
          e.preventDefault()
          const i = FLAT.findIndex((x) => x.k === it.k)
          const n = FLAT[(i + (e.key === 'ArrowDown' ? 1 : -1) + FLAT.length) % FLAT.length]
          go(n.k)
          requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-stg-nav="${n.k}"]`)?.focus())
        }}
        data-stg-nav={it.k}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%', minHeight: 40, padding: '8px 12px',
          border: 'none', borderRadius: 'var(--radius-md, 8px)', font: 'inherit', fontSize: 14, textAlign: 'left', cursor: 'pointer',
          background: on ? 'var(--primary-surface)' : 'transparent', color: on ? 'var(--primary)' : 'var(--text-primary)', fontWeight: on ? 600 : 400,
        }}
        onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'var(--surface-raised)' }}
        onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent' }}
      >
        <Icon size={16} color={on ? 'var(--primary)' : 'var(--text-secondary)'} />{it.label}
      </button>
    )
  }

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <Toast toast={s.toast} onDismiss={s.dismissToast} />
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
        กำหนดค่าขั้นต่ำสต็อก จัดการผู้ใช้ ข้อมูลหลัก และตัวเลือกที่ใช้ในฟอร์มทั้งหมดของระบบ
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: wide ? '232px minmax(0,1fr)' : 'minmax(0,1fr)', gap: wide ? 24 : 16, alignItems: 'start' }}>
        {wide ? (
          <nav aria-label="หมวดการตั้งค่า" style={{
            position: 'sticky', top: 16, display: 'flex', flexDirection: 'column', gap: 16, padding: 12,
            background: 'var(--surface, #fff)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)',
          }}>
            {NAV.map((ng) => (
              <div key={ng.key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ padding: '0 12px 4px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{ng.label}</div>
                  {ng.note && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.5 }}>{ng.note}</div>}
                </div>
                {FLAT.filter((x) => x.group.key === ng.key).map(navButton)}
              </div>
            ))}
          </nav>
        ) : (
          <SelectDropdown
            label="หมวดการตั้งค่า"
            options={navOpts}
            value={navOpts.find((o) => o.value === tab) ?? null}
            onChange={(o) => { const v = (o as OptionType | null)?.value; if (v) go(v as TabKey) }}
            isClearable={false}
            isSearchable={false}
          />
        )}

        <section aria-label={cur.label} style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {cur.group.label} / <b style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{cur.label}</b>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              {tab === 'stock' ? <><Hand size={13} />หมวดนี้ต้องกด "บันทึก"</> : <><Cloud size={13} />บันทึกอัตโนมัติทุกการเปลี่ยนแปลง</>}
            </span>
          </div>

          {tab === 'stock' && (
            <SettingsMinStock
              groups={master.bloodTypes.filter((b) => b.active).map((b) => b.code)}
              hiddenGroups={master.bloodTypes.filter((b) => !b.active).map((b) => b.code)}
              minimumStock={s.minimumStock}
              saving={s.savingSettings}
              loading={master.loading}
              dirty={dirty}
              onChange={s.handleMinStockChange}
              onSave={s.handleSaveMinimumStock}
              onReset={s.resetMinimumStock}
              onOpenGroups={() => go('blood')}
            />
          )}

          {tab === 'users' && (
            <SettingsUsers
              users={s.users}
              loading={s.loadingUsers}
              currentUserId={user.id}
              showForm={s.showUserForm}
              form={s.userForm}
              saving={s.savingUser}
              onToggleForm={s.setShowUserForm}
              onFormChange={s.handleUserFormChange}
              onCreate={s.handleCreateUser}
              onToggleActive={s.handleToggleActive}
              onResetPassword={s.handleResetPassword}
            />
          )}

          {tab === 'plasma' && (
            <SettingsCodeList
              key="plasma"
              title="ชนิดเลือด"
              description="ใช้ทั้งการจัดเก็บพลาสมาและรับเลือดจากภายนอก เช่น FFP, Cryo, LPRC"
              placeholder="ชื่อชนิดใหม่"
              items={master.plasmaTypes}
              loading={master.loading}
              onAdd={(code, name, color) => master.addCode('plasma', code, name, color)}
              onToggle={(it) => master.toggleCode('plasma', it)}
              onColorChange={(it, color) => master.updateColor('plasma', it, color)}
              impact={() => [
                'เลือกชนิดนี้ในฟอร์มจัดเก็บพลาสมาและรับเลือดจากภายนอกไม่ได้',
                'สต็อกเดิมของชนิดนี้ยังนำออกได้ตามปกติ',
              ]}
            />
          )}

          {tab === 'blood' && (
            <SettingsCodeList
              key="blood"
              title="หมู่เลือด"
              description="เช่น A, B, O, AB, A-"
              placeholder="หมู่เลือดใหม่"
              items={master.bloodTypes}
              loading={master.loading}
              onAdd={(code, name, color) => master.addCode('blood', code, name, color)}
              onToggle={(it) => master.toggleCode('blood', it)}
              onColorChange={(it, color) => master.updateColor('blood', it, color)}
              impact={(it) => [
                `จัดเก็บหมู่ ${it.code} ใหม่ไม่ได้ — สต็อกเดิมยังนำออกได้`,
                minFor(it.code) != null
                  ? `ค่าขั้นต่ำ ${minFor(it.code)} units จะถูกซ่อน และหยุดแจ้งเตือนสต็อกต่ำ`
                  : 'ช่องค่าขั้นต่ำของหมู่นี้จะถูกซ่อน',
              ]}
            />
          )}

          {tab === 'zones' && (
            <SettingsZones
              zones={master.zones}
              loading={master.loading}
              onAddZone={master.addZone}
              onToggleZone={master.toggleZone}
              onAddShelf={master.addShelf}
              onToggleShelf={master.toggleShelf}
            />
          )}

          {tab === 'removal' && (
            <SettingsOptionList
              key="removal"
              title="หมายเหตุการลบ unit"
              description="ตัวเลือกที่ต้องเลือกทุกครั้งเมื่อลบ unit ออกจากกล่อง"
              placeholder="หมายเหตุใหม่ เช่น สแกนผิดกล่อง"
              items={toItems(master.removalReasons)}
              loading={master.loading}
              minActive={1}
              minActiveMsg="ต้องเปิดใช้งานอย่างน้อย 1 รายการ — ไม่อย่างนั้นจะลบ unit ไม่ได้"
              onAdd={async (n) => { if (!(await master.addRemovalReason(n))) throw new Error('เพิ่มไม่สำเร็จ — ลองใหม่อีกครั้ง') }}
              onRename={async (it, n) => { if (!(await master.renameRemovalReason(it as any, n))) throw new Error('แก้ไขไม่สำเร็จ — ลองใหม่อีกครั้ง') }}
              onToggle={(it) => master.toggleRemovalReason(it as any)}
              /* API หมายเหตุการลบยังไม่มี delete / reorder */
            />
          )}

          {tab === 'extSources' && (
            <SettingsOptionList
              key="extSources"
              title="สถานที่ส่งเลือด"
              description="ตัวเลือกในฟอร์มบันทึกรับเลือดจากภายนอก"
              placeholder="สถานที่ใหม่ เช่น โรงพยาบาลศูนย์"
              items={ext.sourceItems}
              loading={ext.loading}
              hasLocked
              onAdd={(n) => ensureOk(() => ext.addSource(n), `เพิ่ม "${n}" สำเร็จ`)}
              onRename={(it, n) => ensureOk(() => ext.updateSource(it.id, { name: n }))}
              onToggle={(it) => ensureOk(() => ext.updateSource(it.id, { active: !it.active }))}
              onDelete={(it) => ensureOk(() => ext.deleteSource(it.id), `ลบ "${it.name}" แล้ว`)}
              onReorder={ext.reorderSources}
            />
          )}

          {tab === 'extStorages' && (
            <SettingsOptionList
              key="extStorages"
              title="ตำแหน่งจัดเก็บเลือดภายนอก"
              description="ตัวเลือกในฟอร์มบันทึกรับเลือดจากภายนอก (ยังแยกจาก สถานที่จัดเก็บ ของพลาสมา)"
              placeholder="ตำแหน่งใหม่ เช่น ตู้ -30°C ชั้น 3"
              items={ext.storageItems}
              loading={ext.loading}
              onAdd={(n) => ensureOk(() => ext.addStorage(n), `เพิ่ม "${n}" สำเร็จ`)}
              onRename={(it, n) => ensureOk(() => ext.updateStorage(it.id, { name: n }))}
              onToggle={(it) => ensureOk(() => ext.updateStorage(it.id, { active: !it.active }))}
              onDelete={(it) => ensureOk(() => ext.deleteStorage(it.id), `ลบ "${it.name}" แล้ว`)}
              onReorder={ext.reorderStorages}
            />
          )}

          {tab === 'extReasons' && (
            <SettingsOptionList
              key="extReasons"
              title="เหตุผลการนำออก"
              description="ตัวเลือกเมื่อนำเลือดภายนอกออกจากคลัง"
              placeholder="เหตุผลใหม่ เช่น ส่งต่อโรงพยาบาลอื่น"
              items={ext.reasonItems}
              loading={ext.loading}
              onAdd={(n) => ensureOk(() => ext.addReason(n), `เพิ่ม "${n}" สำเร็จ`)}
              onRename={(it, n) => ensureOk(() => ext.updateReason(it.id, { name: n }))}
              onToggle={(it) => ensureOk(() => ext.updateReason(it.id, { active: !it.active }))}
              onDelete={(it) => ensureOk(() => ext.deleteReason(it.id), `ลบ "${it.name}" แล้ว`)}
              onReorder={ext.reorderReasons}
            />
          )}
        </section>
      </div>

      <ConfirmModal
        open={leaveAsk}
        type="warning"
        title="ออกโดยไม่บันทึก?"
        message="ค่าขั้นต่ำที่แก้ไขไว้ยังไม่ได้บันทึก ถ้าออกจากหมวดนี้ ค่าที่แก้จะหายไป"
        confirmText="ทิ้งการแก้ไข"
        cancelText="กลับไปแก้ไขต่อ"
        onClose={() => { setLeaveAsk(false); go('stock') }}
        onConfirm={() => { s.resetMinimumStock(); setLeaveAsk(false) }}
      />
    </div>
  )
}
