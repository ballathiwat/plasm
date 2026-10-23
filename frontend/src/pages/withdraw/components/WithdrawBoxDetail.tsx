// ============================================================
//  src/pages/withdraw/components/WithdrawBoxDetail.tsx
// ============================================================

import { PackageOpen, X, Package, Loader2 } from 'lucide-react'
import type { WithdrawBoxDetail as BoxDetailType } from '../services/WithdrawType'
import {groupSurface, groupInk } from '../../../helpers/blood'
import { zoneLabel } from '../../../helpers/zone'



interface Props {
  box: BoxDetailType | null
  loadingDetail: boolean
  withdrawingBox: boolean
  withdrawingUnits: Set<string>
  onClose: () => void
  onWithdrawBox: (box: BoxDetailType) => void
  onWithdrawUnit: (unitId: string, unitNumber: string) => void
}

export default function WithdrawBoxDetail({
  box, loadingDetail, withdrawingBox, withdrawingUnits,
  onClose, onWithdrawBox, onWithdrawUnit,
}: Props) {

  // Loading state
  if (loadingDetail) {
    return (
      <div style={{
        background: 'var(--surface, #fff)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg, 10px)', padding: 40,
        textAlign: 'center', color: 'var(--text-secondary)',
      }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 8 }}>กำลังโหลด...</p>
      </div>
    )
  }

  // Empty state
  if (!box) {
    return (
      <div style={{
        background: 'var(--surface, #fff)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg, 10px)', padding: 40,
        textAlign: 'center', color: 'var(--text-secondary)',
      }}>
        <Package size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
        <p style={{ fontSize: 14 }}>เลือกกล่องจากรายการด้านซ้าย</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>เพื่อดูรายละเอียดและนำออก</p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      animation: 'plasm-fade-in 0.2s ease',
      position: 'sticky', top: 16,
    }}>
      {/* Box header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: '50%',
            background: groupSurface(box.blood), color: groupInk(box.blood),
            fontSize: 15, fontWeight: 700,
          }}>{box.blood}</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {box.boxLabel}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {box.type} · {zoneLabel(box.zoneName, box.location)} · ชั้น {box.shelf}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        }}>
          <X size={18} color="var(--text-secondary)" />
        </button>
      </div>

      {/* Info row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 1, background: 'var(--border)',
      }}>
        {[
          { label: 'ทั้งหมด', value: box.unitCount },
          { label: 'เก็บอยู่', value: box.storedCount },
          { label: 'นำออกแล้ว', value: box.unitCount - box.storedCount },
        ].map((item) => (
          <div key={item.label} style={{
            background: 'var(--surface)', padding: '10px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{item.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Withdraw whole box button */}
      {box.status === 'stored' && box.storedCount > 0 && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => onWithdrawBox(box)}
            disabled={withdrawingBox}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: '10px 0',
              borderRadius: 'var(--radius-sm, 6px)',
              border: 'none', background: '#DC2626', color: '#fff',
              fontWeight: 600, fontSize: 14, cursor: withdrawingBox ? 'wait' : 'pointer',
              opacity: withdrawingBox ? 0.7 : 1,
            }}
          >
            <PackageOpen size={16} />
            {withdrawingBox ? 'กำลังนำออก...' : `นำออกทั้งกล่อง (${box.storedCount} units)`}
          </button>
        </div>
      )}

      {/* Unit list */}
      <div style={{ padding: '12px 20px 16px' }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
          รายการ Unit ({box.units.length})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 360, overflowY: 'auto' }}>
          {box.units.map((unit) => {
            const isStored = unit.status === 'stored'
            const isWithdrawing = withdrawingUnits.has(unit.id)
            return (
              <div key={unit.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border, #E4E4E7)',
                opacity: isStored ? 1 : 0.5,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: isStored ? '#16A34A' : '#DC2626',
                  }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>
                    {unit.unitNumber}
                  </span>
                </div>
                {isStored ? (
                  <button
                    onClick={() => onWithdrawUnit(unit.id, unit.unitNumber)}
                    disabled={isWithdrawing}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 'var(--radius-sm, 6px)',
                      border: '1px solid #FECACA', background: '#FEF2F2',
                      color: '#DC2626', fontSize: 12, fontWeight: 600,
                      cursor: isWithdrawing ? 'wait' : 'pointer',
                      opacity: isWithdrawing ? 0.6 : 1,
                    }}
                  >
                    <PackageOpen size={12} />
                    {isWithdrawing ? '...' : 'นำออก'}
                  </button>
                ) : (
                  <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 500 }}>นำออกแล้ว</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}