// frontend/src/components/common/Modal.tsx
//
// Reusable Modal — overlay + panel, sizes, confirm variant
// CSS: src/assets/styles/components/modal.css
//
// Usage:
//   <Modal open={open} onClose={close} title="บันทึกข้อมูล">
//     <p>เนื้อหา</p>
//   </Modal>
//
//   <Modal open={open} onClose={close} title="บันทึก" footer={<Button onClick={save}>ตกลง</Button>}>
//     ...
//   </Modal>
//
//   <ConfirmModal open={open} onClose={close} onConfirm={handleDelete}
//     type="danger" title="ลบกล่อง?" message="ลบแล้วไม่สามารถกู้คืนได้" confirmText="ลบ" />

import { useEffect, useCallback, type ReactNode } from 'react'
import { X, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react'
import Button from './Button'
import '../../assets/styles/components/modal.css'

/* ----------------------------------------------------------
   Types
---------------------------------------------------------- */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ModalProps {
  /** Show/hide */
  open: boolean
  /** Called when overlay click or close button */
  onClose: () => void
  /** Modal title (optional — omit for custom header) */
  title?: ReactNode
  /** Title icon (left of title) */
  titleIcon?: ReactNode
  /** Panel size */
  size?: ModalSize
  /** Footer content — typically buttons */
  footer?: ReactNode
  /** Footer alignment */
  footerAlign?: 'right' | 'left' | 'between'
  /** Close on overlay click (default: true) */
  closeOnOverlay?: boolean
  /** Close on Escape key (default: true) */
  closeOnEsc?: boolean
  /** Hide X close button */
  hideClose?: boolean
  /** Extra className on panel */
  className?: string
  children?: ReactNode
}

export type ConfirmType = 'warning' | 'danger' | 'info' | 'success'

export interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  type?: ConfirmType
  title: string
  message: ReactNode
  confirmText?: string
  cancelText?: string
  loading?: boolean
  size?: ModalSize
}

/* ----------------------------------------------------------
   Icons for confirm variant
---------------------------------------------------------- */
const CONFIRM_ICONS: Record<ConfirmType, ReactNode> = {
  warning: <AlertTriangle size={20} />,
  danger: <AlertCircle size={20} />,
  info: <Info size={20} />,
  success: <CheckCircle2 size={20} />,
}

const CONFIRM_BTN_VARIANT: Record<ConfirmType, 'danger' | 'primary' | 'success'> = {
  warning: 'primary',
  danger: 'danger',
  info: 'primary',
  success: 'success',
}

/* ----------------------------------------------------------
   Modal
---------------------------------------------------------- */
export default function Modal({
  open,
  onClose,
  title,
  titleIcon,
  size = 'md',
  footer,
  footerAlign = 'right',
  closeOnOverlay = true,
  closeOnEsc = true,
  hideClose = false,
  className = '',
  children,
}: ModalProps) {
  // Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') onClose()
    },
    [closeOnEsc, onClose],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prev
    }
  }, [open, handleKeyDown])

  if (!open) return null

  const footerCls = [
    'plasm-modal__footer',
    footerAlign === 'left' && 'plasm-modal__footer--left',
    footerAlign === 'between' && 'plasm-modal__footer--between',
  ].filter(Boolean).join(' ')

  return (
    <div
      className="plasm-modal-overlay"
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        className={`plasm-modal plasm-modal--${size} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || !hideClose) && (
          <div className="plasm-modal__header">
            {title ? (
              <h3 className="plasm-modal__title">
                {titleIcon}
                {title}
              </h3>
            ) : (
              <div />
            )}
            {!hideClose && (
              <button className="plasm-modal__close" onClick={onClose}>
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={`plasm-modal__body ${!title && hideClose ? 'plasm-modal__body--no-header' : ''}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && <div className={footerCls}>{footer}</div>}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------
   ConfirmModal — pre-built confirm/alert dialog
---------------------------------------------------------- */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  type = 'warning',
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  loading = false,
  size = 'sm',
}: ConfirmModalProps) {
  // Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prev
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="plasm-modal-overlay" onClick={onClose}>
      <div
        className={`plasm-modal plasm-modal--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confirm body */}
        <div className="plasm-modal__confirm-body">
          <div className={`plasm-modal__confirm-icon plasm-modal__confirm-icon--${type}`}>
            {CONFIRM_ICONS[type]}
          </div>
          <div className="plasm-modal__confirm-text">
            <h4>{title}</h4>
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
        </div>

        {/* Footer */}
        <div className="plasm-modal__footer">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={CONFIRM_BTN_VARIANT[type]}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}