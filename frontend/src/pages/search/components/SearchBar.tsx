// ============================================================
//  src/pages/search/components/SearchBar.tsx
// ============================================================

import { Search, X } from 'lucide-react'

interface Props {
  query: string
  onChange: (value: string) => void
  onClear: () => void
}

export default function SearchBar({ query, onChange, onClear }: Props) {
  return (
    <div style={{ position: 'relative', maxWidth: 560, marginBottom: 24 }}>
      <Search size={18} style={{
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
        color: 'var(--text-secondary)',
      }} />
      <input
        type="text"
        placeholder="พิมพ์หมายเลข Unit เช่น U001, A002..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        style={{
          width: '100%', padding: '14px 40px 14px 44px',
          border: '2px solid var(--border, #E4E4E7)',
          borderRadius: 'var(--radius-lg, 10px)',
          fontSize: 16, background: 'var(--surface, #fff)',
          color: 'var(--text-primary)',
          transition: 'border-color 0.15s',
          outline: 'none',
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary, #2563EB)'}
        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border, #E4E4E7)'}
      />
      {query && (
        <button onClick={onClear} style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        }}>
          <X size={16} color="var(--text-secondary)" />
        </button>
      )}
    </div>
  )
}