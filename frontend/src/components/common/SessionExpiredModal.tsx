// components/common/SessionExpiredModal.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

export default function SessionExpiredModal() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const show = () => setOpen(true) // เปิดซ้ำก็ยังเป็น modal เดียว
    window.addEventListener('plasm:session-expired', show)
    return () => window.removeEventListener('plasm:session-expired', show)
  }, [])

  const goLogin = () => {
    clearInstanceToken()
    setOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <Modal
      open={open}
      onClose={goLogin}
      title="Session หมดอายุ"
      titleIcon={<Clock size={18} />}
      size="sm"
      hideClose
      closeOnOverlay={false}
      closeOnEsc={false}
      footer={<Button onClick={goLogin}>เข้าสู่ระบบใหม่</Button>}
    >
      <p>ไม่ได้ใช้งานนานเกินกำหนด กรุณาเข้าสู่ระบบอีกครั้ง</p>
    </Modal>
  )
}