// ============================================================
//  src/pages/storage/index.tsx
// ============================================================

import useStorage from "./services/useStorage";
import StorageNewBoxForm from "./components/StorageNewBoxForm";
import StorageBoxList from "./components/StorageBoxList";
import StorageToast from "./components/StorageToast";
import BarcodeLabel from "./components/BarcodeLabel";

const StoragePage = () => {
  const {
    boxes,
    loading,
    form,
    master,
    scannedUnits,
    unitInput,
    submitting,
    toast,
    availableShelves,
    nextLabel,
    printData,
    handleFormChange,
    handleQuickAdd,
    setUnitInput,
    handleAddUnit,
    handleUnitKeyDown,
    handleRemoveUnit,
    handleSubmit,
    handlePrintBox,
    handleEditUnits,
    handleEditLocation,
    closePrint,
    dismissToast,
  } = useStorage();

  return (
    <div style={{ animation: "plasm-fade-in 0.2s ease" }}>
      <StorageToast toast={toast} onDismiss={dismissToast} />

      {printData && <BarcodeLabel data={printData} onClose={closePrint} />}

      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 16,
        }}
      >
        รันหมายเลขกล่องอัตโนมัติ และพิมพ์บาร์โค้ด
      </p>

      <StorageNewBoxForm
        form={form}
        master={master}
        nextLabel={nextLabel}
        scannedUnits={scannedUnits}
        unitInput={unitInput}
        submitting={submitting}
        availableShelves={availableShelves}
        onFormChange={handleFormChange}
        onQuickAdd={handleQuickAdd}
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
        onEditUnits={handleEditUnits}
        onEditLocation={handleEditLocation}
       zones={master.zones}
      />
    </div>
  );
};

export default StoragePage;
