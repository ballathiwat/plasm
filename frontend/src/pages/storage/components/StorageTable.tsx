// ============================================================
//  frontend/src/pages/storage/components/StorageTable.tsx
//  ตารางรายการกล่อง + pagination
// ============================================================

import { ChevronLeft, ChevronRight, Eye, MapPin, Pencil, Printer } from 'lucide-react'
import Button from '../../../components/common/Button'
import StatusBadge from '../../../components/shared/StatusBadge'
import ExtRowMenu, { type RowMenuItem } from '../../ExtBlood/components/ExtRowMenu'
import { formatThaiDate } from '../../ExtBlood/services/extHelpers'
import { BOX_CAPACITY, positionLabel } from '../../../helpers/rack'
import type { StorageListItem } from '../services/StorageType'
import StorageStatusBadge from './StorageStatusBadge'

interface RowHandlers {
  onDetail: (box: StorageListItem) => void
  onPrint: (box: StorageListItem) => void
  onEdit: (box: StorageListItem) => void
  onMove: (box: StorageListItem) => void
}

interface Props extends RowHandlers {
  items: StorageListItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
}

/** แถบ 12 ช่อง: เก็บอยู่ / นำออกแล้ว / ช่องว่าง */
function StockBar({ box }: { box: StorageListItem }) {
  const cells = Array.from({ length: Math.max(BOX_CAPACITY, box.unitItems.length) }, (_, i) => box.unitItems[i]?.status)
  return (
    <span className="sto-stock__bar" aria-hidden="true">
      {cells.map((s, i) => (
        <span key={i} className={`sto-stock__cell ${s === 'stored' ? 'is-stored' : s === 'withdrawn' ? 'is-out' : ''}`} />
      ))}
    </span>
  )
}

function RowActions({ box, onDetail, onPrint, onEdit, onMove }: RowHandlers & { box: StorageListItem }) {
  const hasUnits = box.storedCount > 0
  const more: RowMenuItem[] = hasUnits
    ? [
        { icon: <Eye size={15} />, label: 'ดูรายละเอียด', onClick: () => onDetail(box) },
        { icon: <Pencil size={15} />, label: 'แก้ไข units', onClick: () => onEdit(box) },
        { icon: <MapPin size={15} />, label: 'ย้ายตำแหน่ง', onClick: () => onMove(box) },
      ]
    : [{ icon: <Printer size={15} />, label: 'พิมพ์ฉลาก', onClick: () => onPrint(box) }]

  return (
    <div className="sto-actions">
      {hasUnits
        ? <Button size="sm" variant="outline" icon={<Printer size={14} />} onClick={() => onPrint(box)}>พิมพ์ฉลาก</Button>
        : <Button size="sm" variant="ghost" icon={<Eye size={14} />} onClick={() => onDetail(box)}>ดู</Button>}
      <ExtRowMenu items={more} />
    </div>
  )
}

function Pagination({ page, pageSize, total, totalPages, onPageChange }: Pick<Props, 'page' | 'pageSize' | 'total' | 'totalPages' | 'onPageChange'>) {
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const pages: number[] = []
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pages.push(i)

  return (
    <nav className="ext-pagination" aria-label="เปลี่ยนหน้ารายการกล่อง">
      <span className="ext-pagination-info">แสดง {from.toLocaleString()}–{to.toLocaleString()} จาก {total.toLocaleString()} กล่อง</span>
      {totalPages > 1 && (
        <div className="ext-pagination-controls">
          <button type="button" className="ext-pagination-btn" aria-label="หน้าก่อนหน้า" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft size={16} />
          </button>
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              className={`ext-pagination-btn ${p === page ? 'ext-pagination-btn--active' : ''}`}
              aria-label={`หน้า ${p}`}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}
          <button type="button" className="ext-pagination-btn" aria-label="หน้าถัดไป" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </nav>
  )
}

export default function StorageTable({ items, page, pageSize, total, totalPages, onPageChange, ...handlers }: Props) {
  return (
    <>
      <div className="ext-table-wrap">
        <table className="ext-table sto-table">
          <thead>
            <tr>
              <th>หมายเลขกล่อง</th><th>วันที่เก็บ</th><th>ชนิด</th><th>หมู่</th>
              <th>ตำแหน่ง</th><th>คงคลัง</th><th>สถานะ</th><th className="sto-table__actions">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id} className={b.state === 'EMPTY' ? 'sto-row--empty' : ''}>
                <td>
                  <button type="button" className="sto-box-link" onClick={() => handlers.onDetail(b)}>{b.boxLabel}</button>
                  {b.boxName && <div className="sto-sub">{b.boxName}</div>}
                  {b.matchedUnit && <div className="sto-sub">พบ unit <b className="sto-mono">{b.matchedUnit}</b></div>}
                </td>
                <td className="sto-nowrap">{formatThaiDate(b.collectionDate)}</td>
                <td>{b.type}</td>
                <td><StatusBadge blood={b.blood} /></td>
                <td>
                  <div className="sto-nowrap">{positionLabel(b)}</div>
                  {b.zoneName && <div className="sto-sub">{b.zoneName}</div>}
                </td>
                <td>
                  <div className="sto-nowrap"><b>{b.storedCount}</b><span className="sto-muted"> / {b.unitCount} units</span></div>
                  <StockBar box={b} />
                </td>
                <td><StorageStatusBadge state={b.state} /></td>
                <td><RowActions box={b} {...handlers} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageSize={pageSize} total={total} totalPages={totalPages} onPageChange={onPageChange} />
    </>
  )
}
