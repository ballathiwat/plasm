// ============================================================
//  src/pages/ExtBlood/components/ExtBloodPrint.tsx
//  พิมพ์เอกสารรับเลือดจากภายนอก — ใช้ PrintPreview + building blocks
// ============================================================

import PrintPreview, {
  PrintSection, PrintInfoGrid, PrintTable, PrintStats, PrintChips, PrintNote, PrintTag, chunk, printAttachmentBlocks,
  type PrintColumn, type PrintPageDef, type PrintInfoItem,
} from '../../../components/common/PrintPreview'
import { formatThaiDate, formatThaiDateTime, statusLabel, attachmentUrl, fixFileName } from '../services/extHelpers'
import { sortCommittee, ROLE_LABEL } from '../services/committeeHelpers'
import type { ExtDocument, ExtBag, ExtCommitteeMember, ExtTimelineEntry } from '../services/ExtBloodType'

const CM_STATUS: Record<string, string> = { DRAFT: 'ยังไม่ส่ง', PENDING: 'รออนุมัติ', APPROVED: 'อนุมัติแล้ว', REJECTED: 'ไม่อนุมัติ' }
const CM_TONE: Record<string, 'success' | 'danger' | 'warning' | 'neutral'> = { APPROVED: 'success', REJECTED: 'danger', PENDING: 'warning', DRAFT: 'neutral' }
const BAGS_PER_PAGE = 60

function buildInfo(doc: ExtDocument): PrintInfoItem[] {
  return [
    { label: 'วันที่รับ', value: formatThaiDate(doc.receivedDate) },
    { label: 'สถานที่ส่งเลือด', value: doc.source.name },
    { label: 'ชนิดเลือด', value: `${doc.bloodProduct.code}${doc.bloodProduct.name ? ` — ${doc.bloodProduct.name}` : ''}` },
    { label: 'หมู่เลือด', value: doc.bloodGroup },
    { label: 'หมายเลขกล่อง', value: doc.boxLabel },
    { label: 'ตำแหน่งจัดเก็บ', value: doc.storage.name },
    { label: 'จำนวนถุงเลือด', value: `${doc.bagRemaining} คงคลัง / ${doc.bagCount} ทั้งหมด` },
    { label: 'สถานะเอกสาร', value: statusLabel(doc.status) },
    ...(doc.editReason ? [{ label: 'เหตุผลแก้ไข', value: doc.editReason, full: true } as PrintInfoItem] : []),
    ...(doc.rejectReason ? [{ label: 'เหตุผลไม่อนุมัติ', value: doc.rejectReason, full: true } as PrintInfoItem] : []),
  ]
}

const bagColumns: PrintColumn<ExtBag>[] = [
  { header: '#', width: 40, align: 'center', render: (_r, i) => i + 1 },
  { header: 'หมายเลขถุง', render: (r) => <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>{r.bagNumber}</span> },
  { header: 'สถานะ', width: 100, align: 'center', render: (r) => <PrintTag tone={r.status === 'IN_STOCK' ? 'success' : 'neutral'}>{r.status === 'IN_STOCK' ? 'คงคลัง' : 'นำออกแล้ว'}</PrintTag> },
  { header: 'วันที่นำออก', width: 120, align: 'center', render: (r) => r.exportedAt ? formatThaiDate(r.exportedAt) : '—' },
]
const cmColumns: PrintColumn<ExtCommitteeMember>[] = [
  { header: '#', width: 36, align: 'center', render: (_r, i) => i + 1 },
  { header: 'หน้าที่', width: 100, render: (r) => ROLE_LABEL[r.role] || r.role },
  { header: 'ชื่อ', render: (r) => r.user?.name || '—' },
  { header: 'สถานะ', width: 100, align: 'center', render: (r) => <PrintTag tone={CM_TONE[r.status] ?? 'neutral'}>{CM_STATUS[r.status] || r.status}</PrintTag> },
  { header: 'วันที่ดำเนินการ', width: 130, align: 'center', render: (r) => r.actedAt ? formatThaiDateTime(r.actedAt) : '—' },
]
const tlColumns: PrintColumn<ExtTimelineEntry>[] = [
  { header: '#', width: 36, align: 'center', render: (_r, i) => i + 1 },
  { header: 'วันเวลา', width: 140, render: (r) => formatThaiDateTime(r.createdAt) },
  { header: 'การดำเนินการ', width: 120, render: (r) => r.action },
  { header: 'รายละเอียด', render: (r) => r.detail },
  { header: 'ผู้ดำเนินการ', width: 120, render: (r) => r.user?.name || '—' },
]

