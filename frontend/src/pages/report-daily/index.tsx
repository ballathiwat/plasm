// frontend/src/pages/report-daily/index.tsx

import useDailyReport, { presetRange, formatThaiRange } from './services/useDailyReport'
import MovementFilters from './components/MovementFilters'
import ReportKpis from './components/ReportKpis'
import TypeBloodMatrix from './components/TypeBloodMatrix'
import MovementHeatmap from './components/MovementHeatmap'
import Toast from '../../components/common/Toast'

export default function DailyReportPage() {
  const {
    masterTypes, draft, applied, data, loading, toast, setToast,
    isDirty, isNonDefault, rangeError,
    setDraft, search, applyNow, resetAll, toggleTypeNow,
  } = useDailyReport()

  const isEmpty = data && data.totals.in === 0 && data.totals.out === 0
  const typesLabel = applied.types.length > 0 ? applied.types.join(', ') : 'ทุกชนิด'

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <MovementFilters
        draft={draft}
        applied={applied}
        masterTypes={masterTypes}
        loading={loading}
        isDirty={isDirty}
        isNonDefault={isNonDefault}
        rangeError={rangeError}
        onDraft={setDraft}
        onSearch={search}
        onApplyNow={applyNow}
        onReset={resetAll}
        onToggleTypeNow={toggleTypeNow}
      />

      {loading && (
        <div role="status" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
          กำลังโหลดข้อมูล...
        </div>
      )}

      {!loading && data && isEmpty && (
        <div style={{
          background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
          borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)',
          padding: '40px 20px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            ไม่มีการนำเข้า/นำออกในช่วงนี้
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
            {formatThaiRange(applied.from, applied.to)}
          </p>
          <button type="button" onClick={() => applyNow({ preset: '30d', ...presetRange('30d') })} style={{
            padding: '8px 20px', borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--primary, #2563EB)', background: 'var(--surface, #fff)',
            color: 'var(--primary, #2563EB)', fontWeight: 600, fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>ดู 30 วันล่าสุด</button>
        </div>
      )}

      {!loading && data && !isEmpty && (
        <>
          <ReportKpis data={data} />
          <TypeBloodMatrix data={data} />
          <MovementHeatmap data={data} typesLabel={typesLabel} />
        </>
      )}
    </div>
  )
}
