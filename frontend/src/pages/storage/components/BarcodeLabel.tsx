// ============================================================
//  src/pages/storage/components/BarcodeLabel.tsx
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

export default function BarcodeLabel({ data, onClose }: Props) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!barcodeRef.current) return;

    JsBarcode(barcodeRef.current, data.boxLabel, {
      format: "CODE128",
      width: 1.5,
      height: 40,
      displayValue: true,
      text: data.boxLabel,
      fontSize: 14,
      font: "monospace",
      fontOptions: "bold",
      textMargin: 4,
      margin: 0,
    });

    const svg = barcodeRef.current;
    const w = svg.getAttribute("width");
    const h = svg.getAttribute("height");
    if (w && h) {
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.removeAttribute("width");
      svg.removeAttribute("height");
    }
  }, [data.boxLabel]);

  const locText = data.location;

  const handlePrint = () => {
    const area = document.getElementById("barcode-print-area");
    if (!area) return;

    const printWindow = window.open("", "_blank", "width=600,height=500");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${data.boxLabel}</title>
<style>
  @page { size: 100mm 100mm; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #000; }
  html, body { width: 100mm; height: 100mm; overflow: hidden; }
  body { font-family: Helvetica, Arial, sans-serif; }
  .print-label {
    width: 100mm; height: 100mm;
    padding: 3mm;
    display: flex; flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    page-break-inside: avoid;
  }
  .print-label > div {
    padding: 0 !important;
    border: none !important;
  }
  /* top row — fits side by side on 100mm */
  .print-label > div > div:first-child {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 3mm !important;
    margin-bottom: 3mm !important;
  }
  .print-label > div > div:first-child > span:first-child {
    font-size: 28px !important;
    font-weight: 900 !important;
  }
  .print-label > div > div:first-child > div {
    display: flex !important;
    gap: 3mm !important;
  }
  .print-label > div > div:first-child > div > span:first-child {
    font-size: 18px !important;
    padding: 2px 10px !important;
  }
  .print-label > div > div:first-child > div > span:last-child {
    width: 38px !important;
    height: 38px !important;
    font-size: 18px !important;
    border-width: 3px !important;
  }
  /* barcode — large for easy scanning */
  .print-label svg {
    width: 100% !important;
    height: auto !important;
    max-height: 28mm !important;
    display: block !important;
    margin: 2mm 0 !important;
  }
  /* info row */
  .print-label > div > div:last-child {
    display: flex !important;
    justify-content: space-between !important;
    flex-wrap: wrap !important;
    gap: 1mm 3mm !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    border-top: 0.5px solid #999 !important;
    padding-top: 2mm !important;
    margin-top: 2mm !important;
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
          <div className="barcode-label-card">
            {/* Top row */}
            <div className="barcode-top-row">
              {" "}
              <span className="barcode-box-label">{data.boxLabel}</span>
              <div className="barcode-badges">
                <span className="barcode-type-badge">{data.type}</span>
                <span className="barcode-blood-badge">{data.blood}</span>
              </div>
            </div>

            {/* Barcode SVG */}
            <div className="barcode-svg-wrap">
              <svg ref={barcodeRef} />
            </div>

            {/* Info row */}
            <div className="barcode-info-row">
              {" "}
              <span>
                {locText} · {data.shelf}
              </span>
              <span>{data.unitCount} units</span>
              <span>วันที่เก็บ {data.collectionDate}</span>
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
