// ============================================================
//  src/pages/map/index.tsx
// ============================================================

import { useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowDownUp, Map as MapIcon } from 'lucide-react'
import useMap from './services/useMap'
import useMapAge from './services/useMapAge'
import MapZoneCard from './components/MapZoneCard'
import MapFilterBar from './components/MapFilterBar'
import MapSummaryCards from './components/MapSummaryCards'
import MapAgeTable from './components/MapAgeTable'
import './map.css'

type MapTab = 'map' | 'age'

const TABS: { key: MapTab; label: string; icon: ReactNode }[] = [
  { key: 'map', label: 'แผนผัง', icon: <MapIcon size={16} /> },
  { key: 'age', label: 'เก่าสุด / ใหม่สุด', icon: <ArrowDownUp size={16} /> },
]

const MapPage = () => {
  const { zones, rawBoxes, rawZones, bloodOrder, totalBoxes, totalUnits, loading, error } = useMap()
  const age = useMapAge({ boxes: rawBoxes, zones: rawZones })
  const [tab, setTab] = useState<MapTab>('map')

  if (loading) {
    return <div className="map-empty">กำลังโหลด...</div>
  }

  return (
    <div className="map-page">
      {/* Header */}
      <div className="map-page__header">
        <h2 className="map-page__title">แผนผังจัดเก็บ</h2>
        <p className="map-page__desc">ภาพรวมตำแหน่งจัดเก็บพลาสมา</p>
      </div>

      {/* Tabs */}
      <div className="map-tabs" role="tablist" aria-label="มุมมองแผนผังจัดเก็บ">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`map-tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`map-panel-${t.key}`}
            className={`map-tab${tab === t.key ? ' map-tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span aria-hidden="true">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="map-error" role="alert">
          {error}
        </div>
      )}

      {/* Tab content: แผนผัง */}
      {tab === 'map' && (
        <div role="tabpanel" id="map-panel-map" aria-labelledby="map-tab-map">
          {zones.length === 0 ? (
            <div className="map-empty">ยังไม่มีสถานที่จัดเก็บ — เพิ่มได้ที่ ตั้งค่า › สถานที่จัดเก็บ</div>
          ) : (
            <div className="map-zone-grid">
              {zones.map((z) => (
                <MapZoneCard key={z.id} zone={z} bloodOrder={bloodOrder} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab content: เก่าสุด / ใหม่สุด */}
      {tab === 'age' && (
        <div role="tabpanel" id="map-panel-age" aria-labelledby="map-tab-age">
          <MapSummaryCards inBoxes={totalBoxes} inUnits={totalUnits} ext={age.extTotals} />
          <MapFilterBar
            source={age.source}
            draft={age.draft}
            isDirty={age.isDirty}
            canClear={age.canClear}
            busy={age.busy}
            onSourceChange={age.setSource}
            onBloodChange={age.setBlood}
            onTypeChange={age.setType}
            onSearch={age.applyFilters}
            onClear={age.clearFilters}
          />
          {age.error ? (
            <div className="map-error" role="alert">
              {age.error}
            </div>
          ) : (
            <MapAgeTable
              source={age.source}
              rows={age.rows}
              hasFilter={age.hasFilter}
              busy={age.busy}
              onClear={age.clearFilters}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default MapPage
