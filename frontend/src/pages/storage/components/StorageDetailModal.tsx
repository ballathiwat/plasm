// ============================================================
//  frontend/src/pages/storage/components/StorageDetailModal.tsx
//  รายละเอียดกล่อง: ข้อมูลกล่อง + รายการ units
// ============================================================

import { Pencil, Printer } from 'lucide-react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import StatusBadge from '../../../components/shared/StatusBadge'
import { formatThaiDate } from '../../ExtBlood/services/extHelpers'
import { positionLabel } from '../../../helpers/rack'
import type { StorageListItem } from '../services/StorageType'
import StorageStatusBadge from './StorageStatusBadge'

interface Props {
  box: StorageListItem
  onClose: () => void
  onPrint: (box: StorageListItem) => void
  onEdit: (box: StorageListItem) => void
  onMove: (box: StorageListItem) => void
}

export default function StorageDetailModal({ box, onClose, onPrint, onEdit, onMove }: Props) {
  const hasUnits = box.storedCount > 0
  const withdrawn = box.unitCount - box.storedCount

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={<span className="sto-modal-title"><span className="sto-mono">{box.boxLabel}</span><StorageStatusBadge state={box.state} /></span>}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>ปิด</Button>
          {hasUnits && <Button variant="outline" icon={<Pencil size={14} />} onClick={() => onEdit(box)}>แก้ไข units</Button>}
          <Button variant="primary" icon={<Printer size={14} />} onClick={() => onPrint(box)}>พิมพ์ฉลาก</Button>
        </>
      }
    >
      <dl className="sto-detail__grid">
        <div>
          <dt>ชนิด / หมู่เลือด</dt>
          <dd className="sto-detail__inline">{box.type} <StatusBadge blood={box.blood} /></dd>
        </div>
        <div>
          <dt>วันที่เก็บ</dt>
          <dd>{formatThaiDate(box.collectionDate)}</dd>
        </div>
        <div>
          <dt>ชื่อกล่อง</dt>
          <dd>{box.boxName || '—'}</dd>
        </div>
        <div>
          <dt>ตำแหน่ง</dt>
          <dd>
            {box.zoneName ? `${box.zoneName} · ` : ''}{positionLabel(box)}
            {hasUnits && <button type="button" className="sto-inline-link" onClick={() => onMove(box)}>ย้าย</button>}
          </dd>
        </div>
      </dl>

      <div className="sto-detail__head">
        <h4 className="sto-detail__heading">Units</h4>
        <span className="sto-muted">เก็บอยู่ {box.storedCount} · นำออก {withdrawn}</span>
      </div>
      {box.unitItems.length === 0 ? (
        <p className="sto-muted">ไม่มี unit ในกล่องนี้</p>
      ) : (
        <ol className="sto-detail__units">
          {box.unitItems.map((u, i) => (
            <li key={u.unitNumber} className={`sto-detail__unit ${u.status === 'withdrawn' ? 'is-out' : ''}`}>
              <span className="sto-detail__seq">{i + 1}</span>
              <span className="sto-mono sto-detail__no">{u.unitNumber}</span>
              {u.status === 'withdrawn' && <span className="sto-detail__tag">นำออก</span>}
            </li>
          ))}
        </ol>
      )}
    </Modal>
  )
}
