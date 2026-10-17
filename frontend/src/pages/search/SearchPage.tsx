// frontend/src/pages/search/SearchPage.tsx

import { Search } from 'lucide-react'

export default function SearchPage() {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Search size={18} style={{ color: 'var(--color-primary)' }} />
        ค้นหา Unit
      </h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>ค้นหาว่า Unit อยู่กล่องไหน ตำแหน่งไหน</p>
    </div>
  )
}
