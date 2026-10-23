// ============================================================
//  src/pages/search/components/SearchResults.tsx
// ============================================================

import { Package, MapPin, Calendar, Droplets, Search } from 'lucide-react'
import type { SearchBoxGroup } from '../services/SearchType'
import {groupSurface, groupInk } from '../../../helpers/blood'
import { zoneLabel } from '../../../helpers/zone'



interface Props {
  boxGroups: SearchBoxGroup[]
  totalUnits: number
  query: string
  searched: boolean
  loading: boolean
}

export default function SearchResults({ boxGroups, totalUnits, query, searched, loading }: Props) {

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังค้นหา...</div>
  }

  if (searched && totalUnits === 0) {
    return (
      <div style={{
        background: 'var(--surface, #fff)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg, 10px)', padding: 40, textAlign: 'center',
      }}>
        <Search size={40} style={{ opacity: 0.15, marginBottom: 12 }} />
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
          ไม่พบ Unit ที่ตรงกับ "{query}"
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          ลองตรวจสอบหมายเลข Unit อีกครั้ง
        </p>
      </div>
    )
  }

  if (!searched) {
    return (
      <div style={{
        background: 'var(--surface, #fff)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg, 10px)', padding: 60, textAlign: 'center',
      }}>
        <Search size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
          พิมพ์หมายเลข Unit หรือหมายเลขกล่อง เพื่อค้นหา
        </p>
      </div>
    )
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
        พบ {totalUnits} units ใน {boxGroups.length} กล่อง
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {boxGroups.map(({ box, units }) => (
          <div key={box.id} style={{
            background: 'var(--surface, #fff)',
            border: '1px solid var(--border, #E4E4E7)',
            borderRadius: 'var(--radius-lg, 10px)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
            animation: 'plasm-fade-in 0.15s ease',
          }}>
            {/* Box header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface-raised, #F4F4F5)',
            }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: '50%',
                background: groupSurface(box.blood), color: groupInk(box.blood),
                fontSize: 14, fontWeight: 700, flexShrink: 0,
              }}>{box.blood}</span>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {box.boxLabel}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Droplets size={11} /> {box.type}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <MapPin size={11} /> {zoneLabel(box.zoneName, box.location)} · ชั้น {box.shelf}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Calendar size={11} /> จัดเก็บ {new Date(box.collectionDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </span>
                </div>
              </div>

              <span style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600,
                color: box.status === 'stored' ? '#16A34A' : '#DC2626',
                padding: '4px 10px', borderRadius: 99,
                background: box.status === 'stored' ? '#F0FDF4' : '#FEF2F2',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: box.status === 'stored' ? '#16A34A' : '#DC2626' }} />
                {box.status === 'stored' ? 'เก็บอยู่' : 'นำออกแล้ว'}
              </span>
            </div>

            {/* Matching units */}
            <div style={{ padding: '10px 20px 14px' }}>
              {units.map((unit) => {
                const isStored = unit.status === 'stored'
                return (
                  <div key={unit.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Package size={14} style={{ color: 'var(--text-secondary)' }} />
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600,
                        background: '#FEFCE8', padding: '2px 6px', borderRadius: 4,
                      }}>
                        {unit.unitNumber}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 500,
                      color: isStored ? '#16A34A' : '#DC2626',
                    }}>
                      {isStored ? 'เก็บอยู่' : 'นำออกแล้ว'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}