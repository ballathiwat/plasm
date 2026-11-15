// frontend/src/pages/ExtBloodReport/components/ReportTables.tsx
//
// ตาราง 3 แท็บ: สรุปตามแหล่งที่มา · หมู่เลือด × ชนิดเลือด · รายการทั้งหมด
// ทุกแท็บมี footer รวม

import type { CSSProperties } from 'react'
import { Pagination } from '../../../components/shared'
import { bloodGroupClass, statusClass, statusLabel } from '../../ExtBlood/services/extHelpers'
import { compareBloodGroup, fmtInt, fmtPct, formatThaiDay, formatThaiRange, pct } from '../services/reportHelpers'
import type { ReceiptRowsResult, ReceiptsReport, ReportTab } from '../services/ReportType'

interface Props {
  report: ReceiptsReport
  tab: ReportTab
  onTab: (t: ReportTab) => void
  /** ตัวกรองแหล่งที่มาที่เลือกอยู่ — ตารางสรุปแสดงเฉพาะแหล่งนั้น */
  sourceId?: string
  rows: ReceiptRowsResult | null
  rowsFetching: boolean
  rowsError: string | null
  page: number
  pageSize: number
  onPage: (n: number) => void
}

const TABS: { key: ReportTab; label: string }[] = [
  { key: 'source', label: 'สรุปตามแหล่งที่มา' },
  { key: 'matrix', label: 'หมู่เลือด × ชนิดเลือด' },
  { key: 'rows', label: 'รายการทั้งหมด' },
]

const cssVars = (vars: Record<string, string>) => vars as CSSProperties
const HEAT_MAX = 45 // % ของ --primary ที่ผสมในช่องที่มากที่สุด

