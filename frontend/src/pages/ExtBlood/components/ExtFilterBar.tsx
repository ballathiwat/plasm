// frontend/src/pages/ExtBlood/components/ExtFilterBar.tsx
import { Search, X } from 'lucide-react'
import type { ExtListFilter, ExtSource, ExtBloodProduct } from '../services/ExtBloodType'

const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-']

interface Props {
  filter: ExtListFilter; sources: ExtSource[]; bloodProducts: ExtBloodProduct[]
  onFilter: (f: Partial<ExtListFilter>) => void
}

export default function ExtFilterBar({ filter, sources, bloodProducts, onFilter }: Props) {
  const has = filter.dateFrom || filter.dateTo || filter.sourceId || filter.bloodProductId || filter.bloodGroup || filter.search
  return (
    <div className="ext-filter-bar">
      <div className="ext-filter-search">
        <Search size={16} className="ext-filter-search-icon" />
        <input type="text" placeholder="ค้นหาเลขเอกสาร, เลขถุงเลือด..." value={filter.search || ''}
          onChange={e => onFilter({ search: e.target.value })} className="ext-filter-search-input" />
      </div>
      <div className="ext-filter-group">
        <input type="date" value={filter.dateFrom || ''} onChange={e => onFilter({ dateFrom: e.target.value })} className="ext-filter-input" />
        <span className="ext-filter-dash">–</span>
        <input type="date" value={filter.dateTo || ''} onChange={e => onFilter({ dateTo: e.target.value })} className="ext-filter-input" />
      </div>
      <select value={filter.sourceId || ''} onChange={e => onFilter({ sourceId: e.target.value || undefined })} className="ext-filter-select">
        <option value="">สถานที่ทั้งหมด</option>
        {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <select value={filter.bloodProductId || ''} onChange={e => onFilter({ bloodProductId: e.target.value || undefined })} className="ext-filter-select">
        <option value="">ชนิดเลือดทั้งหมด</option>
        {bloodProducts.map(b => <option key={b.id} value={b.id}>{b.code}{b.name ? ` (${b.name})` : ''}</option>)}
      </select>
      <select value={filter.bloodGroup || ''} onChange={e => onFilter({ bloodGroup: e.target.value || undefined })} className="ext-filter-select">
        <option value="">หมู่เลือดทั้งหมด</option>
        {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
      {has && <button className="ext-filter-clear" onClick={() => onFilter({ dateFrom: undefined, dateTo: undefined, sourceId: undefined, bloodProductId: undefined, bloodGroup: undefined, search: undefined })}><X size={14} /> ล้าง</button>}
    </div>
  )
}
