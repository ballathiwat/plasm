// frontend/src/components/shared/StatusBadge.tsx
interface StatusBadgeProps {
  blood: string
  label?: string
}

export default function StatusBadge({ blood, label }: StatusBadgeProps) {
  return (
    <span
      className="blood-badge"
      data-blood={blood}
      style={{ padding: '2px 10px', fontSize: 12 }}
    >
      {label || blood}
    </span>
  )
}