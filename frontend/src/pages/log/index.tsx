// ============================================================
//  src/pages/log/index.tsx
// ============================================================

import { useEffect, useRef } from "react";
import useLog from "./services/useLog";
import LogFiltersBar from "./components/LogFiltersBar";
import LogTable from "./components/LogTable";

const LogPage = () => {
  const {
    entries,
    loading,
    filters,
    hasMore,
    searched,
    handleFilterChange,
    resetFilters,
    search,
    loadMore,
  } = useLog();

  /* เข้าหน้าครั้งแรก → auto search ด้วยค่าเริ่มต้น */
  const didInit = useRef(false);
  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      search();
    }
  }, [search]);

  return (
    <div style={{ animation: "plasm-fade-in 0.2s ease" }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
          ประวัติการจัดเก็บ/นำออก
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginTop: 4,
          }}
        >
          บันทึกทุกรายการจัดเก็บและนำออกพลาสมา
          {searched && <> · แสดง {entries.length} รายการ</>}
        </p>
      </div>

      <LogFiltersBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={resetFilters}
        onSearch={search}
        loading={loading}
      />

      <LogTable
        entries={entries}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  );
};

export default LogPage;