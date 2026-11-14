// frontend/src/pages/ExtBlood/services/useExtBlood.ts

import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../Routes/AuthProtected'
import extBloodService from './ExtBloodService'
import { myPending } from './committeeHelpers'
import { validatePostImages } from './extHelpers'
import type {
  ExtDocument, ExtDocStatus, ExtListFilter, ExtSummary, ExtCounts,
  ExtSource, ExtStorage, ExtBloodProduct, ExtExportReason,
} from './ExtBloodType'

export type TabKey = 'MINE' | 'ALL' | ExtDocStatus
export interface ToastState { type: 'success' | 'error' | 'warning' | 'info'; msg: string }

export default function useExtBlood() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<ExtDocument[]>([])
  const [summary, setSummary] = useState<ExtSummary | null>(null)
  const [counts, setCounts] = useState<ExtCounts>({ mine: 0, byStatus: {} })
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTabRaw] = useState<TabKey | null>(null)
  const [filter, setFilterRaw] = useState<ExtListFilter>({ page: 1, limit: 20 })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [detailDoc, setDetailDoc] = useState<ExtDocument | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [deleteDoc, setDeleteDoc] = useState<ExtDocument | null>(null)
  const [toast, setToast] = useState<ToastState | null>((location.state as { toast?: ToastState } | null)?.toast ?? null)
  const [sources, setSources] = useState<ExtSource[]>([])
  const [storages, setStorages] = useState<ExtStorage[]>([])
  const [bloodProducts, setBloodProducts] = useState<ExtBloodProduct[]>([])
  const [exportReasons, setExportReasons] = useState<ExtExportReason[]>([])

  // ล้าง toast จาก navigation state (กัน refresh แล้วขึ้นซ้ำ)
  useEffect(() => { if ((location.state as any)?.toast) navigate(location.pathname, { replace: true, state: null }) }, [])

  useEffect(() => {
    Promise.all([
      extBloodService.getSources(), extBloodService.getStorages(),
      extBloodService.getBloodProducts(), extBloodService.getExportReasons(),
    ]).then(([src, stg, bp, er]) => {
      setSources(src.filter((s) => s.active)); setStorages(stg.filter((s) => s.active))
      setBloodProducts(bp.filter((b) => b.active)); setExportReasons(er.filter((r) => r.active))
    })
  }, [])

  const fetchCounts = useCallback(async () => {
    try {
      const c = await extBloodService.getCounts()
      setCounts(c)
      // เปิดหน้าครั้งแรก: มีงานรอ → แท็บ "รอฉันอนุมัติ"
      setActiveTabRaw((t) => t ?? (c.mine > 0 ? 'MINE' : 'ALL'))
    } catch { setActiveTabRaw((t) => t ?? 'ALL') }
  }, [])

  const fetchDocuments = useCallback(async () => {
    if (!activeTab) return
    setLoading(true)
    try {
      const params: ExtListFilter = { ...filter }
      if (activeTab !== 'ALL' && activeTab !== 'MINE') params.status = activeTab
      const res = activeTab === 'MINE' ? await extBloodService.getInbox(params) : await extBloodService.getDocuments(params)
      setDocuments(res.data); setTotalPages(res.totalPages); setTotalItems(res.total)
    } catch { setDocuments([]) } finally { setLoading(false) }
  }, [filter, activeTab])

  const fetchSummary = useCallback(async () => { try { setSummary(await extBloodService.getSummary()) } catch { /* ignore */ } }, [])

  useEffect(() => { fetchCounts(); fetchSummary() }, [fetchCounts, fetchSummary])
  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const refresh = useCallback(() => { fetchDocuments(); fetchSummary(); fetchCounts(); setSelectedIds([]) }, [fetchDocuments, fetchSummary, fetchCounts])

  const setActiveTab = (tab: TabKey) => { setActiveTabRaw(tab); setFilterRaw((p) => ({ ...p, page: 1 })); setSelectedIds([]) }
  const setFilter = (f: Partial<ExtListFilter>) => { setFilterRaw((p) => ({ ...p, ...f, page: 1 })); setSelectedIds([]) }
  const setPage = (p: number) => { setFilterRaw((prev) => ({ ...prev, page: p })); setSelectedIds([]) }

  // เลือกได้เฉพาะเอกสารที่รอ "ฉัน" อนุมัติ
  const isMine = (d: ExtDocument) => !!myPending(d, user.id)
  const toggleSelect = (id: string) => setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  const toggleSelectAll = () => {
    const ids = documents.filter(isMine).map((d) => d.id)
    setSelectedIds(ids.every((id) => selectedIds.includes(id)) ? [] : ids)
  }
  const clearSelection = () => setSelectedIds([])

  const openDetail = (doc: ExtDocument) => { setDetailDoc(doc); setShowDetailModal(true) }
  const closeDetail = () => { setShowDetailModal(false); setDetailDoc(null) }
  const openApprove = (doc?: ExtDocument) => { setDetailDoc(doc ?? null); setShowApproveModal(true) }
  const closeApprove = () => { setShowApproveModal(false); setDetailDoc(null) }
  const openExport = (doc: ExtDocument) => { setDetailDoc(doc); setShowExportModal(true) }
  const closeExport = () => setShowExportModal(false)

  const say = (t: ToastState) => setToast(t)
  const handleDecide = async (id: string, decision: 'approve' | 'reject', pin: string, reason?: string) => {
    const doc = await extBloodService.decide(id, { decision, reason, pin })
    say(decision === 'approve'
      ? { type: 'success', msg: doc.status === 'APPROVED' ? `${doc.docNumber} อนุมัติครบแล้ว` : `อนุมัติส่วนของคุณใน ${doc.docNumber} แล้ว` }
      : { type: 'warning', msg: `ส่ง ${doc.docNumber} กลับให้ผู้สร้างแก้ไขแล้ว` })
    refresh(); window.dispatchEvent(new Event('plasm:noti-refresh'))
  }
  const handleBatchApprove = async (pin: string) => {
    const r = await extBloodService.batchApproveMine(selectedIds, pin)
    say({ type: 'success', msg: `อนุมัติส่วนของคุณ ${r.count} เอกสารแล้ว` }); refresh()
  }
  const handleRecall = async (doc: ExtDocument) => {
    try { await extBloodService.recall(doc.id); say({ type: 'info', msg: `ดึง ${doc.docNumber} กลับเป็นร่างแล้ว` }); refresh() }
    catch (e: any) { say({ type: 'error', msg: e?.message || 'ดึงกลับไม่สำเร็จ' }) }
  }
  const handleDelete = async () => {
    if (!deleteDoc) return
    try { await extBloodService.deleteDocument(deleteDoc.id); say({ type: 'success', msg: `ลบ ${deleteDoc.docNumber} แล้ว` }); setDeleteDoc(null); refresh() }
    catch (e: any) { say({ type: 'error', msg: e?.message || 'ลบไม่สำเร็จ' }) }
  }
  const handleExportBags = async (docId: string, bagIds: string[], reasonId: string, date: string, note: string, pin: string) => {
    await extBloodService.exportBags(docId, { bagIds, reasonId, date, note, pin })
    say({ type: 'success', msg: `นำออก ${bagIds.length} ถุงสำเร็จ` }); refresh()
  }

  /** เพิ่มรูปหลังอนุมัติ — คืนข้อความ error (แสดงใน modal) หรือ null เมื่อสำเร็จ */
  const handleUploadPostImages = async (doc: ExtDocument, files: File[]): Promise<string | null> => {
    const invalid = validatePostImages(files)
    if (invalid) return invalid
    try {
      const fd = new FormData()
      files.forEach((f) => fd.append('files', f))
      const updated = await extBloodService.uploadPostApprovalImages(doc.id, fd)
      setDetailDoc(updated)
      setDocuments((p) => p.map((d) => (d.id === updated.id ? updated : d)))
      say({ type: 'success', msg: `เพิ่มรูปใน ${updated.docNumber} แล้ว ${files.length} รูป` })
      return null
    } catch (e: unknown) {
      console.error('uploadPostApprovalImages', e)
      return (e as { message?: string })?.message || 'อัปโหลดรูปไม่สำเร็จ'
    }
  }

  return {
    user, documents, summary, counts, totalPages, totalItems,
    sources, storages, bloodProducts, exportReasons,
    loading, activeTab: activeTab ?? 'ALL', filter, selectedIds, isMine,
    detailDoc, showDetailModal, showApproveModal, showExportModal, deleteDoc, setDeleteDoc,
    toast, dismissToast: () => setToast(null),
    setActiveTab, setFilter, setPage,
    toggleSelect, toggleSelectAll, clearSelection,
    openDetail, closeDetail, openApprove, closeApprove, openExport, closeExport,
    refresh, handleDecide, handleBatchApprove, handleRecall, handleDelete, handleExportBags, handleUploadPostImages,
  }
}
