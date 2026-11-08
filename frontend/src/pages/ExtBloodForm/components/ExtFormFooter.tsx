// frontend/src/pages/ExtBloodForm/components/ExtFormFooter.tsx — ใช้ในขั้นที่ 2
import { ChevronLeft, Save, Send } from 'lucide-react'
import Button from '../../../components/common/Button'

interface Props { saving: '' | 'draft' | 'submit'; members: number; onBack: () => void; onSaveDraft: () => void; onSubmit: () => void }

export default function ExtFormFooter({ saving, members, onBack, onSaveDraft, onSubmit }: Props) {
  return (
    <div className="ext-form-footer" style={{ position: 'static', margin: '8px 0 0', padding: '16px 0 0' }}>
      <div className="ext-form-footer-left">
        <Button variant="secondary" icon={<ChevronLeft size={16} />} onClick={onBack} disabled={!!saving}>ย้อนกลับ</Button>
      </div>
      <div className="ext-form-footer-right">
        <Button variant="ghost" icon={<Save size={16} />} onClick={onSaveDraft} loading={saving === 'draft'} disabled={!!saving}>บันทึกร่าง</Button>
        <Button variant="primary" icon={<Send size={16} />} onClick={onSubmit} loading={saving === 'submit'} disabled={!!saving || members === 0}>
          ส่งให้คณะกรรมการ{members ? ` (${members} คน)` : ''}
        </Button>
      </div>
    </div>
  )
}
