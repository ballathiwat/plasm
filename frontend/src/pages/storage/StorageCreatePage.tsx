// ============================================================
//  frontend/src/pages/storage/StorageCreatePage.tsx
//  หน้าฟอร์มจัดเก็บ (/storage/new)
//  ส่วน A: ย้ายฟอร์มเดิม (StorageNewBoxForm) มาไว้ที่ route นี้โดยไม่เปลี่ยนพฤติกรรม
//  ส่วน B จะเขียน layout ใหม่ (timeline + การ์ดสรุป) แทนไฟล์นี้
// ============================================================

import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useStorage from './services/useStorage'
import StorageNewBoxForm from './components/StorageNewBoxForm'
import BarcodeLabel from './components/BarcodeLabel'
import Button from '../../components/common/Button'
import Toast from '../../components/common/Toast'
import '../../assets/styles/ext-blood.css'
import '../../assets/styles/storage.css'

const StorageCreatePage = () => {
  const navigate = useNavigate()
  const s = useStorage()

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <Toast toast={s.toast} onDismiss={s.dismissToast} />
      {s.printData && <BarcodeLabel data={s.printData} onClose={s.closePrint} />}

      <div className="ext-header" style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
        <Button variant="outline" icon={<ArrowLeft size={18} />} aria-label="กลับไปรายการกล่อง" onClick={() => navigate('/storage')} />
        <p className="sto-header__desc">กรอกข้อมูลกล่อง เลือกตำแหน่ง แล้วสแกนถุง — ระบบรันหมายเลขกล่องให้อัตโนมัติ</p>
      </div>

      <StorageNewBoxForm
        form={s.form}
        master={s.master}
        nextLabel={s.nextLabel}
        scannedUnits={s.scannedUnits}
        unitInput={s.unitInput}
        submitting={s.submitting}
        availableShelves={s.availableShelves}
        onFormChange={s.handleFormChange}
        onQuickAdd={s.handleQuickAdd}
        onUnitInputChange={s.setUnitInput}
        onAddUnit={s.handleAddUnit}
        onUnitKeyDown={s.handleUnitKeyDown}
        onRemoveUnit={s.handleRemoveUnit}
        onSubmit={s.handleSubmit}
        isRackZone={s.isRackZone}
        rackLevel={s.rackLevel}
        rackPosition={s.rackPosition}
        freeSlots={s.freeSlots}
        onRackLevelChange={s.setRackLevel}
        onRackPositionChange={s.setRackPosition}
      />
    </div>
  )
}

export default StorageCreatePage
