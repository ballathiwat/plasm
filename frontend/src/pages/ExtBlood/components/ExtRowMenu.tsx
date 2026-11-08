// frontend/src/pages/ExtBlood/components/ExtRowMenu.tsx — เมนู ⋯ ต่อแถว (position: fixed กันโดนตารางตัด)
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MoreHorizontal } from 'lucide-react'

export interface RowMenuItem { icon: ReactNode; label: string; onClick: () => void; danger?: boolean }

export default function ExtRowMenu({ items }: { items: RowMenuItem[] }) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!pos) return
    const close = () => setPos(null)
    const out = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close() }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('mousedown', out); document.addEventListener('keydown', esc)
    window.addEventListener('scroll', close, true); window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc)
      window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close)
    }
  }, [pos])
  if (!items.length) return null
  const toggle = () => {
    if (pos) return setPos(null)
    const b = ref.current!.getBoundingClientRect()
    setPos({ top: b.bottom + 4, right: window.innerWidth - b.right })
  }
  return (
    <div ref={ref} className="ext-row-menu">
      <button type="button" className="ext-row-menu__btn" aria-label="เมนูเพิ่มเติม" aria-expanded={!!pos} onClick={toggle}><MoreHorizontal size={16} /></button>
      {pos && (
        <div role="menu" className="ext-row-menu__panel" style={{ top: pos.top, right: pos.right }}>
          {items.map((it) => (
            <button key={it.label} role="menuitem" type="button" className={`ext-row-menu__item ${it.danger ? 'is-danger' : ''}`} onClick={() => { setPos(null); it.onClick() }}>
              {it.icon}{it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
