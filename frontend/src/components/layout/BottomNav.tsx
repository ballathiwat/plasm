// frontend/src/components/layout/BottomNav.tsx — แถบล่างมือถือ + แผ่นเมนู "เพิ่มเติม"

import { useEffect, useState } from 'react'
import { UserCircle, LogOut, X } from 'lucide-react'
import { MENU_ITEMS, MOBILE_NAV_ITEMS, type MenuItem, type UserRole } from '../../types/navigation'

interface BottomNavProps {
  activeModule: string
  onNavigate: (key: string) => void
  role: UserRole
  onLogout?: () => void
}

const BAR_KEYS = new Set(MOBILE_NAV_ITEMS.map((i) => i.key))

export default function BottomNav({ activeModule, onNavigate, role, onLogout }: BottomNavProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', esc)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = prev }
  }, [open])

  const allowed = (m: MenuItem) => m.roles.includes(role)
  const menu = MENU_ITEMS.filter(allowed).map((m) => ({ ...m, children: m.children?.filter(allowed) }))
  const singles = menu.filter((m) => !m.children?.length && !BAR_KEYS.has(m.key))
  const groups = menu.filter((m) => m.children?.length)
  const moreActive = open || !BAR_KEYS.has(activeModule)
  const go = (key: string) => { setOpen(false); onNavigate(key) }

  const row = (key: string, label: string, Icon: MenuItem['icon'], danger = false, onClick = () => go(key)) => {
    const on = activeModule === key
    return (
      <button key={key} type="button" onClick={onClick} aria-current={on ? 'page' : undefined}
        style={{
          width: '100%', minHeight: 48, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
          border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', fontSize: 15, textAlign: 'left', cursor: 'pointer',
          background: on ? 'var(--primary-surface)' : 'none',
          color: danger ? 'var(--danger-ink)' : on ? 'var(--primary-ink)' : 'var(--text-primary)',
          fontWeight: on ? 600 : 400,
        }}>
        <Icon size={20} aria-hidden="true" />{label}
      </button>
    )
  }
  const sectionTitle = (t: string) => (
    <div style={{ padding: '12px 16px 4px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{t}</div>
  )

  return (
    <>
      {open && (
        <div className="md:hidden" onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(24,24,27,.4)', animation: 'plasm-fade-in .15s ease' }}>
          <div role="dialog" aria-modal="true" aria-label="เมนูทั้งหมด" onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '80vh', overflowY: 'auto',
              background: 'var(--surface)', borderRadius: '16px 16px 0 0', boxShadow: 'var(--shadow-md)',
              padding: '8px 8px calc(64px + env(safe-area-inset-bottom, 0px))',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 8px 8px 16px' }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>เมนูทั้งหมด</span>
              <button type="button" aria-label="ปิดเมนู" onClick={() => setOpen(false)}
                style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            {singles.map((m) => row(m.key, m.label, m.icon))}
            {groups.map((g) => (
              <div key={g.key}>
                {sectionTitle(g.label)}
                {g.children!.map((c) => row(c.key, c.label, c.icon))}
              </div>
            ))}
            {sectionTitle('บัญชี')}
            {row('profile', 'โปรไฟล์', UserCircle)}
            {onLogout && row('logout', 'ออกจากระบบ', LogOut, true, () => { setOpen(false); onLogout() })}
          </div>
        </div>
      )}

      <nav aria-label="เมนูหลัก" className="md:hidden flex items-stretch justify-around flex-none"
        style={{
          position: 'relative', zIndex: 61, height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
        {MOBILE_NAV_ITEMS.map((item) => {
          const isMore = item.key === 'more'
          const on = isMore ? moreActive : activeModule === item.key && !open
          const Icon = item.icon
          return (
            <button key={item.key} type="button"
              onClick={() => (isMore ? setOpen(!open) : go(item.key))}
              aria-current={!isMore && on ? 'page' : undefined}
              aria-expanded={isMore ? open : undefined}
              aria-haspopup={isMore ? 'dialog' : undefined}
              style={{
                flex: 1, minWidth: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11,
                color: on ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: on ? 600 : 400,
              }}>
              <Icon size={20} aria-hidden="true" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </>
  )
}
