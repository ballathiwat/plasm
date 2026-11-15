// frontend/src/pages/ExtBloodReport/components/TrendChart.tsx
//
// Stacked bar: จำนวนถุงตามช่วงเวลา แยกตามชนิดเลือด + tooltip

import { useState, type CSSProperties } from 'react'
import { bucketLabel, bucketTitle, fmtInt, fmtLiters, niceMax } from '../services/reportHelpers'
import type { Granularity, ProductColorMap, TrendBucket } from '../services/ReportType'

interface Props {
  trend: TrendBucket[]
  granularity: Granularity
  productCodes: string[]
  colors: ProductColorMap
}

const TICKS = 4
const cssVars = (vars: Record<string, string>) => vars as CSSProperties

export default function TrendChart({ trend, granularity, productCodes, colors }: Props) {
  const [active, setActive] = useState<number | null>(null)

  const max = niceMax(Math.max(0, ...trend.map((t) => t.bags)))
  const ticks = Array.from({ length: TICKS + 1 }, (_, i) => (max / TICKS) * (TICKS - i))
  // ช่วงเยอะ → แสดงป้ายแกน X เว้นช่วง
  const labelEvery = Math.ceil(trend.length / 12)

  return (
    <section className="rpt-card">
      <header className="rpt-card__head">
        <h3 className="rpt-card__title">จำนวนถุงที่รับตามช่วงเวลา</h3>
        <span className="rpt-card__sub">{granularity === 'week' ? 'รายสัปดาห์' : 'รายเดือน'}</span>
      </header>

      <div className="rpt-trend">
        <div className="rpt-trend__axis" aria-hidden="true">
          {ticks.map((t) => <span key={t}>{fmtInt(t)}</span>)}
        </div>

        <div className="rpt-trend__body">
          <div className="rpt-trend__plot">
            <div className="rpt-trend__grid" aria-hidden="true">
              {ticks.map((t) => <span key={t} />)}
            </div>

            {trend.map((t, i) => {
              const edge = i < 2 ? ' rpt-trend__tip--left' : i >= trend.length - 2 ? ' rpt-trend__tip--right' : ''
              const title = bucketTitle(t.bucket, granularity)
              return (
                <div
                  key={t.bucket}
                  className={`rpt-trend__col${active === i ? ' rpt-trend__col--active' : ''}`}
                  tabIndex={0}
                  role="img"
                  aria-label={`${title}: ${fmtInt(t.bags)} ถุง, ${fmtLiters(t.volumeMl)} ลิตร`}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                >
                  <div className="rpt-trend__stack" style={cssVars({ '--h': `${(t.bags / max) * 100}%` })}>
                    {productCodes.map((code) => {
                      const n = t.products[code] ?? 0
                      if (n === 0) return null
                      return (
                        <span
                          key={code}
                          className="rpt-trend__seg"
                          style={cssVars({ '--c': colors[code], '--n': String(n) })}
                        />
                      )
                    })}
                  </div>

                  {active === i && (
                    <div className={`rpt-trend__tip${edge}`} style={cssVars({ '--h': `${(t.bags / max) * 100}%` })}>
                      <div className="rpt-trend__tip-title">{title}</div>
                      {productCodes.map((code) => {
                        const n = t.products[code] ?? 0
                        if (n === 0) return null
                        return (
                          <div key={code} className="rpt-trend__tip-row">
                            <span className="rpt-dot" style={cssVars({ '--c': colors[code] })} />
                            <span>{code}</span>
                            <strong>{fmtInt(n)}</strong>
                          </div>
                        )
                      })}
                      <div className="rpt-trend__tip-row rpt-trend__tip-row--total">
                        <span>รวม</span>
                        <strong>{fmtInt(t.bags)} ถุง · {fmtLiters(t.volumeMl)} ลิตร</strong>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="rpt-trend__labels" aria-hidden="true">
            {trend.map((t, i) => (
              <span key={t.bucket}>{i % labelEvery === 0 ? bucketLabel(t.bucket, granularity) : ''}</span>
            ))}
          </div>
        </div>
      </div>

      <ul className="rpt-legend">
        {productCodes.map((code) => (
          <li key={code} className="rpt-legend__item">
            <span className="rpt-dot" style={cssVars({ '--c': colors[code] })} />
            {code}
          </li>
        ))}
      </ul>
    </section>
  )
}
