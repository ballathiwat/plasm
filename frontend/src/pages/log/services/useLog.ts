// ============================================================
//  src/pages/log/services/useLog.ts
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import logService from './LogService'
import type { LogEntryItem, LogFilters } from './LogType'

const INITIAL_FILTERS: LogFilters = {
  action: '',
  blood: '',
  dateFrom: '',
  dateTo: '',
}

const PAGE_SIZE = 30

export default function useLog() {
  const [entries, setEntries] = useState<LogEntryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<LogFilters>(INITIAL_FILTERS)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const loadLog = useCallback(async (reset = false) => {
    setLoading(true)
    try {
      const offset = reset ? 0 : page * PAGE_SIZE
      const params: Record<string, string> = {
        limit: String(PAGE_SIZE),
        offset: String(offset),
      }
      if (filters.action) params.action = filters.action
      if (filters.blood) params.blood = filters.blood

      const data = await logService.getLog(params)

      if (reset) {
        setEntries(data)
        setPage(0)
      } else {
        setEntries((prev) => reset ? data : [...prev, ...data])
      }
      setHasMore(data.length >= PAGE_SIZE)
    } catch {
      if (reset) setEntries([])
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  // Load on mount + filter change
  useEffect(() => { loadLog(true) }, [filters.action, filters.blood])

  const handleFilterChange = (field: keyof LogFilters, value: string) => {
    setFilters((f) => ({ ...f, [field]: value }))
  }

  const resetFilters = () => setFilters(INITIAL_FILTERS)

  const loadMore = () => {
    setPage((p) => p + 1)
    loadLog(false)
  }

  // Client-side date filter (backend doesn't support date range yet)
  const filteredEntries = entries.filter((e) => {
    if (filters.dateFrom) {
      const entryDate = e.timestamp.split('T')[0]
      if (entryDate < filters.dateFrom) return false
    }
    if (filters.dateTo) {
      const entryDate = e.timestamp.split('T')[0]
      if (entryDate > filters.dateTo) return false
    }
    return true
  })

  return {
    entries: filteredEntries,
    loading,
    filters,
    hasMore,
    handleFilterChange,
    resetFilters,
    loadMore,
  }
}
