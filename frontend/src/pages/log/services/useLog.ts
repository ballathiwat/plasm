// ============================================================
//  src/pages/log/services/useLog.ts
// ============================================================

import { useState, useCallback, useRef } from "react";
import logService from "./LogService";
import type { LogEntryItem, LogFilters } from "./LogType";

/* ---------- helpers: วันแรก/วันสุดท้ายของเดือน ---------- */
function monthStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function monthEnd(): string {
  const d = new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
}

/* ---------- ค่าเริ่มต้น ---------- */
const INITIAL_FILTERS: LogFilters = {
  action: "",
  blood: "",
  dateFrom: monthStart(),
  dateTo: monthEnd(),
};

const PAGE_SIZE = 30;

export default function useLog() {
  const [entries, setEntries] = useState<LogEntryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<LogFilters>(INITIAL_FILTERS);
  const [hasMore, setHasMore] = useState(true);
  const [searched, setSearched] = useState(false); // เคยกดค้นหาหรือยัง
  const reqId = useRef(0);

  /* snapshot ของ filters ที่ใช้ค้นหาล่าสุด (สำหรับ loadMore) */
  const activeFilters = useRef<LogFilters>(INITIAL_FILTERS);

  const loadLog = useCallback(
    async (offset: number, filtersToUse: LogFilters) => {
      const id = ++reqId.current;
      setLoading(true);
      try {
        const params: Record<string, string> = {
          limit: String(PAGE_SIZE),
          offset: String(offset),
        };
        if (filtersToUse.action) params.action = filtersToUse.action;
        if (filtersToUse.blood) params.blood = filtersToUse.blood;
        if (filtersToUse.dateFrom) params.dateFrom = filtersToUse.dateFrom;
        if (filtersToUse.dateTo) params.dateTo = filtersToUse.dateTo;

        const data = await logService.getLog(params);
        if (id !== reqId.current) return;

        setEntries((prev) => (offset === 0 ? data : [...prev, ...data]));
        setHasMore(data.length >= PAGE_SIZE);
      } catch {
        if (id === reqId.current && offset === 0) setEntries([]);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    },
    [],
  );

  /* ── กดปุ่มค้นหา ── */
  const search = useCallback(() => {
    activeFilters.current = { ...filters };
    setSearched(true);
    loadLog(0, filters);
  }, [filters, loadLog]);

  /* ── กดปุ่มล้าง → รีเซ็ตเป็นค่าเริ่มต้น แล้วค้นหาใหม่ ── */
  const resetFilters = useCallback(() => {
    const fresh = {
      ...INITIAL_FILTERS,
      dateFrom: monthStart(),
      dateTo: monthEnd(),
    };
    setFilters(fresh);
    activeFilters.current = fresh;
    setSearched(true);
    loadLog(0, fresh);
  }, [loadLog]);

  const handleFilterChange = (field: keyof LogFilters, value: string) => {
    setFilters((f) => ({ ...f, [field]: value }));
  };

  const loadMore = () => {
    if (!loading) loadLog(entries.length, activeFilters.current);
  };

  /* ── client-side date filter (ถ้า backend ยังไม่รองรับ) ── */
  const filteredEntries = entries.filter((e) => {
    const d = e.timestamp.split("T")[0];
    if (activeFilters.current.dateFrom && d < activeFilters.current.dateFrom) return false;
    if (activeFilters.current.dateTo && d > activeFilters.current.dateTo) return false;
    return true;
  });

  return {
    entries: filteredEntries,
    loading,
    filters,
    hasMore,
    searched,
    handleFilterChange,
    resetFilters,
    search,
    loadMore,
  };
}