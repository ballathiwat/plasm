// ============================================================
//  src/pages/log/index.tsx
// ============================================================

import useLog from './services/useLog'
import LogFiltersBar from './components/LogFiltersBar'
import LogTable from './components/LogTable'

const LogPage = () => {
  const {
    entries,
    loading,
    filters,
    hasMore,
    handleFilterChange,
    resetFilters,
    loadMore,
  } = useLog()

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>ประวัติการจัดเก็บ/นำออก</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          บันทึกทุกรายการจัดเก็บและนำออกพลาสมา · แสดง {entries.length} รายการ
        </p>
      </div>

      <LogFiltersBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={resetFilters}
      />

      <LogTable
        entries={entries}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  )
}

export default LogPage
