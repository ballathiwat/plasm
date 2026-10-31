// ============================================================
//  src/pages/rack/components/RackSearch.tsx
//  ค้นหากล่อง/unit (ห้องและตู้ -30°C) → กระโดดไปช่อง
// ============================================================

import { useEffect, useRef, useState } from 'react'
import { CornerDownLeft, Search } from 'lucide-react'
import FormInput from '../../../components/common/FormInput'
import { groupInk, groupSurface } from '../../../helpers/blood'
import { positionLabel } from '../../../helpers/rack'
import rackService from '../services/RackService'
import type { RackSearchResult } from '../services/RackType'

interface Props {
  onPick: (r: RackSearchResult) => void
}

const MAX_RESULTS = 8

export default function RackSearch({ onPick }: Props) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<RackSearchResult[]>([])
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const term = q.trim()

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    if (term.length < 2) {
      setResults([])
      return
    }
    let alive = true
    setLoading(true)
    const t = setTimeout(() => {
      rackService
        .search(term)
        .then((r) => { if (alive) { setResults(r.slice(0, MAX_RESULTS)); setActive(0) } })
        .catch(() => { if (alive) setResults([]) })
        .finally(() => { if (alive) setLoading(false) })
    }, 200)
    return () => { alive = false; clearTimeout(t) }
  }, [term])

  const pick = (r: RackSearchResult) => {
    onPick(r)
    setOpen(false)
    setQ('')
  }

  return (
    <div className="rack-search" ref={wrapRef} role="search">
      <FormInput
        aria-label="ค้นหากล่องหรือ unit ในห้องและตู้ -30°C"
        aria-expanded={open && term.length >= 2}
        aria-controls="rack-search-list"
        size="sm"
        placeholder="ค้นหากล่อง หรือ unit (ห้องและตู้ -30°C)..."
        icon={<Search size={14} />}
        value={q}
        onChange={(v) => { setQ(v); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            const r = results[active] ?? results[0]
            if (r) pick(r)
          } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive((a) => Math.min(results.length - 1, a + 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((a) => Math.max(0, a - 1))
          } else if (e.key === 'Escape') {
            e.stopPropagation()
            setOpen(false)
          }
        }}
      />
      {open && term.length >= 2 && (
        <ul id="rack-search-list" role="listbox" className="rack-search__menu">
          {results.length === 0 && (
            <li className="rack-search__empty">{loading ? 'กำลังค้นหา...' : `ไม่พบ "${term}" ในห้องและตู้ -30°C`}</li>
          )}
          {results.map((r, i) => (
            <li key={`${r.box.id}-${r.matchedUnit ?? ''}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                className="rack-search__opt"
                data-active={i === active}
                onMouseDown={(e) => { e.preventDefault(); pick(r) }}
                onMouseEnter={() => setActive(i)}
              >
                <span
                  className="rack-badge"
                  style={{ width: 28, height: 28, fontSize: 12, background: groupSurface(r.box.blood), color: groupInk(r.box.blood) }}
                >
                  {r.box.blood}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>
                    {r.matchedUnit ?? r.box.boxLabel}
                  </span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)' }}>
                    {r.matchedUnit ? `ในกล่อง ${r.box.boxLabel} · ` : ''}
                    {r.level != null && r.position != null
                      ? `${r.shelf}-${r.level} · ช่อง ${r.position}`
                      : `${r.zoneName} · ${positionLabel(r)}`}
                  </span>
                </span>
                <CornerDownLeft size={14} color="var(--text-secondary)" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
