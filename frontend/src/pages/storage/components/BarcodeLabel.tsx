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

    // Convert fixed size → viewBox so SVG scales with container
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

  const locText =
    data.location === "room" || data.location === "ROOM"
      ? "ห้อง -30°C"
      : "ตู้ -30°C";

  const handlePrint = () => {
    const area = document.getElementById("barcode-print-area");
    if (!area) return;

    const printWindow = window.open("", "_blank", "width=600,height=500");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${data.boxLabel}</title>
<style>
  @page { size: 100mm 55mm; margin: 2mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #000; }
  html, body { width: 100%; height: 100%; overflow: hidden; }
  body { font-family: Helvetica, Arial, sans-serif; }
  .print-label {
    width: 96mm; height: 51mm;
    padding: 3mm;
    border: 1px solid #ccc;
    display: flex; flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    page-break-inside: avoid;
  }
  .print-label > div:first-child > div:nth-child(2) {
    overflow: hidden;
  }
  .print-label svg {
    width: 100% !important;
    height: auto !important;
    max-height: 15mm !important;
    display: block !important;
  }
  .print-label > div {
    padding: 8px !important;
    border-width: 1px !important;
  }
</style>
</head><body>
  <div class="print-label">${area.innerHTML}</div>
  <script>window.onload=function(){window.print();window.close();}</script>
</body></html>`);
    printWindow.document.close();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1001,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--radius-lg, 10px)",
          padding: 24,
          width: 480,
          maxWidth: "95vw",
          boxShadow: "var(--shadow-md)",
          animation: "plasm-fade-in 0.2s ease",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Printer size={18} style={{ color: "var(--primary)" }} />
            พิมพ์บาร์โค้ด
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={18} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Preview — this is what gets printed */}
        <div id="barcode-print-area">
          <div
            style={{
              border: "2px solid #E4E4E7",
              borderRadius: 8,
              padding: 14,
              background: "#fff",
            }}
          >
            {/* Top row: หมายเลขกล่อง + ชนิด + หมู่เลือด */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  fontFamily: "monospace",
                  letterSpacing: 1,
                  lineHeight: 1.1,
                }}
              >
                {data.boxLabel}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 6,
                    background: "#fff",
                    border: "2px solid #000",
                    color: "#000",
                  }}
                >
                  {data.type}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "#fff",
                    border: "3px solid #000",
                    color: "#000",
                    fontSize: 20,
                    fontWeight: 900,
                  }}
                >
                  {data.blood}
                </span>
              </div>
            </div>

            {/* Barcode SVG */}
            <div
              style={{
                textAlign: "center",
                padding: "4px 0",
                overflow: "hidden",
              }}
            >
              <svg
                ref={barcodeRef}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: 90,
                  display: "block",
                }}
              />
            </div>

            {/* Info row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "2px 10px",
                fontSize: 15,
                fontWeight: 600,
                color: "#333",
                marginTop: 8,
                borderTop: "1px solid #eee",
                paddingTop: 6,
              }}
            >
              <span>
                {locText} · {data.shelf}
              </span>
              <span>{data.unitCount} units</span>
              <span>วันที่เก็บ {data.collectionDate}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 0",
              borderRadius: "var(--radius-sm, 6px)",
              border: "none",
              background: "var(--primary, #2563EB)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <Printer size={16} /> พิมพ์
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-sm, 6px)",
              border: "1px solid var(--border)",
              background: "transparent",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
