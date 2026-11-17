// ============================================================
//  src/pages/dashboard/components/DashboardSkeleton.tsx
//  Skeleton loading state for the dashboard
// ============================================================

export default function DashboardSkeleton() {
  return (
    <div className="dov-skeleton" aria-busy="true" aria-label="กำลังโหลดแดชบอร์ด">
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div className="dov-skeleton__bone" style={{ width: 200, height: 24, marginBottom: 8 }} />
          <div className="dov-skeleton__bone" style={{ width: 140, height: 16 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="dov-skeleton__bone" style={{ width: 90, height: 44, borderRadius: 6 }} />
          <div className="dov-skeleton__bone" style={{ width: 140, height: 44, borderRadius: 6 }} />
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="dov-skeleton__bone" style={{ height: 140 }} />
        ))}
      </div>

      {/* Min stock card */}
      <div className="dov-skeleton__bone" style={{ height: 300, marginBottom: 16 }} />

      {/* Recent activity */}
      <div className="dov-skeleton__bone" style={{ height: 240 }} />
    </div>
  )
}
