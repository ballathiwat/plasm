// frontend/src/pages/ExtBloodSettings/services/useExtSettings.ts
import { useState, useEffect, useCallback } from 'react'
import svc from './ExtSettingsService'
import type { ExtSource, ExtStorage } from '../../ExtBlood/services/ExtBloodType'
export default function useExtSettings() {
  const [sources, setSources] = useState<ExtSource[]>([])
  const [storages, setStorages] = useState<ExtStorage[]>([])
  const [loading, setLoading] = useState(true)
  const fetch = useCallback(async () => { setLoading(true); try { const [s, t] = await Promise.all([svc.getSources(), svc.getStorages()]); setSources(s.sort((a, b) => a.sort - b.sort)); setStorages(t.sort((a, b) => a.sort - b.sort)) } finally { setLoading(false) } }, [])
  useEffect(() => { fetch() }, [fetch])
  return {
    sources, storages, loading,
    addSource: async (n: string) => { await svc.createSource(n); fetch() },
    updateSource: async (id: string, d: Partial<ExtSource>) => { await svc.updateSource(id, d); fetch() },
    deleteSource: async (id: string) => { await svc.deleteSource(id); fetch() },
    reorderSources: async (ids: string[]) => { setSources(p => ids.map(id => p.find(x => x.id === id)!).filter(Boolean)); await svc.reorderSources(ids) },
    addStorage: async (n: string) => { await svc.createStorage(n); fetch() },
    updateStorage: async (id: string, d: Partial<ExtStorage>) => { await svc.updateStorage(id, d); fetch() },
    deleteStorage: async (id: string) => { await svc.deleteStorage(id); fetch() },
    reorderStorages: async (ids: string[]) => { setStorages(p => ids.map(id => p.find(x => x.id === id)!).filter(Boolean)); await svc.reorderStorages(ids) },
  }
}
