// frontend/src/pages/ExtBloodReport/components/SourceBars.tsx
//
// Horizontal stacked bar: จำนวนถุงตามแหล่งที่มา (มาก → น้อย) แยกสีตามชนิดเลือด
// คลิกแถว = toggle ตัวกรองแหล่งที่มา

import type { CSSProperties } from 'react'
import { fmtInt } from '../services/reportHelpers'
import type { ProductColorMap, SourceItem } from '../services/ReportType'

interface Props {
  sources: SourceItem[]
  productCodes: string[]
  colors: ProductColorMap
  selected?: string
  onToggle: (sourceId: string) => void
}

const cssVars = (vars: Record<string, string>) => vars as CSSProperties

export default function SourceBars({ sources, productCodes, colors, selected, onToggle }: Props) {
  const max = Math.max(1, ...sources.map((s) => s.bags))

  return (
    <section className="rpt-card">
      <header className="rpt-card__head">
        <h3 className="rpt-card__title">จำนวนถุงตามแหล่งที่มา</h3>
        <span className="rpt-card__sub">{fmtInt(sources.length)} แห่ง</span>
      </header>

      <ul className="rpt-src">
        {sources.map((s) => (
          <li key={s.sourceId}>
            <button
              type="button"
              className={`rpt-src__row${selected === s.sourceId ? ' is-selected' : ''}${selected && selected !== s.sourceId ? ' is-dim' : ''}`}
              aria-pressed={selected === s.sourceId}
              aria-label={`${s.sourceName}: ${fmtInt(s.bags)} ถุง จาก ${fmtInt(s.receipts)} ครั้ง`}
              onClick={() => onToggle(s.sourceId)}
            >
              <span className="rpt-src__name" title={s.sourceName}>{s.sourceName}</span>
              <span className="rpt-src__track">
                <span className="rpt-src__bar" style={cssVars({ '--w': `${(s.bags / max) * 100}%` })}>
                  {productCodes.map((code) => {
                    const n = s.products[code] ?? 0
                    if (n === 0) return null
                    return (
                      <span
                        key={code}
                        className="rpt-src__seg"
                        title={`${code}: ${fmtInt(n)} ถุง`}
                        style={cssVars({ '--c': colors[code], '--n': String(n) })}
                      />
                    )
                  })}
                </span>
              </span>
              <span className="rpt-src__value">{fmtInt(s.bags)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
