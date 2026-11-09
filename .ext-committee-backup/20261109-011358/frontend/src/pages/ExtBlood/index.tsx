// frontend/src/pages/ExtBlood/index.tsx

import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Button from '../../components/common/Button'
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

const TABS: { key: TabKey; label: string }[] = [
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

  return (
    <div className="ext-blood-page" style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      {/* Header */}
      <div className="ext-header">
        <div>
          <h2 className="ext-title">รับเลือดจากภายนอก</h2>
          <p className="ext-subtitle">บันทึก ตรวจสอบ อนุมัติ และนำออกถุงเลือดจากศูนย์บริการโลหิตภายนอก</p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate('/ext-blood/create')}>
          บันทึกรับเลือด
        </Button>
      </div>

      {/* Summary Cards */}
      {h.summary && <ExtSummaryCards summary={h.summary} />}

      {/* Tabs */}
      <div className="ext-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`ext-tab ${h.activeTab === t.key ? 'ext-tab--active' : ''}`}
            onClick={() => h.setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter */}
      <ExtFilterBar
        filter={h.filter}
        sources={h.sources}
        bloodProducts={h.bloodProducts}
        onFilter={h.setFilter}
      />

      {/* Content */}
      {h.loading ? (
        <ExtLoadingSkeleton />
      ) : h.documents.length === 0 ? (
        <ExtEmptyState />
      ) : (
        <>
          <div className="ext-desktop-only">
            <ExtTable
              documents={h.documents}
              selectedIds={h.selectedIds}
              onToggleSelect={h.toggleSelect}
              onToggleSelectAll={h.toggleSelectAll}
              onViewDetail={h.openDetail}
              onApprove={h.openApprove}
              onExport={h.openExport}
              onDelete={h.handleDelete}
              onEdit={id => navigate(`/ext-blood/${id}/edit`)}
              activeTab={h.activeTab}
            />
          </div>
          <div className="ext-mobile-only">
            <ExtMobileCards
              documents={h.documents}
              onViewDetail={h.openDetail}
              onApprove={h.openApprove}
              onExport={h.openExport}
              onEdit={id => navigate(`/ext-blood/${id}/edit`)}
            />
          </div>
          <ExtPagination
            page={h.filter.page || 1}
            totalPages={h.totalPages}
            totalItems={h.totalItems}
            onPageChange={h.setPage}
          />
        </>
      )}

      {/* Batch Bar */}
      {h.selectedIds.length > 0 && (
        <ExtBatchBar count={h.selectedIds.length} onApprove={h.openApprove} onClear={h.clearSelection} />
      )}

      {/* Modals */}
      {h.showDetailModal && h.detailDoc && (
        <ExtDetailModal doc={h.detailDoc} onClose={h.closeDetail} />
      )}
      {h.showApproveModal && (
        <ExtApproveModal
          doc={h.detailDoc}
          selectedIds={h.selectedIds}
          onApprove={h.handleApprove}
          onReject={h.handleReject}
          onBatchApprove={h.handleBatchApprove}
          onBatchReject={h.handleBatchReject}
          onClose={h.closeApprove}
        />
      )}
      {h.showExportModal && h.detailDoc && (
        <ExtExportModal
          doc={h.detailDoc}
          exportReasons={h.exportReasons}
          onExport={h.handleExportBags}
          onClose={h.closeExport}
        />
      )}
    </div>
  )
}
