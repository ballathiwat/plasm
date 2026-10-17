// frontend/src/components/shared/PageHeader.tsx

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
      <div>
        <h2 style={{ font: "600 26px 'IBM Plex Sans Thai',sans-serif", lineHeight: 1.3 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 14, color: '#5A6A7E', marginTop: 4 }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