/* ----------------------------------------------------------
   แท็บ 1: สรุปตามแหล่งที่มา
---------------------------------------------------------- */
function SourceTable({ report, sourceId }: Pick<Props, 'report' | 'sourceId'>) {
  const list = sourceId ? report.bySource.filter((s) => s.sourceId === sourceId) : report.bySource
  const sum = list.reduce(
    (a, s) => ({ receipts: a.receipts + s.receipts, bags: a.bags + s.bags }),
    { receipts: 0, bags: 0 },
  )
  return (
    <table className="ext-table rpt-table">
      <thead>
        <tr>
          <th>แหล่งที่มา</th>
          <th className="rpt-num">ครั้งที่รับ</th>
          <th className="rpt-num">ถุง</th>
          <th className="rpt-table__share">สัดส่วนถุง</th>
        </tr>
      </thead>
      <tbody>
        {list.map((s) => (
          <tr key={s.sourceId}>
            <td>{s.sourceName}</td>
            <td className="rpt-num">{fmtInt(s.receipts)}</td>
            <td className="rpt-num">{fmtInt(s.bags)}</td>
            <td>
              <span className="rpt-share">
                <span className="rpt-share__track">
                  <span className="rpt-share__fill" style={cssVars({ '--w': `${pct(s.bags, sum.bags)}%` })} />
                </span>
                <span className="rpt-share__pct">{fmtPct(s.bags, sum.bags)}</span>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td>รวม {fmtInt(list.length)} แห่ง</td>
          <td className="rpt-num">{fmtInt(sum.receipts)}</td>
          <td className="rpt-num">{fmtInt(sum.bags)}</td>
          <td>
            <span className="rpt-share__pct">{sum.bags > 0 ? '100%' : '–'}</span>
          </td>
        </tr>
      </tfoot>
    </table>
  )
}

/* ----------------------------------------------------------
   แท็บ 2: หมู่เลือด × ชนิดเลือด (heatmap)
---------------------------------------------------------- */
function MatrixTable({ report }: Pick<Props, 'report'>) {
  const { matrix } = report
  const codes = [...new Set(matrix.map((m) => m.productCode))]
  const abos = [...new Set(matrix.map((m) => m.abo))].sort(compareBloodGroup)

  const cell = (abo: string, code: string) =>
    matrix.find((m) => m.abo === abo && m.productCode === code)?.bags ?? 0
  const max = Math.max(1, ...matrix.map((m) => m.bags))
  const rowTotal = (abo: string) => codes.reduce((s, c) => s + cell(abo, c), 0)
  const colTotal = (code: string) => abos.reduce((s, a) => s + cell(a, code), 0)
  const grand = matrix.reduce((s, m) => s + m.bags, 0)

  return (
    <table className="ext-table rpt-table rpt-matrix">
      <thead>
        <tr>
          <th>หมู่เลือด</th>
          {codes.map((c) => <th key={c} className="rpt-num">{c}</th>)}
          <th className="rpt-num">รวม</th>
        </tr>
      </thead>
      <tbody>
        {abos.map((abo) => (
          <tr key={abo}>
            <td>
              <span className={`blood-badge rpt-badge ${bloodGroupClass(abo)}`}>{abo}</span>
            </td>
            {codes.map((c) => {
              const n = cell(abo, c)
              return (
                <td
                  key={c}
                  className="rpt-num rpt-matrix__cell"
                  style={cssVars({ '--heat': `${n > 0 ? Math.max(6, (n / max) * HEAT_MAX) : 0}%` })}
                >
                  {n > 0 ? fmtInt(n) : '–'}
                </td>
              )
            })}
            <td className="rpt-num rpt-matrix__total">{fmtInt(rowTotal(abo))}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td>รวม</td>
          {codes.map((c) => <td key={c} className="rpt-num">{fmtInt(colTotal(c))}</td>)}
          <td className="rpt-num">{fmtInt(grand)}</td>
        </tr>
      </tfoot>
    </table>
  )
}

/* ----------------------------------------------------------
   แท็บ 3: รายการทั้งหมด (แบ่งหน้า)
---------------------------------------------------------- */
function RowsTable({
  rows, rowsFetching, rowsError, page, pageSize, onPage,
}: Pick<Props, 'rows' | 'rowsFetching' | 'rowsError' | 'page' | 'pageSize' | 'onPage'>) {
  if (rowsError) return <p className="rpt-table__msg rpt-table__msg--error" role="alert">{rowsError}</p>
  if (!rows) return <p className="rpt-table__msg" role="status">กำลังโหลดรายการ...</p>

  return (
    <>
      <table className={`ext-table rpt-table${rowsFetching ? ' is-fetching' : ''}`} aria-busy={rowsFetching}>
        <thead>
          <tr>
            <th>วันที่รับ</th>
            <th>เลขที่เอกสาร</th>
            <th>แหล่งที่มา</th>
            <th>ชนิดเลือด</th>
            <th>หมู่เลือด</th>
            <th>สถานะ</th>
            <th className="rpt-num">ถุง</th>
          </tr>
        </thead>
        <tbody>
          {rows.rows.length === 0 && (
            <tr>
              <td colSpan={7} className="rpt-table__msg">ไม่มีรายการในหน้านี้</td>
            </tr>
          )}
          {rows.rows.map((r) => (
            <tr key={r.id}>
              <td className="rpt-nowrap">{formatThaiDay(r.receivedDate)}</td>
              <td className="rpt-mono">{r.docNumber}</td>
              <td>{r.sourceName}</td>
              <td title={r.productName ?? undefined}>{r.productCode}</td>
              <td>
                <span className={`blood-badge rpt-badge ${bloodGroupClass(r.bloodGroup)}`}>{r.bloodGroup}</span>
              </td>
              <td>
                <span className={`ext-status ${statusClass(r.status)}`}>{statusLabel(r.status)}</span>
              </td>
              <td className="rpt-num">{fmtInt(r.bags)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={6}>รวม {fmtInt(rows.total)} รายการ (ทุกหน้า)</td>
            <td className="rpt-num">{fmtInt(rows.sum.bags)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="rpt-table__pager">
        <Pagination
          pagination={{
            page,
            pageSize,
            total: rows.total,
            totalPages: Math.max(1, Math.ceil(rows.total / pageSize)),
          }}
          onPageChange={onPage}
        />
      </div>
    </>
  )
}

/* ----------------------------------------------------------
   Wrapper + แถบแท็บ
---------------------------------------------------------- */
export default function ReportTables(props: Props) {
  const { report, tab, onTab } = props
  return (
    <section className="rpt-card rpt-tables">
      <div className="rpt-tables__bar">
        <div className="ext-tabs rpt-tables__tabs" role="tablist" aria-label="ตารางรายงาน">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`rpt-tab-${t.key}`}
              aria-selected={tab === t.key}
              aria-controls="rpt-tabpanel"
              className={`ext-tab${tab === t.key ? ' ext-tab--active' : ''}`}
              onClick={() => onTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="rpt-tables__range">{formatThaiRange(report.range.from, report.range.to)}</span>
      </div>

      <div className="rpt-tables__scroll" role="tabpanel" id="rpt-tabpanel" aria-labelledby={`rpt-tab-${tab}`}>
        {tab === 'source' && <SourceTable report={report} sourceId={props.sourceId} />}
        {tab === 'matrix' && <MatrixTable report={report} />}
        {tab === 'rows' && (
          <RowsTable
            rows={props.rows}
            rowsFetching={props.rowsFetching}
            rowsError={props.rowsError}
            page={props.page}
            pageSize={props.pageSize}
            onPage={props.onPage}
          />
        )}
      </div>
    </section>
  )
}
