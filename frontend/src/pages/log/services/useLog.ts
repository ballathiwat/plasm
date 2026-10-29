// ============================================================
//  src/pages/log/services/useLog.ts
// ============================================================

import { useState, useCallback, useRef } from "react";
import logService from "./LogService";
import type { LogEntryItem, LogFilters } from "./LogType";
import type { PaginationInfo } from "../../../components/shared/Pagination";

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

const DEFAULT_PAGE_SIZE = 20;

export default function useLog() {
  const [entries, setEntries] = useState<LogEntryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<LogFilters>(INITIAL_FILTERS);
  const [searched, setSearched] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const reqId = useRef(0);

  /* snapshot ของ filters ที่ใช้ค้นหาล่าสุด */
  const activeFilters = useRef<LogFilters>(INITIAL_FILTERS);

  const loadLog = useCallback(
    async (page: number, pageSize: number, filtersToUse: LogFilters) => {
      const id = ++reqId.current;
      setLoading(true);
      try {
        const params: Record<string, string> = {
          page: String(page),
          pageSize: String(pageSize),
        };
        if (filtersToUse.action) params.action = filtersToUse.action;
        if (filtersToUse.blood) params.blood = filtersToUse.blood;
        if (filtersToUse.dateFrom) params.dateFrom = filtersToUse.dateFrom;
        if (filtersToUse.dateTo) params.dateTo = filtersToUse.dateTo;

        const res = await logService.getLog(params);
        if (id !== reqId.current) return;

        setEntries(res.data);
        setPagination({
          page: res.page,
          pageSize: res.pageSize,
          total: res.total,
          totalPages: res.totalPages,
        });
      } catch {
        if (id === reqId.current) {
          setEntries([]);
          setPagination((p) => ({ ...p, total: 0, totalPages: 0 }));
        }
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
    loadLog(1, pagination.pageSize, filters);
  }, [filters, pagination.pageSize, loadLog]);

  /* ── กดปุ่มล้าง ── */
  const resetFilters = useCallback(() => {
    const fresh = {
      ...INITIAL_FILTERS,
      dateFrom: monthStart(),
      dateTo: monthEnd(),
    };
    setFilters(fresh);
    activeFilters.current = fresh;
    setSearched(true);
    loadLog(1, DEFAULT_PAGE_SIZE, fresh);
  }, [loadLog]);

  const handleFilterChange = (field: keyof LogFilters, value: string) => {
    setFilters((f) => ({ ...f, [field]: value }));
  };

  /* ── เปลี่ยนหน้า ── */
  const goToPage = useCallback(
    (page: number) => {
      loadLog(page, pagination.pageSize, activeFilters.current);
    },
    [pagination.pageSize, loadLog],
  );

  /* ── เปลี่ยนจำนวนต่อหน้า ── */
  const changePageSize = useCallback(
    (size: number) => {
      setPagination((p) => ({ ...p, pageSize: size }));
      loadLog(1, size, activeFilters.current);
    },
    [loadLog],
  );

  return {
    entries,
    loading,
    filters,
    searched,
    pagination,
    handleFilterChange,
    resetFilters,
    search,
    goToPage,
    changePageSize,
  };
}
