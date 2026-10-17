// frontend/src/components/shared/StatusBadge.tsx

import type { BloodGroup } from '../../types/models'

const BLOOD_STYLES: Record<BloodGroup, { bg: string; color: string }> = {
  A:  { bg: '#fde8e8', color: 'var(--color-blood-a)' },
  B:  { bg: '#dbeafe', color: 'var(--color-blood-b)' },
  O:  { bg: '#d1fae5', color: '#059669' },
  AB: { bg: '#ede9fe', color: 'var(--color-blood-ab)' },
}

interface StatusBadgeProps {
  blood: BloodGroup
  label?: string
}

export default function StatusBadge({ blood, label }: StatusBadgeProps) {
  const s = BLOOD_STYLES[blood]
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: 12,
        fontWeight: 600,
        background: s.bg,
        color: s.color,
      }}
    >
      {label || blood}
    </span>
  )
}
