// ============================================================
//  src/pages/search/services/useSearch.ts
// ============================================================

import { useState, useRef, useMemo } from 'react'
import searchService from './SearchService'
import type { SearchUnitResult, SearchBoxGroup } from './SearchType'

export default function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchUnitResult[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const doSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchService.searchUnits(q.trim())
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setSearched(false)
  }

  // Group results by box
  const boxGroups: SearchBoxGroup[] = useMemo(() => {
    const map: Record<string, SearchBoxGroup> = {}
    for (const unit of results) {
      if (!map[unit.box.id]) {
        map[unit.box.id] = { box: unit.box, units: [] }
      }
      map[unit.box.id].units.push(unit)
    }
    return Object.values(map)
  }, [results])

  return {
    query,
    results,
    searched,
    loading,
    boxGroups,
    handleQueryChange,
    clearSearch,
  }
}