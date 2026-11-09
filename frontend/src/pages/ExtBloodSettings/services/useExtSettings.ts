// frontend/src/pages/ExtBloodSettings/services/useExtSettings.ts
import { useState, useEffect, useCallback } from 'react'
import svc from './ExtSettingsService'
import type { ExtSource, ExtStorage, ExtExportReason } from '../../ExtBlood/services/ExtBloodType'

export interface SettingsItem {
  id: string; name: string; active: boolean; locked?: boolean; sort: number
}

const toItem = (x: { id: string; active: boolean; sort: number; locked?: boolean }, name: string): SettingsItem =>
  ({ id: x.id, name, active: x.active, locked: (x as any).locked, sort: x.sort })

const sortBy = <T extends { sort: number }>(arr: T[]) => [...arr].sort((a, b) => a.sort - b.sort)

export default function useExtSettings() {
  const [sources, setSources] = useState<ExtSource[]>([])
  const [storages, setStorages] = useState<ExtStorage[]>([])
  const [reasons, setReasons] = useState<ExtExportReason[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const [s, t, r] = await Promise.all([
        svc.getSources(), svc.getStorages(), svc.getExportReasons(),
      ])
      setSources(sortBy(s)); setStorages(sortBy(t)); setReasons(sortBy(r))
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const sourceItems: SettingsItem[] = sources.map((s) => toItem(s, s.name))
  const storageItems: SettingsItem[] = storages.map((s) => toItem(s, s.name))
  const reasonItems: SettingsItem[] = reasons.map((r) => toItem(r, r.name))

  return {
    sourceItems, storageItems, reasonItems, loading,

    // Sources
    addSource: async (n: string) => { await svc.createSource(n); fetch() },
    updateSource: async (id: string, d: Partial<SettingsItem>) => { await svc.updateSource(id, d); fetch() },
    deleteSource: async (id: string) => { await svc.deleteSource(id); fetch() },
    reorderSources: async (ids: string[]) => { setSources((p) => ids.map((id) => p.find((x) => x.id === id)!).filter(Boolean)); await svc.reorderSources(ids) },

    // Storages
    addStorage: async (n: string) => { await svc.createStorage(n); fetch() },
    updateStorage: async (id: string, d: Partial<SettingsItem>) => { await svc.updateStorage(id, d); fetch() },
    deleteStorage: async (id: string) => { await svc.deleteStorage(id); fetch() },
    reorderStorages: async (ids: string[]) => { setStorages((p) => ids.map((id) => p.find((x) => x.id === id)!).filter(Boolean)); await svc.reorderStorages(ids) },

    // Export Reasons
    addReason: async (n: string) => { await svc.createExportReason(n); fetch() },
    updateReason: async (id: string, d: Partial<SettingsItem>) => { await svc.updateExportReason(id, d); fetch() },
    deleteReason: async (id: string) => { await svc.deleteExportReason(id); fetch() },
    reorderReasons: async (ids: string[]) => { setReasons((p) => ids.map((id) => p.find((x) => x.id === id)!).filter(Boolean)); await svc.reorderExportReasons(ids) },
  }
}
