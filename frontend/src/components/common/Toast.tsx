// ============================================================
//  src/components/common/Toast.tsx
//  Unified toast notification — replaces per-page toast variants
// ============================================================

import { useEffect } from 'react'

// ── Types (shared across the app) ──

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastState {
  type: ToastType
  msg: string
}

// ── Props ──

export interface ToastProps {
  toast: ToastState | null
  onDismiss?: () => void
  /** ms before auto-dismiss; 0 = stays until closed manually. Default 4000. */
  autoHide?: number
  /** 'light' = white surface + coloured icon; 'filled' = coloured background. Default 'light'. */
  variant?: 'light' | 'filled'
  /** Default 'top-right'. 'none' = position:relative (inline). */
  placement?: 'top-right' | 'bottom-center' | 'none'
  /** Default 312 */
  width?: number | string
}

// ── Icon per type (paths from toast.fig) ──

const ICON_META: Record<ToastType, { viewBox: string; d: string }> = {
  success: {
    viewBox: '0 0 19.375 19.375',
    d: 'M19.375 9.688C19.375 15.038 15.038 19.375 9.688 19.375C4.337 19.375 0 15.038 0 9.688C0 4.337 4.337 0 9.688 0C15.038 0 19.375 4.337 19.375 9.688ZM8.567 14.817L15.754 7.629C15.999 7.385 15.999 6.99 15.754 6.746L14.871 5.862C14.627 5.618 14.231 5.618 13.987 5.862L8.125 11.723L5.388 8.987C5.144 8.743 4.749 8.743 4.504 8.987L3.621 9.871C3.376 10.115 3.376 10.51 3.621 10.754L7.683 14.817C7.927 15.061 8.323 15.061 8.567 14.817Z',
  },
  error: {
    viewBox: '0 0 20 20',
    d: 'M20 10C20 15.524 15.522 20 10 20C4.478 20 0 15.524 0 10C0 4.479 4.478 0 10 0C15.522 0 20 4.479 20 10ZM10 12.016C8.976 12.016 8.145 12.847 8.145 13.871C8.145 14.895 8.976 15.726 10 15.726C11.024 15.726 11.855 14.895 11.855 13.871C11.855 12.847 11.024 12.016 10 12.016ZM8.239 5.349L8.538 10.833C8.552 11.089 8.764 11.29 9.021 11.29H10.979C11.236 11.29 11.448 11.089 11.462 10.833L11.761 5.349C11.776 5.072 11.555 4.839 11.278 4.839H8.722C8.445 4.839 8.224 5.072 8.239 5.349Z',
  },
  warning: {
    viewBox: '0 0 21.111 18.765',
    d: 'M20.874 16.127C21.55 17.3 20.701 18.765 19.35 18.765H1.761C0.407 18.765-0.438 17.297 0.237 16.127L9.032 0.879C9.709-0.294 11.404-0.292 12.079 0.879L20.874 16.127ZM10.556 12.975C9.624 12.975 8.87 13.729 8.87 14.66C8.87 15.592 9.624 16.346 10.556 16.346C11.487 16.346 12.242 15.592 12.242 14.66C12.242 13.729 11.487 12.975 10.556 12.975ZM8.955 6.914L9.227 11.899C9.239 12.132 9.432 12.315 9.666 12.315H11.445C11.679 12.315 11.872 12.132 11.884 11.899L12.156 6.914C12.17 6.662 11.969 6.451 11.717 6.451H9.394C9.142 6.451 8.941 6.662 8.955 6.914Z',
  },
  info: {
    viewBox: '0 0 19.375 19.375',
    d: 'M9.688 0C4.338 0 0 4.339 0 9.688C0 15.039 4.338 19.375 9.688 19.375C15.037 19.375 19.375 15.039 19.375 9.688C19.375 4.339 15.037 0 9.688 0ZM9.688 4.297C10.594 4.297 11.328 5.031 11.328 5.938C11.328 6.844 10.594 7.578 9.688 7.578C8.781 7.578 8.047 6.844 8.047 5.938C8.047 5.031 8.781 4.297 9.688 4.297ZM11.875 14.219C11.875 14.478 11.665 14.688 11.406 14.688H7.969C7.71 14.688 7.5 14.478 7.5 14.219V13.281C7.5 13.022 7.71 12.813 7.969 12.813H8.438V10.313H7.969C7.71 10.313 7.5 10.103 7.5 9.844V8.906C7.5 8.647 7.71 8.438 7.969 8.438H10.469C10.728 8.438 10.938 8.647 10.938 8.906V12.813H11.406C11.665 12.813 11.875 13.022 11.875 13.281V14.219Z',
  },
}

