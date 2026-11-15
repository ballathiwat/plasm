// ============================================================
//  frontend/src/pages/storage/index.tsx
//  หน้ารายการกล่อง (/storage) — เรียก hook + ส่ง props
// ============================================================

import { useNavigate } from 'react-router-dom'
import { PackageSearch, Plus, RotateCcw, SearchX, TriangleAlert, X } from 'lucide-react'
import Button from '../../components/common/Button'
import Toast from '../../components/common/Toast'
import useStorageList, { STORAGE_PAGE_SIZE, hasActiveFilter } from './services/useStorageList'
import storageService from './services/StorageService'
import type { StorageSummary, StorageTab } from './services/StorageType'
import BarcodeLabel from './components/BarcodeLabel'
import StorageSummaryCards from './components/StorageSummaryCards'
import StorageFilterBar from './components/StorageFilterBar'
import StorageTable from './components/StorageTable'
import StorageDetailModal from './components/StorageDetailModal'
import StorageEditUnitsModal from './components/StorageEditUnitsModal'
import StorageMoveModal from './components/StorageMoveModal'
import ExtLoadingSkeleton from '../ExtBlood/components/ExtLoadingSkeleton'
import '../../assets/styles/ext-blood.css'
import '../../assets/styles/ext-committee.css'
import '../../assets/styles/storage.css'

const TABS: { key: StorageTab; label: string; count: keyof StorageSummary }[] = [
  { key: 'ALL', label: 'ทั้งหมด', count: 'all' },
  { key: 'STORED', label: 'เก็บอยู่', count: 'stored' },
  { key: 'PARTIAL', label: 'นำออกบางส่วน', count: 'partial' },
  { key: 'EMPTY', label: 'นำออกหมดแล้ว', count: 'empty' },
]

const StoragePage = () => {
  const navigate = useNavigate()
  const h = useStorageList()
  const goCreate = () => navigate('/storage/new')
  const filtered = hasActiveFilter(h.filter) || h.tab !== 'ALL'
  const clearAll = () => { h.clearFilters(); h.setTab('ALL') }

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <Toast toast={h.toast} onDismiss={h.dismissToast} />
      {h.printData && <BarcodeLabel data={h.printData} onClose={h.closePrint} />}

      <div className="ext-header">
        <p className="sto-header__desc">จัดเก็บกล่องพลาสมา ติดตามตำแหน่ง และพิมพ์ฉลากบาร์โค้ด</p>
        <Button variant="primary" icon={<Plus size={18} />} onClick={goCreate}>จัดเก็บกล่องใหม่</Button>
      </div>

      <StorageSummaryCards summary={h.summary} activeTab={h.tab} onSelect={h.setTab} />

      <div className="ext-tabs sto-tabs" role="tablist" aria-label="สถานะกล่อง">
        {TABS.map((t) => {
          const on = h.tab === t.key
          return (
            <button key={t.key} type="button" role="tab" aria-selected={on} className={`ext-tab ${on ? 'ext-tab--active' : ''}`} onClick={() => h.setTab(t.key)}>
              {t.label}
              <span className="ext-tab-count">{h.tabCounts[t.count].toLocaleString()}</span>
            </button>
          )
        })}
      </div>

      <StorageFilterBar
        filter={h.filter}
        searchInput={h.searchInput}
        master={h.master}
        onSearchInput={h.setSearchInput}
        onFilter={h.setFilter}
        onClear={h.clearFilters}
      />

      {h.loading ? (
        <ExtLoadingSkeleton />
      ) : h.error ? (
        <div className="ext-empty" role="alert">
          <TriangleAlert size={48} strokeWidth={1.2} color="var(--stock-danger)" />
          <p className="ext-empty-text">โหลดรายการไม่สำเร็จ</p>
          <p className="ext-empty-hint">{h.error}</p>
          <div className="sto-empty__actions">
            <Button variant="outline" icon={<RotateCcw size={16} />} onClick={h.reload}>ลองอีกครั้ง</Button>
          </div>
        </div>
      ) : h.items.length === 0 ? (
        filtered ? (
          <div className="ext-empty">
            <SearchX size={48} strokeWidth={1.2} color="var(--text-disabled)" />
            <p className="ext-empty-text">ไม่พบกล่องที่ตรงกับเงื่อนไข</p>
            <div className="sto-empty__actions">
              <Button variant="outline" icon={<X size={16} />} onClick={clearAll}>ล้างตัวกรอง</Button>
            </div>
          </div>
        ) : (
          <div className="ext-empty">
            <PackageSearch size={48} strokeWidth={1.2} color="var(--text-disabled)" />
            <p className="ext-empty-text">ยังไม่มีกล่องในระบบ</p>
            <p className="ext-empty-hint">เริ่มจัดเก็บกล่องแรก แล้วพิมพ์ฉลากติดกล่อง</p>
            <div className="sto-empty__actions">
              <Button variant="primary" icon={<Plus size={18} />} onClick={goCreate}>จัดเก็บกล่องใหม่</Button>
            </div>
          </div>
        )
      ) : (
        <StorageTable
          items={h.items}
          page={h.page}
          pageSize={STORAGE_PAGE_SIZE}
          total={h.total}
          totalPages={h.totalPages}
          onPageChange={h.setPage}
          onDetail={h.setDetailBox}
          onPrint={h.handlePrint}
          onEdit={h.openEdit}
          onMove={h.openMove}
        />
      )}

      {h.detailBox && (
        <StorageDetailModal
          box={h.detailBox}
          onClose={() => h.setDetailBox(null)}
          onPrint={h.handlePrint}
          onEdit={h.openEdit}
          onMove={h.openMove}
        />
      )}
      {h.editBox && (
        <StorageEditUnitsModal
          box={h.editBox}
          removalReasons={h.removalReasons}
          onCheckUnit={storageService.checkUnit}
          onSave={h.handleSaveUnits}
          onClose={() => h.setEditBox(null)}
        />
      )}
      {h.moveBox && (
        <StorageMoveModal
          box={h.moveBox}
          zones={h.activeZones}
          onLoadRack={storageService.getRackSlots}
          onMove={h.handleMove}
          onClose={() => h.setMoveBox(null)}
        />
      )}
    </div>
  )
}

export default StoragePage
