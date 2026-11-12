// ============================================================
//  src/components/common/PrintPreview.tsx
//  Modal พรีวิวกระดาษ A4 + พิมพ์/บันทึก PDF — ใช้ร่วมได้ทุกหน้า
// ============================================================

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { FileText, Printer, X } from "lucide-react";
import Button from "./Button";
import Switch from "./Switch";
import '../../assets/styles/components/print-preview.css'


// ── Types ────────────────────────────────────────────────────
export interface PrintPageDef {
  title?:    string;
  subtitle?: string;
  content?:  ReactNode;
  blocks?:           ReactNode[];
  overflowTitle?:    string;
  overflowSubtitle?: string;
}

const PAGE_H_MM = 296;
const PAGE_PAD_MM = 24;
const SAFETY_MM = 1.5;

export interface PrintPreviewProps {
  open:      boolean;
  onClose:   () => void;
  docNo:     string;
  title:     string;
  subtitle?: string;
  pages:     PrintPageDef[];
  docNoLabel?: string;
  watermark?:    string;
  watermarkSub?: string;
}

export const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

// ════════════════════════════════════════════════════════════
//  Main component
// ════════════════════════════════════════════════════════════
const PrintPreview = ({
  open, onClose, docNo, title, subtitle, pages,
  docNoLabel = "เลขที่เอกสาร", watermark, watermarkSub,
}: PrintPreviewProps) => {
  const [showWatermark, setShowWatermark] = useState(true);
  const measureRef = useRef<HTMLDivElement>(null);
  const [heights, setHeights] = useState<number[][] | null>(null);
  const [env, setEnv] = useState<{ headerH: number; availPx: number } | null>(null);
  const hasFlow = pages.some((pg) => pg.blocks);

  useLayoutEffect(() => {
    if (!open || !hasFlow) return;
    const root = measureRef.current;
    if (!root) return;
    const measure = () => {
      const probe = root.querySelector<HTMLElement>("[data-probe]");
      const hd = root.querySelector<HTMLElement>("[data-hd]");
      if (!probe || !hd) return;
      const pxPerMm = probe.offsetHeight / 100;
      const headerH = hd.offsetHeight + parseFloat(getComputedStyle(hd).marginBottom || "0");
      setHeights(
        pages.map((pg, pi) =>
          pg.blocks
            ? Array.from(root.querySelectorAll<HTMLElement>(`[data-blk="${pi}"]`)).map((el) => el.offsetHeight)
            : [],
        ),
      );
      setEnv({ headerH, availPx: (PAGE_H_MM - PAGE_PAD_MM - SAFETY_MM) * pxPerMm });
    };
    measure();
    void document.fonts?.ready.then(measure);
  }, [open, hasFlow, pages]);

  const rendered = useMemo(() => {
    const out: { title?: string; subtitle?: string; content: ReactNode }[] = [];
    pages.forEach((pg, pi) => {
      if (!pg.blocks) {
        out.push({ title: pg.title, subtitle: pg.subtitle, content: pg.content });
        return;
      }
      const hs = heights?.[pi];
      if (!hs || !env || hs.length !== pg.blocks.length) {
        out.push({ title: pg.title, subtitle: pg.subtitle, content: pg.blocks.map((b, i) => <Fragment key={i}>{b}</Fragment>) });
        return;
      }
      const avail = env.availPx - env.headerH;
      let cur: ReactNode[] = [];
      let used = 0;
      let first = true;
      const flush = () => {
        out.push({
          title: first ? pg.title : (pg.overflowTitle ?? pg.title),
          subtitle: first ? pg.subtitle : (pg.overflowSubtitle ?? pg.subtitle),
          content: cur,
        });
        cur = []; used = 0; first = false;
      };
      pg.blocks.forEach((b, bi) => {
        if (cur.length > 0 && used + hs[bi] > avail) flush();
        cur.push(<Fragment key={bi}>{b}</Fragment>);
        used += hs[bi];
      });
      if (cur.length > 0) flush();
    });
    return out;
  }, [pages, heights, env]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handlePrint = () => {
    const prev = document.title;
    const restore = () => { document.title = prev; window.removeEventListener("afterprint", restore); };
    window.addEventListener("afterprint", restore);
    document.title = docNo;
    window.print();
  };

  return createPortal(
    <div className="pv-portal">
      <div className="pv-toolbar">
        <div className="pv-toolbar__title">
          <FileText size={16} /> ตัวอย่างก่อนพิมพ์
          <span className="pv-toolbar__sub">{docNo} · {rendered.length} หน้า (A4)</span>
        </div>
        <div style={{ flex: 1 }} />
        {watermark && (
          <div className="pv-toolbar__wm">
            <Switch checked={showWatermark} onChange={setShowWatermark} label="ลายน้ำ" size="sm" />
          </div>
        )}
        <Button variant="primary" icon={<Printer size={14} />} onClick={handlePrint}>พิมพ์ / บันทึก PDF</Button>
        <Button variant="danger" icon={<X size={14} />} onClick={onClose}>ปิด</Button>
      </div>

      <div className="pv-scroll">
        {rendered.map((p, i) => (
          <div className="pv-page" key={i}>
            {watermark && showWatermark && (
              <div className="pv-wm" aria-hidden="true">
                <span className="pv-wm__main">{watermark}</span>
                {watermarkSub && <span className="pv-wm__sub">{watermarkSub}</span>}
              </div>
            )}
            <div className="pv-hd">
              <div>
                <h1>{p.title ?? title}</h1>
                {(p.subtitle ?? subtitle) && <small>{p.subtitle ?? subtitle}</small>}
              </div>
              <div className="pv-hd__no"><span>{docNoLabel}</span><b>{docNo}</b></div>
            </div>
            {p.content}
            <div className="pv-ft"><span>{docNo}</span><span>หน้า {i + 1} / {rendered.length}</span></div>
          </div>
        ))}
      </div>

      {hasFlow && (
        <div className="pv-page pv-measure" ref={measureRef} aria-hidden="true">
          <div data-probe style={{ height: "100mm" }} />
          <div className="pv-hd" data-hd>
            <div><h1>{title}</h1>{subtitle && <small>{subtitle}</small>}</div>
            <div className="pv-hd__no"><span>{docNoLabel}</span><b>{docNo}</b></div>
          </div>
          {pages.map((pg, pi) => pg.blocks?.map((b, bi) => (
            <div key={`${pi}-${bi}`} data-blk={pi} style={{ display: "flow-root" }}>{b}</div>
          )))}
        </div>
      )}
    </div>,
    document.body,
  );
};

export default PrintPreview;

// ════════════════════════════════════════════════════════════
//  Building blocks
// ════════════════════════════════════════════════════════════

export type PrintTone = "success" | "danger" | "neutral" | "info" | "warning";

export const PrintSection = ({ title, hint, children }: { title: string; hint?: ReactNode; children?: ReactNode }) => (
  <><div className="pv-h2">{title}{hint != null && <small>{hint}</small>}</div>{children}</>
);

export interface PrintInfoItem { label: string; value: ReactNode; full?: boolean; }
export const PrintInfoGrid = ({ items }: { items: PrintInfoItem[] }) => (
  <div className="pv-grid">
    {items.map((it) => (
      <div key={it.label} className={`pv-cell${it.full ? " pv-cell--full" : ""}`}>
        <div className="pv-k">{it.label}</div><div className="pv-v">{it.value ?? "—"}</div>
      </div>
    ))}
  </div>
);

export interface PrintColumn<T> { header: string; width?: number | string; align?: "left" | "center" | "right"; render: (row: T, idx: number) => ReactNode; }
export function PrintTable<T>({ columns, data, rowKey, emptyText = "ไม่มีข้อมูล" }: { columns: PrintColumn<T>[]; data: T[]; rowKey: (row: T, idx: number) => string | number; emptyText?: string }) {
  const cls = (a?: "left" | "center" | "right") => a === "center" ? "pv-center" : a === "right" ? "pv-right" : undefined;
  return (
    <table className="pv-tbl">
      <thead><tr>{columns.map((c) => <th key={c.header} className={cls(c.align)} style={{ width: c.width }}>{c.header}</th>)}</tr></thead>
      <tbody>
        {data.length === 0
          ? <tr><td colSpan={columns.length} className="pv-center">{emptyText}</td></tr>
          : data.map((row, idx) => <tr key={rowKey(row, idx)}>{columns.map((c) => <td key={c.header} className={cls(c.align)}>{c.render(row, idx)}</td>)}</tr>)}
      </tbody>
    </table>
  );
}

export const PrintStats = ({ items }: { items: { label: string; value: ReactNode; tone?: PrintTone }[] }) => (
  <div className="pv-stats" style={{ gridTemplateColumns: `repeat(${items.length},1fr)` }}>
    {items.map((s) => <div key={s.label} className={`pv-stat pv-tone--${s.tone ?? "neutral"}`}><b>{s.value}</b><span>{s.label}</span></div>)}
  </div>
);

export interface PrintResultRow { label: string; value: ReactNode; tone?: PrintTone; bold?: boolean; }
export const PrintResultTable = ({ groupLabel, rows, headers = ["รายละเอียด", "ผลประเมิน", "จำนวนข้อ"] }: { groupLabel: ReactNode; rows: PrintResultRow[]; headers?: [string, string, string] | string[] }) => (
  <table className="pv-tbl">
    <thead><tr><th>{headers[0]}</th><th style={{ width: "34%" }}>{headers[1]}</th><th className="pv-right" style={{ width: "26%" }}>{headers[2]}</th></tr></thead>
    <tbody>
      {rows.map((r, i) => (
        <tr key={r.label} className={`pv-sum-row${r.bold ? " pv-sum-row--total" : ""}`}>
          {i === 0 && <td rowSpan={rows.length} className="pv-sum-lbl">{groupLabel}</td>}
          <td className={r.tone ? `pv-txt--${r.tone}` : undefined}>{r.label}</td>
          <td className="pv-right">{r.value}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const PrintChips = ({ items }: { items: { label: string; value: ReactNode; tone?: PrintTone }[] }) => (
  <div className="pv-chips">{items.map((c) => <span key={c.label} className={`pv-chip pv-tone--${c.tone ?? "neutral"}`}>{c.label} <b>{c.value}</b></span>)}</div>
);

export const PrintVerdict = ({ tone = "success", children }: { tone?: PrintTone; children: ReactNode }) => (
  <div className={`pv-verdict pv-tone--${tone}`}>{children}</div>
);

export const PrintNote = ({ children }: { children: ReactNode }) => <div className="pv-note">{children}</div>;

export const PrintAlertList = ({ items }: { items: { key: string | number; label: ReactNode; text: ReactNode }[] }) => (
  <div className="pv-alert">{items.map((it) => <div key={it.key}><b>{it.label}</b>{it.text}</div>)}</div>
);

export const PrintTag = ({ tone = "neutral", children }: { tone?: PrintTone; children: ReactNode }) => (
  <span className={`pv-tag pv-tone--${tone}`} style={{ border: "none" }}>{children}</span>
);

export const PrintPhotoGrid = ({ photos, emptyText = "ไม่มีรูปภาพ", columns = 3, ratio }: { photos: { key: string | number; url?: string; caption?: string }[]; emptyText?: string; columns?: number; ratio?: string }) =>
  photos.length === 0 ? <PrintNote>{emptyText}</PrintNote> : (
    <div className="pv-photos" style={{ gridTemplateColumns: `repeat(${columns},1fr)` }}>
      {photos.map((p, i) => (
        <figure className="pv-photo" key={p.key}>
          <div className="pv-photo__img" style={ratio ? { aspectRatio: ratio } : undefined}>{p.url ? <img src={p.url} alt={`รูปที่ ${i + 1}`} /> : "ไม่มีรูป"}</div>
          {p.caption && <figcaption>{p.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
