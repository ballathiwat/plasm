// ============================================================
//  src/pages/withdraw/services/useWithdraw.ts
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import withdrawService from './WithdrawService'
import type {
  WithdrawBoxItem,
  WithdrawBoxDetail,
  ConfirmAction,
  ToastState,
} from './WithdrawType'

export default function useWithdraw() {
  // ── Box list ──
  const [boxes, setBoxes] = useState<WithdrawBoxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBlood, setFilterBlood] = useState<string>('')

  // ── Detail / withdraw ──
  const [selectedBox, setSelectedBox] = useState<WithdrawBoxDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [withdrawingBox, setWithdrawingBox] = useState(false)
  const [withdrawingUnits, setWithdrawingUnits] = useState<Set<string>>(new Set())

  // ── UI feedback ──
  const [toast, setToast] = useState<ToastState | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  // ── Load stored boxes ──
  const loadBoxes = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filterBlood) params.blood = filterBlood
      const data = await withdrawService.getStoredBoxes(params)
      setBoxes(data)
    } catch {
      setBoxes([])
    } finally {
      setLoading(false)
    }
  }, [filterBlood])

  useEffect(() => { loadBoxes() }, [loadBoxes])

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  // ── Open box detail ──
  const openBoxDetail = async (boxId: string) => {
    setLoadingDetail(true)
    try {
      const data = await withdrawService.getBoxDetail(boxId)
      setSelectedBox(data)
    } catch {
      setToast({ type: 'error', msg: 'ไม่สามารถโหลดรายละเอียดกล่องได้' })
    } finally {
      setLoadingDetail(false)
    }
  }

  const closeBoxDetail = () => setSelectedBox(null)

  // ── Withdraw whole box ──
  const handleWithdrawBox = (box: WithdrawBoxDetail) => {
    setConfirmAction({
      title: 'นำออกทั้งกล่อง',
      msg: `ยืนยันนำออกกล่อง ${box.boxLabel} ทั้งหมด ${box.storedCount} units?`,
      onConfirm: async () => {
        setConfirmAction(null)
        setWithdrawingBox(true)
        try {
          await withdrawService.withdrawBox(box.id)
          setToast({ type: 'success', msg: `นำออกกล่อง ${box.boxLabel} สำเร็จ` })
          setSelectedBox(null)
          loadBoxes()
        } catch (err: any) {
          setToast({ type: 'error', msg: err?.response?.data?.message || 'เกิดข้อผิดพลาด' })
        } finally {
          setWithdrawingBox(false)
        }
      },
    })
  }

  // ── Withdraw single unit ──
  const handleWithdrawUnit = (unitId: string, unitNumber: string) => {
    setConfirmAction({
      title: 'นำออก Unit',
      msg: `ยืนยันนำออก unit ${unitNumber}?`,
      onConfirm: async () => {
        setConfirmAction(null)
        setWithdrawingUnits((s) => new Set(s).add(unitId))
        try {
          await withdrawService.withdrawUnit(unitId)
          setToast({ type: 'success', msg: `นำออก unit ${unitNumber} สำเร็จ` })
          // Reload detail
          if (selectedBox) {
            const updated = await withdrawService.getBoxDetail(selectedBox.id)
            setSelectedBox(updated)
          }
          loadBoxes()
        } catch (err: any) {
          setToast({ type: 'error', msg: err?.response?.data?.message || 'เกิดข้อผิดพลาด' })
        } finally {
          setWithdrawingUnits((s) => { const n = new Set(s); n.delete(unitId); return n })
        }
      },
    })
  }

  // ── Cancel confirm ──
  const cancelConfirm = () => setConfirmAction(null)
  const dismissToast = () => setToast(null)

  // ── Filtered boxes ──
  const filteredBoxes = boxes.filter((b) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return b.boxLabel.toLowerCase().includes(q) || b.units.some((u) => u.toLowerCase().includes(q))
  })

  return {
    // data
    boxes,
    filteredBoxes,
    selectedBox,
    loading,
    loadingDetail,
    withdrawingBox,
    withdrawingUnits,
    toast,
    confirmAction,
    searchQuery,
    filterBlood,
    // actions
    setSearchQuery,
    setFilterBlood,
    openBoxDetail,
    closeBoxDetail,
    handleWithdrawBox,
    handleWithdrawUnit,
    cancelConfirm,
    dismissToast,
  }
}