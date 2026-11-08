// frontend/src/pages/ExtBloodReport/components/ExtReportChart.tsx
import type { ExtReportChartItem } from '../services/ExtReportType'
export default function ExtReportChart({ data }: { data: ExtReportChartItem[] }) {
  const max = Math.max(...data.map(d => d.received + d.exported), 1)
  const bw = 36, gap = 12, h = 200, w = data.length * (bw + gap)
  return (
    <div className="ext-report-card"><h4 className="ext-report-card-title">รับเข้า / นำออก รายเดือน</h4>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${w + 40} ${h + 40}`} width={w + 40} style={{ minWidth: 300 }}>
          {data.map((d, i) => { const x = 20 + i * (bw + gap); const rH = (d.received / max) * h; const eH = (d.exported / max) * h; const tH = rH + eH; return (
            <g key={i}><rect x={x} y={h - tH + 10} width={bw} height={rH} fill="var(--primary)" rx={3} opacity={0.85} /><rect x={x} y={h - eH + 10} width={bw} height={eH} fill="#8B5CF6" rx={3} opacity={0.7} />
            <text x={x + bw / 2} y={h + 26} textAnchor="middle" fontSize={10} fill="var(--text-secondary)">{d.month}</text></g>
          )})}
        </svg>
      </div>
      <div className="ext-report-legend"><span className="ext-report-legend-item"><span className="ext-report-legend-dot" style={{ background: 'var(--primary)' }} /> รับเข้า</span><span className="ext-report-legend-item"><span className="ext-report-legend-dot" style={{ background: '#8B5CF6' }} /> นำออก</span></div>
    </div>
  )
}
