// ============================================================
//  src/pages/storage/components/BarcodeLabel.tsx
//  Grid layout matching blood-bank label standard (100×100mm)
// ============================================================

import { useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";
import { Printer, X } from "lucide-react";

export interface BarcodeLabelData {
  boxLabel: string;
  type: string;
  blood: string;
  location: string;
  shelf: string;
  collectionDate: string;
  unitCount: number;
}

interface Props {
  data: BarcodeLabelData;
  onClose: () => void;
}

/**
 * Blood-group background — white for all groups because the Zebra
 * thermal printer is monochrome. The large letter alone identifies
 * the group; colour would not survive printing.
 */
const BLOOD_TINTS: Record<string, string> = {
  A: "#FFFFFF",
  B: "#FFFFFF",
  O: "#FFFFFF",
  AB: "#FFFFFF",
};

/** Format ISO date "2026-10-28" → "28 ต.ค. 2569" (Thai Buddhist era) */
function formatThaiDate(isoDate: string): string {
  const thaiMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];
  const parts = isoDate.split("-");
  if (parts.length < 3) return isoDate;
  const year = parseInt(parts[0], 10) + 543; // Buddhist era
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${day} ${thaiMonths[month] || parts[1]} ${year}`;
}

export default function BarcodeLabel({ data, onClose }: Props) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const bloodTint = BLOOD_TINTS[data.blood] || "#F3F4F6";
  const thaiDate = formatThaiDate(data.collectionDate);
  // Barcode text below bars uses the full box label
  const barcodeText = data.boxLabel;

  useEffect(() => {
    if (!barcodeRef.current) return;

    JsBarcode(barcodeRef.current, data.boxLabel, {
      format: "CODE128",
      width: 2,
      height: 44,
      displayValue: true,
      text: barcodeText,
      fontSize: 14,
      font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontOptions: "bold",
      textMargin: 4,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 10,
      marginRight: 10,
    });

    // Use getBBox() to get the ACTUAL bounding box including text below bars
    const svg = barcodeRef.current;
    const bbox = svg.getBBox();
    const pad = 2; // small padding
    svg.setAttribute(
      "viewBox",
      `${bbox.x - pad} ${bbox.y - pad} ${bbox.width + pad * 2} ${bbox.height + pad * 2}`
    );
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.removeAttribute("width");
    svg.removeAttribute("height");
  }, [data.boxLabel, barcodeText]);

  const handlePrint = () => {
    const area = document.getElementById("barcode-print-area");
    if (!area) return;

    const printWindow = window.open("", "_blank", "width=600,height=600");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${data.boxLabel}</title>
<style>
  @page { size: 100mm 100mm; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #000; }
  html, body { width: 100mm; height: 100mm; overflow: hidden; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }

  .print-label {
    width: 100mm; height: 100mm;
    display: flex; flex-direction: column;
    overflow: hidden;
    page-break-inside: avoid;
    border: none !important;
    border-radius: 0 !important;
  }

  .print-label .lbl-grid {
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    flex-direction: column !important;
  }

  /* ── Row 1: blood group + plasma type ── */
  .print-label .lbl-row-top {
    display: grid !important;
    grid-template-columns: 34mm 1fr !important;
    border-bottom: 0.6mm solid #000 !important;
    min-height: 27mm !important;
  }
  .print-label .lbl-blood-cell {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    border-right: 0.6mm solid #000 !important;
    padding: 2mm !important;
  }
  .print-label .lbl-blood-cell .lbl-sub {
    font-size: 2.8mm !important;
    font-weight: 700 !important;
    margin-bottom: 0.5mm !important;
    color: #444 !important;
  }
  .print-label .lbl-blood-cell .lbl-big {
    font-size: 16mm !important;
    font-weight: 900 !important;
    line-height: 1 !important;
  }
  .print-label .lbl-type-cell {
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    padding: 2mm 4mm !important;
  }
  .print-label .lbl-type-cell .lbl-sub {
    font-size: 2.8mm !important;
    font-weight: 700 !important;
    margin-bottom: 0.5mm !important;
    color: #444 !important;
  }
  .print-label .lbl-type-cell .lbl-big {
    font-size: 11mm !important;
    font-weight: 900 !important;
    line-height: 1.05 !important;
    letter-spacing: 0.2mm !important;
  }
  /* ── Row 2: box number (full width, large) ── */
  .print-label .lbl-row-box {
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    padding: 1.5mm 4mm !important;
    border-bottom: 0.6mm solid #000 !important;
    min-height: 14mm !important;
  }
  .print-label .lbl-row-box .lbl-sub {
    font-size: 2.8mm !important;
    font-weight: 700 !important;
    color: #444 !important;
    margin-bottom: 0.3mm !important;
  }
  .print-label .lbl-box-id {
    font-size: 7mm !important;
    font-weight: 900 !important;
    line-height: 1.1 !important;
    letter-spacing: 0.2mm !important;
    white-space: nowrap !important;
  }

  /* ── Row 3: date (full width, large) ── */
  .print-label .lbl-row-date {
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    padding: 1.5mm 4mm !important;
    border-bottom: 0.6mm solid #000 !important;
    min-height: 12mm !important;
  }
  .print-label .lbl-row-date .lbl-sub {
    font-size: 2.8mm !important;
    font-weight: 700 !important;
    color: #444 !important;
    margin-bottom: 0.3mm !important;
  }
  .print-label .lbl-date-val {
    font-size: 6.5mm !important;
    font-weight: 800 !important;
    line-height: 1.1 !important;
    white-space: nowrap !important;
  }

  /* ── Row 4: barcode (compact) ── */
  .print-label .lbl-row-barcode {
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 1mm 2mm !important;
    border-bottom: 0.6mm solid #000 !important;
  }
  .print-label .lbl-row-barcode svg {
    width: 100% !important;
    height: auto !important;
    max-height: 16mm !important;
    display: block !important;
    margin: 0 auto !important;
    overflow: visible !important;
  }

  /* ── Row 4: position + units + temp (3-col) ── */
  .print-label .lbl-row-bottom {
    display: grid !important;
    grid-template-columns: 1fr 1fr 1fr !important;
    min-height: 10mm !important;
  }
  .print-label .lbl-row-bottom .lbl-cell {
    padding: 1.5mm 3mm !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 1.5mm !important;
  }
  .print-label .lbl-row-bottom .lbl-cell + .lbl-cell {
    border-left: 0.6mm solid #000 !important;
  }
  .print-label .lbl-row-bottom .lbl-sub {
    font-size: 2.5mm !important;
    font-weight: 700 !important;
    color: #444 !important;
  }
  .print-label .lbl-row-bottom .lbl-val {
    font-size: 4mm !important;
    font-weight: 800 !important;
  }
</style>
</head><body>
  <div class="print-label">${area.innerHTML}</div>
  <script>window.onload=function(){window.print();window.close();}</script>
</body></html>`);
    printWindow.document.close();
  };

  return (
    <div className="barcode-overlay">
      <div className="barcode-modal">
        {/* Modal header */}
        <div className="barcode-modal-header">
          <h3 className="barcode-modal-title">
            <Printer size={18} style={{ color: "var(--primary)" }} />
            พิมพ์บาร์โค้ด
          </h3>
          <button onClick={onClose} className="barcode-modal-close">
            <X size={18} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Preview — this is what gets printed */}
        <div id="barcode-print-area">
          <div className="lbl-grid">
            {/* Row 1: Blood group (colored) + Plasma type */}
            <div className="lbl-row-top">
              <div
                className="lbl-blood-cell"
                style={{ backgroundColor: bloodTint }}
              >
                <span className="lbl-sub">หมู่เลือด</span>
                <span className="lbl-big">{data.blood}</span>
              </div>
              <div className="lbl-type-cell">
                <span className="lbl-sub">ชนิดพลาสมา</span>
                <span className="lbl-big">{data.type}</span>
              </div>
            </div>

            {/* Row 2: Box number (full width, large) */}
            <div className="lbl-row-box">
              <span className="lbl-sub">หมายเลขกล่อง</span>
              <span className="lbl-box-id">{data.boxLabel}</span>
            </div>

            {/* Row 3: Collection date (full width, large) */}
            <div className="lbl-row-date">
              <span className="lbl-sub">วันที่เก็บ</span>
              <span className="lbl-date-val">{thaiDate}</span>
            </div>

            {/* Row 3: Barcode */}
            <div className="lbl-row-barcode">
              <svg ref={barcodeRef} />
            </div>

            {/* Row 4: Position + Units + Storage temp (3-col) */}
            <div className="lbl-row-bottom">
              <div className="lbl-cell">
                <span className="lbl-sub">ตำแหน่ง</span>
                <span className="lbl-val">{data.shelf}</span>
              </div>
              <div className="lbl-cell">
                <span className="lbl-sub">จำนวน</span>
                <span className="lbl-val">{data.unitCount} units</span>
              </div>
              <div className="lbl-cell">
                <span className="lbl-sub">อุณหภูมิ</span>
                <span className="lbl-val">-30°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="barcode-actions">
          <button onClick={handlePrint} className="barcode-btn-print">
            <Printer size={16} /> พิมพ์
          </button>
          <button onClick={onClose} className="barcode-btn-close">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}