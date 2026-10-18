// ============================================================
//  src/pages/search/index.tsx
// ============================================================

import useSearch from './services/useSearch'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'

const SearchPage = () => {
  const {
    query,
    results,
    searched,
    loading,
    boxGroups,
    handleQueryChange,
    clearSearch,
  } = useSearch()

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>ค้นหา Unit</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          ค้นหาด้วยหมายเลข Unit เพื่อดูว่าอยู่กล่องไหน ตำแหน่งไหน
        </p>
      </div>

      <SearchBar
        query={query}
        onChange={handleQueryChange}
        onClear={clearSearch}
      />

      <SearchResults
        boxGroups={boxGroups}
        totalUnits={results.length}
        query={query}
        searched={searched}
        loading={loading}
      />
    </div>
  )
}

export default SearchPage