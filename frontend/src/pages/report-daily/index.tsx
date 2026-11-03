// frontend/src/pages/report-daily/index.tsx

import useDailyReport from './services/useDailyReport'
import MovementFilters from './components/MovementFilters'
import MovementSummaryCard from './components/MovementSummaryCard'
import DailyChart from './components/DailyChart'
import DailyTable from './components/DailyTable'
import Toast from '../../components/common/Toast'
import { sumRecord } from './services/DailyReportType'

export default function DailyReportPage() {
  const {
    masterTypes, draft, data, loading, toast, setToast,
    isDirty, validationError, effectiveTypesLabel,
    search, setPreset, setFrom, setTo, setGroup,
    toggleType, selectAllTypes, jumpTo30Days,
  } = useDailyReport()

  const isEmpty = data && data.buckets.every(
    (b) => sumRecord(b.store) === 0 && sumRecord(b.withdraw) === 0,
  )

  const formatRange = () => {
    if (!data) return ''
    const fmt = (iso: string) =>
      new Date(`${iso}T00:00:00+07:00`).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
    return data.from === data.to ? fmt(data.from) : `${fmt(data.from)} – ${fmt(data.to)}`
  }

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <MovementFilters
        draft={draft} masterTypes={masterTypes} loading={loading}
        isDirty={isDirty} validationError={validationError}
        onPreset={setPreset} onFromChange={setFrom} onToChange={setTo}
        onGroupChange={setGroup} onToggleType={toggleType}
        onSelectAllTypes={selectAllTypes} onSearch={search}
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
            {formatRange()}
          </p>
          <button type="button" onClick={jumpTo30Days} style={{
            padding: '8px 20px', borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--primary, #2563EB)', background: 'var(--surface, #fff)',
            color: 'var(--primary, #2563EB)', fontWeight: 600, fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            ดู 30 วันล่าสุด
          </button>
        </div>
      )}

      {!loading && data && !isEmpty && (
        <>
          <MovementSummaryCard data={data} />
          <DailyChart data={data} typesLabel={effectiveTypesLabel} />
          <DailyTable data={data} />
        </>
      )}
    </div>
  )
}