interface ExtBloodPrintProps { open: boolean; onClose: () => void; doc: ExtDocument }

export default function ExtBloodPrint({ open, onClose, doc }: ExtBloodPrintProps) {
  if (!open || !doc) return null
  const cm = sortCommittee(doc.committee)
  const approvedN = cm.filter((m) => m.status === 'APPROVED').length
  const inStock = doc.bags.filter((b) => b.status === 'IN_STOCK').length
  const exported = doc.bags.filter((b) => b.status === 'EXPORTED').length
  const pages: PrintPageDef[] = []

  pages.push({ content: (<>
    <PrintSection title="ข้อมูลการรับเลือด"><PrintInfoGrid items={buildInfo(doc)} /></PrintSection>
    <PrintStats items={[{ label: 'ถุงทั้งหมด', value: doc.bagCount, tone: 'info' }, { label: 'คงคลัง', value: inStock, tone: 'success' }, { label: 'นำออกแล้ว', value: exported, tone: 'neutral' }]} />
    <PrintSection title="คณะกรรมการ" hint={`${approvedN}/${cm.length} อนุมัติ`}>
      {cm.length > 0 ? <PrintTable columns={cmColumns} data={cm} rowKey={(r) => r.id} /> : <PrintNote>ไม่มีคณะกรรมการ</PrintNote>}
    </PrintSection>
    {cm.some((m) => m.reason) && <PrintSection title="หมายเหตุจากกรรมการ">{cm.filter((m) => m.reason).map((m) => <PrintNote key={m.id}><b>{ROLE_LABEL[m.role]} ({m.user?.name})</b>: {m.reason}</PrintNote>)}</PrintSection>}
  </>) })

  if (doc.bags.length > 0) {
    const bagChunks = chunk(doc.bags, BAGS_PER_PAGE)
    bagChunks.forEach((bagPage, ci) => {
      pages.push({ title: 'รายการถุงเลือด', subtitle: bagChunks.length > 1 ? `(${ci + 1}/${bagChunks.length})` : undefined, content: (
        <PrintSection title={ci === 0 ? 'รายการถุงเลือด' : 'รายการถุงเลือด (ต่อ)'} hint={ci === 0 ? `${doc.bagCount} ถุง` : undefined}>
          <PrintChips items={[{ label: 'คงคลัง', value: inStock, tone: 'success' }, { label: 'นำออก', value: exported, tone: 'neutral' }]} />
          <PrintTable columns={[{ header: '#', width: 40, align: 'center', render: (_r, i) => ci * BAGS_PER_PAGE + i + 1 }, ...bagColumns.slice(1)]} data={bagPage} rowKey={(r) => r.id} />
        </PrintSection>
      ) })
    })
  }

  if (doc.timeline?.length) {
    pages.push({ title: 'ประวัติการดำเนินการ', content: (
      <PrintSection title="ประวัติการดำเนินการ" hint={`${doc.timeline.length} รายการ`}><PrintTable columns={tlColumns} data={doc.timeline} rowKey={(r) => r.id} /></PrintSection>
    ) })
  }

  if (doc.attachments?.length) {
    // รูป → แสดงรูปจริง (grid 2 คอลัมน์), ไฟล์อื่น → ไอคอน + ชื่อไฟล์ · ใช้ blocks เพื่อขึ้นหน้าใหม่อัตโนมัติ
    const files = doc.attachments.map((a) => ({ key: a.id, name: fixFileName(a.fileName), url: attachmentUrl(a), mimeType: a.fileType }))
    pages.push({ title: 'ไฟล์แนบ', overflowSubtitle: '(ต่อ)', blocks: [
      <PrintSection title="ไฟล์แนบ" hint={`${doc.attachments.length} ไฟล์`} />,
      ...printAttachmentBlocks(files, { columns: 2 }),
    ] })
  }

  return <PrintPreview open={open} onClose={onClose} docNo={doc.docNumber} title="บันทึกรับเลือดจากภายนอก" subtitle="External Blood Receiving" docNoLabel="เลขที่เอกสาร" watermark="PLASM" watermarkSub="External Blood" pages={pages} />
}
