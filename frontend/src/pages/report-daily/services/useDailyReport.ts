// frontend/src/pages/report-daily/services/useDailyReport.ts

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import dailyReportService from './DailyReportService'
import type { MovementResponse, FilterDraft, PresetKey } from './DailyReportType'
import type { ToastState } from '../../../components/common/Toast'

const bkkToday = (): string => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
const addDays = (iso: string, n: number): string => {
  const d = new Date(`${iso}T00:00:00+07:00`); d.setDate(d.getDate() + n)
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
}
const diffDays = (a: string, b: string): number => {
  const da = new Date(`${a}T00:00:00+07:00`), db = new Date(`${b}T00:00:00+07:00`)
  return Math.round((db.getTime() - da.getTime()) / 86400000) + 1
}

export const presetRange = (key: PresetKey): { from: string; to: string } => {
  const today = bkkToday(); const [y, m] = today.split('-').map(Number)
  switch (key) {
    case 'today': return { from: today, to: today }
    case '7d': return { from: addDays(today, -6), to: today }
    case '30d': return { from: addDays(today, -29), to: today }
    case 'this-month': return { from: `${y}-${String(m).padStart(2,'0')}-01`, to: today }
    case 'last-month': {
      const pm = m===1?12:m-1, py = m===1?y-1:y, ld = new Date(py,pm,0).getDate()
      return { from: `${py}-${String(pm).padStart(2,'0')}-01`, to: `${py}-${String(pm).padStart(2,'0')}-${String(ld).padStart(2,'0')}` }
    }
    case 'this-year': return { from: `${y}-01-01`, to: today }
    case 'last-year': return { from: `${y-1}-01-01`, to: `${y-1}-12-31` }
  }
}

export interface ValidationError { field: 'to'|'from'; message: string }
export const validateFilters = (d: FilterDraft): ValidationError | null => {
  if (!d.from || !d.to) return null
  const from = new Date(`${d.from}T00:00:00+07:00`), to = new Date(`${d.to}T00:00:00+07:00`)
  if (isNaN(from.getTime())||isNaN(to.getTime())) return null
  if (to < from) return { field:'to', message:'วันสิ้นสุดต้องไม่ก่อนวันเริ่ม' }
  if (to > new Date(`${bkkToday()}T00:00:00+07:00`)) return { field:'to', message:'เลือกวันในอนาคตไม่ได้' }
  if (diffDays(d.from, d.to) > 366) return { field:'to', message:'เลือกช่วงได้ไม่เกิน 1 ปี — ลองแบ่งดูทีละช่วง' }
  return null
}

const STORAGE_KEY = 'plasm-daily-range'
const loadSession = (): Partial<FilterDraft>|null => { try { const r=sessionStorage.getItem(STORAGE_KEY); return r?JSON.parse(r):null } catch{return null} }
const saveSession = (d: FilterDraft) => { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({from:d.from,to:d.to,preset:d.preset})) } catch{} }
const arrEq = (a:string[],b:string[]) => a.length===b.length && a.every((v,i)=>v===b[i])

export default function useDailyReport() {
  const [masterTypes, setMasterTypes] = useState<string[]>([])
  const [draft, setDraft] = useState<FilterDraft>(() => {
    const s = loadSession()
    const r = s?.from&&s?.to ? {from:s.from,to:s.to} : presetRange('7d')
    return { ...r, preset:(s?.preset as PresetKey)??'7d', types:[], blood:'all' }
  })
  const [applied, setApplied] = useState<FilterDraft>(draft)
  const [data, setData] = useState<MovementResponse|null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<ToastState|null>(null)
  const init = useRef(false)

  useEffect(() => {
    dailyReportService.getPlasmaTypes().then((c)=>{
      setMasterTypes(c)
      setDraft(p=>({...p,types:c})); setApplied(p=>({...p,types:c}))
    }).catch(()=>{})
  }, [])

  const fetchData = useCallback(async (f: FilterDraft, all: string[]) => {
    setLoading(true); setToast(null)
    try {
      const p: Record<string,string> = { from:f.from, to:f.to }
      if (f.types.length>0 && f.types.length<all.length) p.types = f.types.join(',')
      if (f.blood !== 'all') p.blood = f.blood
      setData(await dailyReportService.getMovements(p)); saveSession(f)
    } catch(e:unknown) {
      setToast({ type:'error', msg:(e as {response?:{data?:{message?:string}}})?.response?.data?.message||'เกิดข้อผิดพลาด' })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (masterTypes.length>0 && !init.current) { init.current=true; fetchData(applied,masterTypes) }
  }, [masterTypes, applied, fetchData])

  const search = useCallback(()=>{ setApplied({...draft}); fetchData(draft,masterTypes) }, [draft,masterTypes,fetchData])
  const setPreset = useCallback((k:PresetKey)=>setDraft(p=>({...p,...presetRange(k),preset:k})), [])
  const setFrom = useCallback((v:string)=>setDraft(p=>({...p,from:v,preset:null})), [])
  const setTo = useCallback((v:string)=>setDraft(p=>({...p,to:v,preset:null})), [])
  const setBlood = useCallback((v:string)=>setDraft(p=>({...p,blood:v})), [])

  const toggleType = useCallback((code:string)=>{
    setDraft(prev=>{
      if (prev.types.includes(code)) {
        if (prev.types.length===1) return prev
        return {...prev, types:prev.types.filter(x=>x!==code)}
      }
      return {...prev, types:masterTypes.filter(x=>prev.types.includes(x)||x===code)}
    })
  }, [masterTypes])

  const selectAllTypes = useCallback(()=>setDraft(p=>({...p,types:[...masterTypes]})), [masterTypes])

  const jumpTo30Days = useCallback(()=>{
    const f:FilterDraft = {...presetRange('30d'),preset:'30d',types:[...masterTypes],blood:'all'}
    setDraft(f); setApplied(f); fetchData(f,masterTypes)
  }, [masterTypes,fetchData])

  const isDirty = useMemo(()=>
    draft.from!==applied.from||draft.to!==applied.to||draft.blood!==applied.blood||!arrEq(draft.types,applied.types),
  [draft,applied])

  const validationError = useMemo(()=>validateFilters(draft),[draft])

  const typesLabel = useMemo(()=>{
    if (draft.types.length===masterTypes.length||draft.types.length===0) return 'ทุกชนิด'
    return draft.types.join(', ')
  }, [draft.types, masterTypes.length])

  return {
    masterTypes, draft, applied, data, loading, toast, setToast,
    isDirty, validationError, typesLabel,
    search, setPreset, setFrom, setTo, setBlood,
    toggleType, selectAllTypes, jumpTo30Days,
  }
}
