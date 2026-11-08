// frontend/src/pages/ExtBloodSettings/index.tsx
import { Loader2 } from 'lucide-react'
import useExtSettings from './services/useExtSettings'
import ExtSettingsList from './components/ExtSettingsList'
import '../../assets/styles/ext-blood-settings.css'

export default function ExtBloodSettingsPage() {
  const h = useExtSettings()
  if (h.loading) return <div className="ext-form-loading"><Loader2 size={32} className="ext-spin" color="var(--primary)" /></div>
  return (
    <div className="ext-settings-page" style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <h2 className="ext-title">ตั้งค่า — รับเลือดจากภายนอก</h2>
      <div className="ext-settings-grid">
        <ExtSettingsList title="สถานที่ส่งเลือด" items={h.sources} onAdd={h.addSource} onUpdate={(id, d) => h.updateSource(id, d)} onDelete={h.deleteSource} onReorder={h.reorderSources} hasLocked />
        <ExtSettingsList title="ตำแหน่งจัดเก็บ" items={h.storages} onAdd={h.addStorage} onUpdate={(id, d) => h.updateStorage(id, d)} onDelete={h.deleteStorage} onReorder={h.reorderStorages} />
      </div>
    </div>
  )
}
