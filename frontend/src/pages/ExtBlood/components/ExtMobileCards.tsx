// frontend/src/pages/ExtBlood/components/ExtMobileCards.tsx
import Button from '../../../components/common/Button'
import { formatThaiDate, bloodGroupClass } from '../services/extHelpers'
import { rowActions, ExtProgress, type ExtRowHandlers } from './ExtTable'
import ExtRowMenu from './ExtRowMenu'

export default function ExtMobileCards({ documents, ...h }: ExtRowHandlers) {
  return (
    <div className="ext-mobile-cards">{documents.map((d) => {
      const { mine, primary, more } = rowActions(d, h)
      return (
        <div key={d.id} className={`ext-mobile-card ${mine ? 'ext-row-mine' : ''}`} onClick={() => h.onViewDetail(d)}>
          <div className="ext-mobile-card-header">
            <span className="ext-mobile-card-docno">{d.docNumber}</span>
            <ExtProgress doc={d} userId={h.userId} />
          </div>
          <div className="ext-mobile-card-body">
            <div className="ext-mobile-card-row"><span className="ext-mobile-card-label">วันที่รับ</span><span>{formatThaiDate(d.receivedDate)}</span></div>
            <div className="ext-mobile-card-row"><span className="ext-mobile-card-label">สถานที่</span><span className="ext-cell-ellipsis">{d.source.name}</span></div>
            <div className="ext-mobile-card-row"><span className="ext-mobile-card-label">ชนิด/หมู่</span><span>{d.bloodProduct.code} <span className={`blood-badge ${bloodGroupClass(d.bloodGroup)}`} style={{ padding: '1px 6px', fontSize: 11 }}>{d.bloodGroup}</span></span></div>
            <div className="ext-mobile-card-row"><span className="ext-mobile-card-label">คงคลัง</span><span>{d.bagRemaining} / {d.bagCount} ถุง</span></div>
          </div>
          <div className="ext-mobile-card-footer" onClick={(e) => e.stopPropagation()}>
            <Button size="md" block variant={primary.variant} icon={primary.icon} onClick={primary.onClick}>{primary.label}</Button>
            <ExtRowMenu items={more} />
          </div>
        </div>
      )
    })}</div>
  )
}
