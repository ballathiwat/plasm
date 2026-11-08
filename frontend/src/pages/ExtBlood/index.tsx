// frontend/src/pages/ExtBlood/index.tsx

import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Button from '../../components/common/Button'
import Toast from '../../components/common/Toast'
import { ConfirmModal } from '../../components/common/Modal'
import useExtBlood from './services/useExtBlood'
import type { TabKey } from './services/useExtBlood'
import ExtSummaryCards from './components/ExtSummaryCards'
import ExtFilterBar from './components/ExtFilterBar'
import ExtTable from './components/ExtTable'
import ExtMobileCards from './components/ExtMobileCards'
import ExtPagination from './components/ExtPagination'
import ExtBatchBar from './components/ExtBatchBar'
import ExtEmptyState from './components/ExtEmptyState'
import ExtLoadingSkeleton from './components/ExtLoadingSkeleton'
import ExtDetailModal from './components/ExtDetailModal'
import ExtApproveModal from './components/ExtApproveModal'
import ExtExportModal from './components/ExtExportModal'
import '../../assets/styles/ext-blood.css'
import '../../assets/styles/ext-committee.css'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'MINE', label: 'รอฉันอนุมัติ' },
  { key: 'ALL', label: 'ทั้งหมด' },
  { key: 'DRAFT', label: 'ร่าง' },
  { key: 'PENDING', label: 'รออนุมัติ' },
  { key: 'APPROVED', label: 'อนุมัติแล้ว' },
  { key: 'REJECTED', label: 'ไม่อนุมัติ' },
  { key: 'EXPORTED', label: 'นำออกแล้ว' },
]

export default function ExtBloodPage() {
  const navigate = useNavigate()
  const h = useExtBlood()
  const count = (k: TabKey) => (k === 'MINE' ? h.counts.mine : h.counts.byStatus[k] ?? 0)
  const rowProps = {
    documents: h.documents, userId: h.user.id, isAdmin: h.user.role === 'ADMIN',
    onViewDetail: h.openDetail, onApprove: h.openApprove, onExport: h.openExport,
    onEdit: (id: string) => navigate(`/ext-blood/${id}/edit`), onDelete: h.setDeleteDoc, onRecall: h.handleRecall,
  }

  return (
    <div className="ext-blood-page" style={{ animation: 'plasm-fade-in 0.2s ease', paddingBottom: h.selectedIds.length ? 72 : 0 }}>
      <Toast toast={h.toast} onDismiss={h.dismissToast} />

      <div className="ext-header">
        <p className="ext-subtitle" style={{ margin: 0, alignSelf: 'center' }}>บันทึก ตรวจสอบ อนุมัติ และนำออกถุงเลือดจากศูนย์บริการโลหิตภายนอก</p>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate('/ext-blood/create')}>บันทึกรับเลือด</Button>
      </div>

      {h.summary && <ExtSummaryCards summary={h.summary} activeTab={h.activeTab} onSelect={h.setActiveTab} />}

      <div className="ext-tabs" role="tablist">
        {TABS.map((t) => {
          const n = count(t.key), on = h.activeTab === t.key
          return (
            <button key={t.key} role="tab" aria-selected={on} className={`ext-tab ${on ? 'ext-tab--active' : ''}`} onClick={() => h.setActiveTab(t.key)}>
              {t.label}
              <span className={`ext-tab-count ${t.key === 'MINE' && n > 0 ? 'ext-tab-count--alert' : ''}`}>{n}</span>
            </button>
          )
        })}
      </div>

      <ExtFilterBar filter={h.filter} sources={h.sources} bloodProducts={h.bloodProducts} onFilter={h.setFilter} />

      {h.loading ? <ExtLoadingSkeleton /> : h.documents.length === 0 ? (
        h.activeTab === 'MINE'
          ? <div className="ext-empty"><p className="ext-empty-text">ไม่มีเอกสารรอคุณอนุมัติ</p><p className="ext-empty-hint">เมื่อมีคนเพิ่มคุณเป็นคณะกรรมการ เอกสารจะแสดงที่นี่</p></div>
          : <ExtEmptyState />
      ) : (
        <>
          <div className="ext-desktop-only">
            <ExtTable {...rowProps} selectedIds={h.selectedIds} onToggleSelect={h.toggleSelect} onToggleSelectAll={h.toggleSelectAll} isMine={h.isMine} />
          </div>
          <div className="ext-mobile-only"><ExtMobileCards {...rowProps} /></div>
          <ExtPagination page={h.filter.page || 1} totalPages={h.totalPages} totalItems={h.totalItems} onPageChange={h.setPage} />
        </>
      )}

      {h.selectedIds.length > 0 && <ExtBatchBar count={h.selectedIds.length} onApprove={() => h.openApprove()} onClear={h.clearSelection} />}

      {h.showDetailModal && h.detailDoc && <ExtDetailModal doc={h.detailDoc} onClose={h.closeDetail} />}
      {h.showApproveModal && (
        <ExtApproveModal doc={h.detailDoc} userId={h.user.id} selectedCount={h.selectedIds.length}
          onDecide={h.handleDecide} onBatchApprove={h.handleBatchApprove} onClose={h.closeApprove} />
      )}
      {h.showExportModal && h.detailDoc && <ExtExportModal doc={h.detailDoc} exportReasons={h.exportReasons} onExport={h.handleExportBags} onClose={h.closeExport} />}
      <ConfirmModal open={!!h.deleteDoc} onClose={() => h.setDeleteDoc(null)} onConfirm={h.handleDelete} type="danger"
        title="ลบเอกสารร่าง?" message={h.deleteDoc ? `ลบ ${h.deleteDoc.docNumber} (${h.deleteDoc.bagCount} ถุง) — ลบแล้วกู้คืนไม่ได้` : ''} confirmText="ลบเอกสาร" />
    </div>
  )
}