/** Standalone icon — can be used outside a Toast if needed. */
export function ToastIcon({ type, color }: { type?: ToastType; color?: string }) {
  const safe: ToastType = type && ICON_META[type] ? type : 'success'
  const meta = ICON_META[safe]
  return (
    <svg
      width={24}
      height={24}
      viewBox={meta.viewBox}
      fill={color || 'currentColor'}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d={meta.d} />
    </svg>
  )
}

// ── Close icon (16×16) ──

function CloseIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 3L13 13M13 3L3 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ── Component ──

export default function Toast({
  toast,
  onDismiss,
  autoHide = 4000,
  variant = 'light',
  placement = 'top-right',
  width = 312,
}: ToastProps) {
  // Auto-hide
  useEffect(() => {
    if (!toast || !onDismiss || autoHide <= 0) return
    const t = setTimeout(onDismiss, autoHide)
    return () => clearTimeout(t)
  }, [toast, onDismiss, autoHide])

  if (!toast) return null

  const safeType: ToastType = ICON_META[toast.type] ? toast.type : 'success'

  // a11y
  const isUrgent = safeType === 'error' || safeType === 'warning'
  const role = isUrgent ? 'alert' : 'status'
  const ariaLive = safeType === 'error' ? 'assertive' : 'polite'

  // colour tokens
  const iconColor =
    variant === 'filled'
      ? `var(--toast-${safeType}-on)`
      : `var(--toast-${safeType}-icon)`
  const textColor =
    variant === 'filled'
      ? `var(--toast-${safeType}-on)`
      : 'var(--toast-text)'
  const closeColor =
    variant === 'filled'
      ? `var(--toast-${safeType}-on)`
      : 'var(--toast-close)'
  const bg =
    variant === 'filled'
      ? `var(--toast-${safeType}-fill)`
      : 'var(--toast-surface)'
  const shadow =
    variant === 'filled'
      ? 'inset 0 0 0 1px rgba(0,0,0,0.2), var(--toast-shadow)'
      : 'inset 0 0 0 1px var(--toast-border), var(--toast-shadow)'

  // position
  const posStyle: React.CSSProperties =
    placement === 'top-right'
      ? { position: 'fixed', top: 16, right: 16, zIndex: 1100 }
      : placement === 'bottom-center'
        ? { position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1100 }
        : { position: 'relative' }

  return (
    <div
      role={role}
      aria-live={ariaLive}
      style={{
        ...posStyle,
        width,
        maxWidth: 'calc(100vw - 32px)',
        minHeight: 64,
        boxSizing: 'border-box',
        padding: '20px 12px',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        background: bg,
        boxShadow: shadow,
        color: textColor,
        animation: 'plasm-fade-in 0.2s ease',
      }}
    >
      {/* Left group: icon + message */}
      <div style={{ display: 'flex', gap: 8, minWidth: 0, alignItems: 'center' }}>
        <span style={{ color: iconColor, display: 'flex' }}>
          <ToastIcon type={safeType} />
        </span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 500,
            lineHeight: 1.25,
            overflowWrap: 'anywhere',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {toast.msg}
        </span>
      </div>

      {/* Close button */}
      {onDismiss && (
        <button
          type="button"
          aria-label="ปิดการแจ้งเตือน"
          onClick={onDismiss}
          style={{
            width: 24,
            height: 24,
            margin: -4,
            padding: 0,
            background: 'none',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            color: closeColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  )
}
