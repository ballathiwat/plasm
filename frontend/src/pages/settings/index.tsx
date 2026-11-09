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
    { k: 'extStorages', label: 'ตำแหน่งจัดเก็บ (ภายนอก)', icon: Archive },
    { k: 'extReasons', label: 'เหตุผลการนำออก', icon: LogOut },
  ] },
]
const FLAT = NAV.flatMap((g) => g.items.map((it) => ({ ...it, group: g })))
const groupOf = (k: string) => FLAT.find((x) => x.k === k)?.group

const sameStock = (a: MinimumStock, b: MinimumStock) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  return [...keys].every((k) => (a[k] ?? null) === (b[k] ?? null))
}

// พื้นหลังโทนฟ้าอ่อนแบบคงที่ — ไม่ใช้ --primary-surface เพราะ globals.css สลับค่านี้เป็นสีเข้มตาม prefers-color-scheme
// ขณะที่ surface อื่นยังเป็นสีสว่าง (ทำให้ได้กล่องสีกรมท่าบนหน้าขาว)
const PRIMARY_TINT = 'rgba(37, 99, 235, 0.08)'

export default function SettingsPage() {
  const { group } = useParams()
  const [sp] = useSearchParams()
  const navigate = useNavigate()
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

  const ensureOk = async (fn: () => Promise<unknown>, okMsg?: string) => {
    await fn()
    if (okMsg) s.notify({ type: 'success', msg: okMsg })
  }
  const toItems = (xs: OptionItem[]) => xs
  const minFor = (code: string) => s.minimumStock[code]

  // Sidebar เลือก "กลุ่ม" แล้ว → ในหน้าแสดงเฉพาะหมวดของกลุ่มนั้นเป็นแท็บ (ไม่ซ้ำกับ Sidebar)
  const groupItems = cur.group.items
  const tabButton = (it: (typeof groupItems)[number]) => {
    const on = it.k === tab
    const Icon = it.icon
    return (
      <button
        key={it.k}
        type="button"
        role="tab"
        aria-selected={on}
        tabIndex={on ? 0 : -1}
        onClick={() => go(it.k)}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
          e.preventDefault()
          const i = groupItems.findIndex((x) => x.k === it.k)
          const n = groupItems[(i + (e.key === 'ArrowRight' ? 1 : -1) + groupItems.length) % groupItems.length]
          go(n.k)
          requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-stg-tab="${n.k}"]`)?.focus())
        }}
        data-stg-tab={it.k}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 16px', whiteSpace: 'nowrap',
          border: 'none', borderBottom: `2px solid ${on ? 'var(--primary)' : 'transparent'}`, marginBottom: -2,
          background: 'transparent', font: 'inherit', fontSize: 14, cursor: 'pointer',
          color: on ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: on ? 700 : 500,
        }}
        onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = PRIMARY_TINT }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        <Icon size={16} />{it.label}
      </button>
    )
  }

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <Toast toast={s.toast} onDismiss={s.dismissToast} />

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', borderBottom: '2px solid var(--border)', marginBottom: 16 }}>
        <div role="tablist" aria-label={`หมวดใน ${cur.group.label}`} style={{ display: 'flex', overflowX: 'auto', minWidth: 0 }}>
          {groupItems.map(tabButton)}
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', paddingBottom: 12 }}>
          {tab === 'stock' ? <><Hand size={13} />หมวดนี้ต้องกด "บันทึก"</> : <><Cloud size={13} />บันทึกอัตโนมัติทุกการเปลี่ยนแปลง</>}
        </span>
      </div>
      {cur.group.note && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '-4px 0 12px' }}>{cur.group.note}</p>}

      <section role="tabpanel" aria-label={cur.label} style={{ minWidth: 0 }}>
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
