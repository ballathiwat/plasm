// frontend/src/pages/ExtBloodReport/components/ProductCards.tsx
//
// การ์ดชนิดเลือด (ถุง · %) — คลิก = toggle ตัวกรองชนิดเลือด

import type { CSSProperties } from 'react'
import { fmtInt, fmtPct } from '../services/reportHelpers'
import type { ProductColorMap, ProductItem } from '../services/ReportType'

interface Props {
  products: ProductItem[]
  colors: ProductColorMap
  selected?: string
  onToggle: (productId: string) => void
}

const cssVars = (vars: Record<string, string>) => vars as CSSProperties

export default function ProductCards({ products, colors, selected, onToggle }: Props) {
  const total = products.reduce((s, p) => s + p.bags, 0)

  return (
    <section className="rpt-card">
      <header className="rpt-card__head">
        <h3 className="rpt-card__title">ชนิดเลือด</h3>
      </header>

      <div className="rpt-products">
        {products.map((p) => (
          <button
            key={p.productId}
            type="button"
            className={`rpt-product${selected === p.productId ? ' is-selected' : ''}${selected && selected !== p.productId ? ' is-dim' : ''}`}
            style={cssVars({ '--c': colors[p.code] })}
            aria-pressed={selected === p.productId}
            onClick={() => onToggle(p.productId)}
          >
            <span className="rpt-product__head">
              <span className="rpt-dot" />
              <span className="rpt-product__code">{p.code}</span>
              <span className="rpt-product__pct">{fmtPct(p.bags, total)}</span>
            </span>
            {p.name && <span className="rpt-product__name" title={p.name}>{p.name}</span>}
            <span className="rpt-product__value">
              {fmtInt(p.bags)} <span className="rpt-product__unit">ถุง</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
