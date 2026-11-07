// frontend/src/pages/ExtBlood/components/ExtPagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
interface Props { page: number; totalPages: number; totalItems: number; onPageChange: (p: number) => void }
export default function ExtPagination({ page, totalPages, totalItems, onPageChange }: Props) {
  if (totalPages <= 1) return null
  const pages: number[] = []
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pages.push(i)
  return (
    <div className="ext-pagination">
      <span className="ext-pagination-info">ทั้งหมด {totalItems.toLocaleString()} รายการ</span>
      <div className="ext-pagination-controls">
        <button className="ext-pagination-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={16} /></button>
        {pages.map(p => <button key={p} className={`ext-pagination-btn ${p === page ? 'ext-pagination-btn--active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>)}
        <button className="ext-pagination-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight size={16} /></button>
      </div>
    </div>
  )
}
