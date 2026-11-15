// frontend/src/pages/ExtBloodReport/index.tsx
//
// รายงานรับเลือดจากภายนอก — route /ext-blood/report
// API: GET /api/v1/ext/reports/receipts และ /receipts/rows

import { AlertCircle, Inbox, RefreshCw } from 'lucide-react'
import Button from '../../components/common/Button'
import useExtReport, { ROWS_PAGE_SIZE } from './services/useExtReport'
import ReportFilters from './components/ReportFilters'
import KpiCards from './components/KpiCards'
import TrendChart from './components/TrendChart'
import GroupDonut from './components/GroupDonut'
import SourceBars from './components/SourceBars'
import ProductCards from './components/ProductCards'
import ReportTables from './components/ReportTables'
import '../../assets/styles/ext-blood.css'
import '../../assets/styles/ext-report.css'

function ReportSkeleton() {
  return (
    <div role="status" aria-label="กำลังโหลดรายงาน">
      <div className="rpt-kpis">
        {[1, 2, 3, 4].map((i) => <div key={i} className="rpt-skel rpt-skel--kpi" />)}
      </div>
      <div className="rpt-row">
        <div className="rpt-skel rpt-skel--chart" />
        <div className="rpt-skel rpt-skel--chart" />
      </div>
    </div>
  )
}

export default function ExtBloodReportPage() {
  const r = useExtReport()
  const { report, filters } = r

  return (
    <div className="rpt-page">
      <header className="rpt-header">
        <h2 className="ext-title">รายงานรับเลือดจากภายนอก</h2>
        <p className="ext-subtitle">
          {filters.includePending
            ? 'นับเอกสารที่อนุมัติแล้ว นำออกแล้ว และรออนุมัติ'
            : 'นับเฉพาะเอกสารที่อนุมัติแล้วและนำออกแล้ว'}
          {' '}· เทียบกับช่วงก่อนหน้าที่มีจำนวนวันเท่ากัน
        </p>
      </header>

      <ReportFilters
        filters={filters}
        rangeError={r.rangeError}
        sources={r.sources}
        products={r.products}
        hasDimFilter={r.hasDimFilter}
        onPreset={r.setPreset}
        onCustomDate={r.setCustomDate}
        onDim={r.setDim}
        onIncludePending={r.setIncludePending}
        onClear={r.clearDims}
      />

      {r.error && (
        <div className="rpt-alert" role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          <span>{r.error}</span>
          <Button variant="outline" size="sm" icon={<RefreshCw size={14} />} onClick={r.retry}>
            ลองอีกครั้ง
          </Button>
        </div>
      )}

      {r.loading && !r.rangeError && <ReportSkeleton />}

      {report && !r.rangeError && r.isEmpty && (
        <div className="ext-empty rpt-empty">
          <Inbox size={48} strokeWidth={1.2} color="var(--text-disabled)" aria-hidden="true" />
          <p className="ext-empty-text">ไม่มีการรับเลือดในช่วงนี้</p>
          <p className="ext-empty-hint">ลองเปลี่ยนช่วงวันที่ หรือล้างตัวกรองเพื่อดูข้อมูลทั้งหมด</p>
          <Button variant="outline" size="sm" onClick={r.resetAll} style={{ marginTop: 12 }}>
            ล้างตัวกรอง
          </Button>
        </div>
      )}

      {report && !r.rangeError && !r.isEmpty && (
        <div className={`rpt-body${r.fetching ? ' is-fetching' : ''}`} aria-busy={r.fetching}>
          <KpiCards kpi={report.kpi} prev={report.prev} range={report.range} />

          <div className="rpt-row">
            <TrendChart
              trend={report.trend}
              granularity={report.range.granularity}
              productCodes={r.productCodes}
              colors={r.productColors}
            />
            <GroupDonut
              groups={report.byGroup}
              selected={filters.abo}
              onToggle={(abo) => r.toggleDim('abo', abo)}
            />
          </div>

          <div className="rpt-row">
            <SourceBars
              sources={report.bySource}
              productCodes={r.productCodes}
              colors={r.productColors}
              selected={filters.sourceId}
              onToggle={(id) => r.toggleDim('sourceId', id)}
            />
            <ProductCards
              products={report.byProduct}
              colors={r.productColors}
              selected={filters.productId}
              onToggle={(id) => r.toggleDim('productId', id)}
            />
          </div>

          <ReportTables
            report={report}
            tab={r.tab}
            onTab={r.setTab}
            sourceId={filters.sourceId}
            rows={r.rows}
            rowsFetching={r.rowsFetching}
            rowsError={r.rowsError}
            page={r.page}
            pageSize={ROWS_PAGE_SIZE}
            onPage={r.setPage}
          />

          <p className="rpt-note">
            หมายเหตุ: ปริมาตรเป็นค่าโดยประมาณ คำนวณจากค่ามาตรฐานต่อถุงของแต่ละชนิดเลือด
          </p>
        </div>
      )}
    </div>
  )
}
