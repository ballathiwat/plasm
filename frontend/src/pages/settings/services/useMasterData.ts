// ============================================================
//  src/pages/settings/services/useMasterData.ts
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import masterService, { type CodeKind } from './MasterService'
import type { CodeItem, ZoneItem, ShelfItem, ToastState, RemovalReasonItem } from './SettingsType'
import { registerMasterColors } from '../../../helpers/blood'


export default function useMasterData(notify: (t: ToastState) => void) {
  const [plasmaTypes, setPlasmaTypes] = useState<CodeItem[]>([])
  const [bloodTypes, setBloodTypes] = useState<CodeItem[]>([])
  const [zones, setZones] = useState<ZoneItem[]>([])
  const [removalReasons, setRemovalReasons] = useState<RemovalReasonItem[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [p, b, z, rr] = await Promise.all([
        masterService.listCodes('plasma'),
        masterService.listCodes('blood'),
        masterService.listZones(),
        masterService.listRemovalReasons(),
      ])
      setRemovalReasons(rr)
      setPlasmaTypes(p)
      setBloodTypes(b)
      registerMasterColors(b, p)
      setZones(z)
    } catch (err: any) {
      notify({ type: 'error', msg: err?.message || 'โหลดข้อมูลไม่สำเร็จ' })
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => { reload() }, [reload])

  // สำเร็จ → toast + โหลดใหม่ / ล้มเหลว → toast error
  const run = async (fn: () => Promise<unknown>, okMsg: string) => {
    try {
      await fn()
      notify({ type: 'success', msg: okMsg })
      await reload()
      return true
    } catch (err: any) {
      notify({ type: 'error', msg: err?.message || 'เกิดข้อผิดพลาด' })
      return false
    }
  }

   const addCode = (kind: CodeKind, code: string, name?: string, color?: string) =>
    run(() => masterService.createCode(kind, { code, name, color }), `เพิ่ม "${code}" สำเร็จ`)

  // เพิ่ม updateColor
  const updateColor = (kind: CodeKind, item: CodeItem, color: string) =>
    run(
      () => masterService.updateCode(kind, item.id, { color }),
      `เปลี่ยนสี "${item.code}" สำเร็จ`,
    )

  const toggleCode = (kind: CodeKind, item: CodeItem) =>
    run(
      () => masterService.updateCode(kind, item.id, { active: !item.active }),
      `${item.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'} "${item.code}" สำเร็จ`,
    )

  const addZone = (name: string) =>
    run(() => masterService.createZone(name), `เพิ่ม "${name}" สำเร็จ`)

  const toggleZone = (z: ZoneItem) =>
    run(
      () => masterService.updateZone(z.id, { active: !z.active }),
      `${z.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'} "${z.name}" สำเร็จ`,
    )

  const addShelf = (zoneId: string, code: string) =>
    run(() => masterService.createShelf(zoneId, code), `เพิ่มชั้น "${code.toUpperCase()}" สำเร็จ`)

  const toggleShelf = (s: ShelfItem) =>
    run(
      () => masterService.updateShelf(s.id, { active: !s.active }),
      `${s.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}ชั้น "${s.code}" สำเร็จ`,
    )

  const addRemovalReason = (name: string) =>
    run(() => masterService.createRemovalReason(name), `เพิ่ม "${name}" สำเร็จ`)

  const renameRemovalReason = (r: RemovalReasonItem, name: string) =>
    run(() => masterService.updateRemovalReason(r.id, { name }), `แก้ไขเป็น "${name}" สำเร็จ`)

  const toggleRemovalReason = (r: RemovalReasonItem) =>
    run(
      () => masterService.updateRemovalReason(r.id, { active: !r.active }),
      `${r.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'} "${r.name}" สำเร็จ`,
    )

  return {
    plasmaTypes, bloodTypes, zones, removalReasons, loading,
    addCode, toggleCode,updateColor, addZone, toggleZone, addShelf, toggleShelf,
    addRemovalReason, renameRemovalReason, toggleRemovalReason,
  }
}