// frontend/src/pages/ExtBloodForm/index.tsx
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
export default function ExtBloodFormPage() {
  const navigate = useNavigate()
  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease', maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate('/ext-blood')} style={{ width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',background:'var(--surface)',cursor:'pointer' }}><ArrowLeft size={18} /></button>
        <h2 className="ext-title">บันทึกรับเลือดจากภายนอก</h2>
      </div>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:40, textAlign:'center', color:'var(--text-secondary)' }}>
        ฟอร์มบันทึกรับเลือด — อยู่ระหว่างพัฒนา (Patch ถัดไป)
      </div>
    </div>
  )
}
