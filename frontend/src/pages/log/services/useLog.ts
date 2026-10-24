// ============================================================
//  src/pages/log/services/useLog.ts
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";
import logService from "./LogService";
import type { LogEntryItem, LogFilters } from "./LogType";

const INITIAL_FILTERS: LogFilters = {
  action: "",
  blood: "",
  dateFrom: "",
  dateTo: "",
};

const PAGE_SIZE = 30;

export default function useLog() {
  const [entries, setEntries] = useState<LogEntryItem[]>([]); // ข้อมูลดิบจาก server
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LogFilters>(INITIAL_FILTERS);
  const [hasMore, setHasMore] = useState(true);
  const reqId = useRef(0); // กันคำตอบเก่าทับของใหม่

  const loadLog = useCallback(
    async (offset: number) => {
      const id = ++reqId.current;
      setLoading(true);
      try {
        const params: Record<string, string> = {
          limit: String(PAGE_SIZE),
          offset: String(offset),
        };
        if (filters.action) params.action = filters.action;
        if (filters.blood) params.blood = filters.blood;
        if (filters.dateFrom) params.dateFrom = filters.dateFrom; // เพิ่ม
        if (filters.dateTo) params.dateTo = filters.dateTo; // เพิ่ม

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
    [filters.action, filters.blood, filters.dateFrom, filters.dateTo],
  );

  // โหลดใหม่เมื่อเปลี่ยนตัวกรอง
  useEffect(() => {
    loadLog(0);
  }, [loadLog]);

  const handleFilterChange = (field: keyof LogFilters, value: string) => {
    setFilters((f) => ({ ...f, [field]: value }));
  };

  const resetFilters = () => setFilters(INITIAL_FILTERS);

  const loadMore = () => {
    if (!loading) loadLog(entries.length);
  };

  // Client-side date filter (backend ยังไม่รองรับช่วงวันที่)
  const filteredEntries = entries.filter((e) => {
    const entryDate = e.timestamp.split("T")[0];
    if (filters.dateFrom && entryDate < filters.dateFrom) return false;
    if (filters.dateTo && entryDate > filters.dateTo) return false;
    return true;
  });

  return {
    entries: filteredEntries,
    loading,
    filters,
    hasMore,
    handleFilterChange,
    resetFilters,
    loadMore,
  };
}
