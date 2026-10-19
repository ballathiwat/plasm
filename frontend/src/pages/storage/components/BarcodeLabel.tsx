// ============================================================
//  src/pages/storage/components/BarcodeLabel.tsx
// ============================================================

import { useRef, useEffect } from 'react'
import JsBarcode from 'jsbarcode'
import { Printer, X } from 'lucide-react'
import type { BloodGroup } from '../../../types/models'

const GROUP_COLOR_HEX: Record<string, string> = {
  A: '#3B82F6', B: '#10B981', O: '#F59E0B', AB: '#8B5CF6',
}

export interface BarcodeLabelData {
  boxLabel: string
  type: string
  blood: string
  location: string
  shelf: string
  collectionDate: string
  unitCount: number
}

interface Props {
  data: BarcodeLabelData
  onClose: () => void
}

export default function BarcodeLabel({ data, onClose }: Props) {
  const barcodeRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, data.boxLabel, {
        format: 'CODE128',
        width: 2,
        height: 50,
        displayValue: false,
        margin: 0,
      })
    }
  }, [data.boxLabel])

  const handlePrint = () => {
    const printContent = document.getElementById('barcode-print-area')
    if (!printContent) return

    const printWindow = window.open('', '_blank', 'width=400,height=300')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Barcode - ${data.boxLabel}</title>
        <style>
          @page { size: 80mm 50mm; margin: 2mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; }
          .label {
            width: 76mm; height: 46mm;
            border: 1px solid #ccc;
            padding: 3mm;
            display: flex; flex-direction: column;
            justify-content: space-between;
          }
          .header {
            display: flex; justify-content: space-between;
            align-items: center; margin-bottom: 2mm;
          }
          .box-label { font-size: 16pt; font-weight: 900; letter-spacing: 0.5px; }
          .blood-badge {
            display: inline-flex; align-items: center; justify-content: center;
            width: 24px; height: 24px; border-radius: 50%;
            font-size: 10pt; font-weight: 900; color: white;
          }
          .barcode-area { text-align: center; margin: 1mm 0; }
          .barcode-area svg { width: 100%; max-height: 18mm; }
          .barcode-text { font-size: 10pt; font-weight: 700; letter-spacing: 2px; margin-top: 1mm; }
          .info-row {
            display: flex; justify-content: space-between;
            font-size: 7pt; color: #666; margin-top: 1mm;
          }
          .info-row span { }
          .type-badge {
            font-size: 8pt; font-weight: 700;
            padding: 1px 6px; border-radius: 3px;
            background: #DBEAFE; color: #1D4ED8;
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  const locText = data.location === 'room' || data.location === 'ROOM' ? 'ห้อง -30°C' : 'ตู้ -30°C'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1001,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-lg, 10px)',
        padding: 24, width: 440, maxWidth: '95vw',
        boxShadow: 'var(--shadow-md)',
        animation: 'plasm-fade-in 0.2s ease',
      }}>
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Printer size={18} style={{ color: 'var(--primary)' }} />
            พิมพ์บาร์โค้ด
          </h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          }}>
            <X size={18} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Preview */}
        <div id="barcode-print-area">
          <div className="label" style={{
            border: '2px solid #E4E4E7', borderRadius: 8,
            padding: 16, background: '#fff',
          }}>
            {/* Top row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 18, fontWeight: 900, fontFamily: 'monospace', letterSpacing: 1 }}>
                {data.boxLabel}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                  background: data.type === 'FFP' ? '#DBEAFE' : '#FEE2E2',
                  color: data.type === 'FFP' ? '#1D4ED8' : '#991B1B',
                }}>{data.type}</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: '50%',
                  background: GROUP_COLOR_HEX[data.blood] || '#666',
                  color: '#fff', fontSize: 12, fontWeight: 900,
                }}>{data.blood}</span>
              </div>
            </div>

            {/* Barcode */}
            <div style={{ textAlign: 'center', margin: '8px 0' }}>
              <svg ref={barcodeRef} />
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, fontFamily: 'monospace', marginTop: 4 }}>
                {data.boxLabel}
              </div>
            </div>

            {/* Info row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: '#888', marginTop: 8,
              borderTop: '1px solid #eee', paddingTop: 6,
            }}>
              <span>{locText} · {data.shelf}</span>
              <span>{data.unitCount} units</span>
              <span>เก็บ {data.collectionDate}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 0', borderRadius: 'var(--radius-sm, 6px)',
              border: 'none', background: 'var(--primary, #2563EB)', color: '#fff',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >
            <Printer size={16} />
            พิมพ์
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px', borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border)', background: 'transparent',
              fontSize: 14, cursor: 'pointer',
            }}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}