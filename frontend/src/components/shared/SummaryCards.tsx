// frontend/src/components/shared/SummaryCards.tsx

import type { SummaryCardData } from '../../types/models'

interface SummaryCardsProps {
  cards: SummaryCardData[]
}

export default function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            style={{
              background: '#fff',
              border: '1px solid #DDE3EA',
              borderRadius: 8,
              padding: 20,
              boxShadow: '0 1px 3px rgba(26,35,50,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                }}
              >
                <Icon size={18} />
              </div>
              <span style={{ fontSize: 13, color: '#5A6A7E' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1 }}>{card.value}</div>
            {card.sub && (
              <div style={{ fontSize: 12, color: '#5A6A7E', marginTop: 4 }}>{card.sub}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
