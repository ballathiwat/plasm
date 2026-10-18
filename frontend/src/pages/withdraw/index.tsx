// ============================================================
//  src/pages/withdraw/index.tsx
// ============================================================

import useWithdraw from './services/useWithdraw'
import WithdrawBoxList from './components/WithdrawBoxList'
import WithdrawBoxDetail from './components/WithdrawBoxDetail'
import { WithdrawToast, WithdrawConfirmDialog } from './components/WithdrawConfirmModal'

const WithdrawPage = () => {
  const {
    filteredBoxes,
    selectedBox,
    loading,
    loadingDetail,
    withdrawingBox,
    withdrawingUnits,
    toast,
    confirmAction,
    searchQuery,
    filterBlood,
    setSearchQuery,
    setFilterBlood,
    openBoxDetail,
    closeBoxDetail,
    handleWithdrawBox,
    handleWithdrawUnit,
    cancelConfirm,
    dismissToast,
  } = useWithdraw()

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>

      <WithdrawToast toast={toast} onDismiss={dismissToast} />
      <WithdrawConfirmDialog action={confirmAction} onCancel={cancelConfirm} />

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>นำออกพลาสมา</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          เลือกกล่องเพื่อนำออกทั้งกล่อง หรือเลือกนำออกรายถุง
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Left — Box List */}
        <WithdrawBoxList
          boxes={filteredBoxes}
          loading={loading}
          selectedBoxId={selectedBox?.id}
          searchQuery={searchQuery}
          filterBlood={filterBlood}
          onSearchChange={setSearchQuery}
          onFilterBloodChange={setFilterBlood}
          onSelectBox={openBoxDetail}
        />

        {/* Right — Box Detail */}
        <div style={{ flex: '1 1 360px', minWidth: 0 }}>
          <WithdrawBoxDetail
            box={selectedBox}
            loadingDetail={loadingDetail}
            withdrawingBox={withdrawingBox}
            withdrawingUnits={withdrawingUnits}
            onClose={closeBoxDetail}
            onWithdrawBox={handleWithdrawBox}
            onWithdrawUnit={handleWithdrawUnit}
          />
        </div>
      </div>
    </div>
  )
}

export default WithdrawPage