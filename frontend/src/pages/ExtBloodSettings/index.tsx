// frontend/src/pages/ExtBloodSettings/index.tsx
import { Loader2 } from 'lucide-react'
import useExtSettings from './services/useExtSettings'
import ExtSettingsList from './components/ExtSettingsList'
import '../../assets/styles/ext-blood-settings.css'

export default function ExtBloodSettingsPage() {
  const h = useExtSettings()

  if (h.loading) {
    return (
      <div className="ext-form-loading">
        <Loader2 size={32} className="ext-spin" color="var(--primary)" />
      </div>
    )
  }

  return (
    <div className="ext-settings-page" style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <h2 className="ext-title">ตั้งค่า — รับเลือดจากภายนอก</h2>

      <div className="ext-settings-grid">
        <ExtSettingsList
          title="สถานที่ส่งเลือด"
          items={h.sourceItems}
          onAdd={h.addSource}
          onUpdate={(id, d) => h.updateSource(id, d)}
          onDelete={h.deleteSource}
          onReorder={h.reorderSources}
          hasLocked
        />

        <ExtSettingsList
          title="ตำแหน่งจัดเก็บ"
          items={h.storageItems}
          onAdd={h.addStorage}
          onUpdate={(id, d) => h.updateStorage(id, d)}
          onDelete={h.deleteStorage}
          onReorder={h.reorderStorages}
        />

        <ExtSettingsList
          title="ชนิดเลือด"
          placeholder="รหัสชนิดเลือด เช่น LDRC"
          items={h.productItems}
          onAdd={h.addProduct}
          onUpdate={(id, d) => h.updateProduct(id, d)}
          onDelete={h.deleteProduct}
          onReorder={h.reorderProducts}
        />

        <ExtSettingsList
          title="เหตุผลการนำออก"
          items={h.reasonItems}
          onAdd={h.addReason}
          onUpdate={(id, d) => h.updateReason(id, d)}
          onDelete={h.deleteReason}
          onReorder={h.reorderReasons}
        />
      </div>
    </div>
  )
}
