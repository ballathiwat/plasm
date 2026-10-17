// frontend/src/components/shared/ContentCard.tsx

interface ContentCardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export default function ContentCard({ title, children, className = '' }: ContentCardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--space-5)',
      }}
    >
      {title && (
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
