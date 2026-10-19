// ============================================================
//  src/pages/storage/index.tsx
// ============================================================

import useStorage from './services/useStorage'
import StorageNewBoxForm from './components/StorageNewBoxForm'
import StorageBoxList from './components/StorageBoxList'
import StorageToast from './components/StorageToast'
import BarcodeLabel from './components/BarcodeLabel'

const StoragePage = () => {
  const {
    boxes,
    loading,
    form,
    scannedUnits,
    unitInput,
    submitting,
    toast,
    availableShelves,
    boxLabel,
    printData,
    handleFormChange,
    setUnitInput,
    handleAddUnit,
    handleUnitKeyDown,
    handleRemoveUnit,
    handleSubmit,
    handlePrintBox,
    closePrint,
    dismissToast,
  } = useStorage()

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>

      <StorageToast toast={toast} onDismiss={dismissToast} />

      {/* Barcode print modal */}
      {printData && (
        <BarcodeLabel data={printData} onClose={closePrint} />
      )}

      {/* Subtitle */}
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
        รันหมายเลขกล่องอัตโนมัติ และพิมพ์บาร์โค้ด
      </p>

      <StorageNewBoxForm
        form={form}
        boxLabel={boxLabel}
        scannedUnits={scannedUnits}
        unitInput={unitInput}
        submitting={submitting}
        availableShelves={availableShelves}
        onFormChange={handleFormChange}
        onUnitInputChange={setUnitInput}
        onAddUnit={handleAddUnit}
        onUnitKeyDown={handleUnitKeyDown}
        onRemoveUnit={handleRemoveUnit}
        onSubmit={handleSubmit}
      />

      <StorageBoxList
        boxes={boxes}
        loading={loading}
        onPrintBox={handlePrintBox}
      />
    </div>
  )
}

export default StoragePage