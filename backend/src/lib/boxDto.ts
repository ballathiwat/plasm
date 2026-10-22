// src/lib/boxDto.ts
export const zoneSelect = { select: { id: true, name: true, legacyKey: true } } as const

// 'room' / 'cabinet' สำหรับโซนเดิม, 'other' สำหรับโซนที่เพิ่มใหม่ (เฟส 3 จะเลิกใช้)
export const locationKey = (z?: { legacyKey: string | null } | null) =>
  z?.legacyKey?.toLowerCase() ?? 'other'

export function boxDto(b: any) {
  return {
    id: b.id,
    boxLabel: b.boxLabel,
    boxName: b.boxName ?? null,
    type: b.type,
    blood: b.blood,
    year: b.year,
    location: locationKey(b.zone),
    zoneId: b.zoneId,
    zoneName: b.zone?.name ?? '',
    shelf: b.shelf,
    collectionDate: b.collectionDate.toISOString().split('T')[0],
    status: b.status.toLowerCase(),
    storedAt: b.storedAt.toISOString(),
    withdrawnAt: b.withdrawnAt?.toISOString() || null,
  }
}