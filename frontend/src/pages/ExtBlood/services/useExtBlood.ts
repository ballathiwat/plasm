// frontend/src/pages/ExtBlood/services/useExtBlood.ts

import { useState, useEffect, useCallback } from 'react'
import extBloodService from './ExtBloodService'
import type { ExtPaginatedResponse } from './ExtBloodService'
import type {
  ExtDocument, ExtDocStatus, ExtListFilter, ExtSummary,
  ExtSource, ExtStorage, ExtBloodProduct, ExtExportReason,
} from './ExtBloodType'

export type TabKey = 'ALL' | ExtDocStatus

const TAB_TO_STATUS: Record<TabKey, ExtDocStatus | undefined> = {
  ALL: undefined, DRAFT: 'DRAFT', PENDING: 'PENDING',
  APPROVED: 'APPROVED', REJECTED: 'REJECTED', EXPORTED: 'EXPORTED', CANCELLED: 'CANCELLED',
}

export default function useExtBlood() {
  const [documents, setDocuments] = useState<ExtDocument[]>([])
  const [summary, setSummary] = useState<ExtSummary | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTabRaw] = useState<TabKey>('ALL')
  const [filter, setFilterRaw] = useState<ExtListFilter>({ page: 1, limit: 20 })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [detailDoc, setDetailDoc] = useState<ExtDocument | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [sources, setSources] = useState<ExtSource[]>([])
  const [storages, setStorages] = useState<ExtStorage[]>([])
  const [bloodProducts, setBloodProducts] = useState<ExtBloodProduct[]>([])
  const [exportReasons, setExportReasons] = useState<ExtExportReason[]>([])

  useEffect(() => {
    Promise.all([
      extBloodService.getSources(),
      extBloodService.getStorages(),
      extBloodService.getBloodProducts(),
      extBloodService.getExportReasons(),
    ]).then(([src, stg, bp, er]) => {
      setSources(src.filter(s => s.active))
      setStorages(stg.filter(s => s.active))
      setBloodProducts(bp.filter(b => b.active))
      setExportReasons(er.filter(r => r.active))
    })
  }, [])

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const params: ExtListFilter = { ...filter }
      const statusFromTab = TAB_TO_STATUS[activeTab]
      if (statusFromTab) params.status = statusFromTab
      const res: ExtPaginatedResponse = await extBloodService.getDocuments(params)
      setDocuments(res.data)
      setTotalPages(res.totalPages)
      setTotalItems(res.total)
    } catch { setDocuments([]) }
    finally { setLoading(false) }
  }, [filter, activeTab])

  const fetchSummary = useCallback(async () => {
    try { setSummary(await extBloodService.getSummary()) } catch {}
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])
  useEffect(() => { fetchSummary() }, [fetchSummary])

  const refresh = useCallback(() => {
    fetchDocuments(); fetchSummary(); setSelectedIds([])
  }, [fetchDocuments, fetchSummary])

  const setActiveTab = (tab: TabKey) => { setActiveTabRaw(tab); setFilterRaw(p => ({ ...p, page: 1 })); setSelectedIds([]) }
  const setFilter = (f: Partial<ExtListFilter>) => { setFilterRaw(p => ({ ...p, ...f, page: 1 })); setSelectedIds([]) }
  const setPage = (p: number) => { setFilterRaw(prev => ({ ...prev, page: p })); setSelectedIds([]) }

  const toggleSelect = (id: string) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleSelectAll = () => {
    const ids = documents.filter(d => d.status === 'PENDING').map(d => d.id)
    setSelectedIds(ids.every(id => selectedIds.includes(id)) ? [] : ids)
  }
  const clearSelection = () => setSelectedIds([])

  const openDetail = (doc: ExtDocument) => { setDetailDoc(doc); setShowDetailModal(true) }
  const closeDetail = () => { setShowDetailModal(false); setDetailDoc(null) }
  const openApprove = (doc?: ExtDocument) => { if (doc) setDetailDoc(doc); setShowApproveModal(true) }
  const closeApprove = () => setShowApproveModal(false)
  const openExport = (doc: ExtDocument) => { setDetailDoc(doc); setShowExportModal(true) }
  const closeExport = () => setShowExportModal(false)

  const handleApprove = async (id: string, pin: string) => { await extBloodService.approve(id, pin); refresh() }
  const handleReject = async (id: string, reason: string, pin: string) => { await extBloodService.reject(id, { reason, pin }); refresh() }
  const handleBatchApprove = async (pin: string) => { await extBloodService.batchApprove(selectedIds, pin); refresh() }
  const handleBatchReject = async (reason: string, pin: string) => { await extBloodService.batchReject(selectedIds, { reason, pin }); refresh() }
  const handleDelete = async (id: string) => { await extBloodService.deleteDocument(id); refresh() }
  const handleExportBags = async (docId: string, bagIds: string[], reasonId: string, date: string, note: string, pin: string) => {
    await extBloodService.exportBags(docId, { bagIds, reasonId, date, note, pin }); refresh()
  }

  return {
    documents, summary, totalPages, totalItems,
    sources, storages, bloodProducts, exportReasons,
    loading, activeTab, filter, selectedIds,
    detailDoc, showDetailModal, showApproveModal, showExportModal,
    setActiveTab, setFilter, setPage,
    toggleSelect, toggleSelectAll, clearSelection,
    openDetail, closeDetail, openApprove, closeApprove, openExport, closeExport,
    refresh, handleBatchApprove, handleBatchReject,
    handleApprove, handleReject, handleDelete, handleExportBags,
  }
}
