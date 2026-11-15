// ============================================================
//  frontend/src/pages/storage/components/StorageSummaryCards.tsx
//  การ์ดสรุป 4 ใบ — คลิกแล้วสลับแท็บ (ใช้ class การ์ดร่วมกับ ExtBlood)
// ============================================================

import { Droplets, PackageCheck, PackageMinus, PackageOpen, type LucideIcon } from 'lucide-react'
import type { StorageSummary, StorageTab } from '../services/StorageType'

interface CardDef {
  key: keyof StorageSummary
  label: string
  unit: string
  icon: LucideIcon
  tone: 'stored' | 'partial' | 'empty' | 'units'
  tab: StorageTab
}

const CARDS: CardDef[] = [
  { key: 'stored', label: 'กล่องเก็บอยู่', unit: 'กล่อง', icon: PackageCheck, tone: 'stored', tab: 'STORED' },
  { key: 'partial', label: 'นำออกบางส่วน', unit: 'กล่อง', icon: PackageMinus, tone: 'partial', tab: 'PARTIAL' },
  { key: 'empty', label: 'นำออกหมดแล้ว', unit: 'กล่อง', icon: PackageOpen, tone: 'empty', tab: 'EMPTY' },
  { key: 'unitsStored', label: 'Units ในคลัง', unit: 'units', icon: Droplets, tone: 'units', tab: 'ALL' },
]

interface Props {
  summary: StorageSummary
  activeTab: StorageTab
  onSelect: (tab: StorageTab) => void
}

export default function StorageSummaryCards({ summary, activeTab, onSelect }: Props) {
  return (
    <div className="ext-summary-grid sto-summary">
      {CARDS.map((c) => {
        const Icon = c.icon
        const value = summary[c.key]
        const active = c.tab !== 'ALL' && activeTab === c.tab
        return (
          <button
            key={c.key}
            type="button"
            className={`ext-summary-card ext-summary-card--btn sto-summary__card sto-summary__card--${c.tone} ${active ? 'is-active' : ''}`}
            aria-pressed={active}
            aria-label={`${c.label} ${value.toLocaleString()} ${c.unit} — ดูรายการ`}
            onClick={() => onSelect(c.tab)}
          >
            <div className="ext-summary-icon sto-summary__icon"><Icon size={20} /></div>
            <div className="sto-summary__text">
              <div className="ext-summary-value">
                {value.toLocaleString()} <span className="sto-summary__unit">{c.unit}</span>
              </div>
              <div className="ext-summary-label">{c.label}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
