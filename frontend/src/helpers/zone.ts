// frontend/src/helpers/zone.ts

/**
 * ชื่อสถานที่จัดเก็บสำหรับแสดงผล
 * ใช้ zoneName จาก backend เป็นหลัก — fallback เฉพาะข้อมูลที่ยังไม่มี zoneName
 */
export const zoneLabel = (zoneName?: string | null, location?: string | null): string => {
  if (zoneName) return zoneName
  if (location === 'room') return 'ห้อง -30°C'
  if (location === 'cabinet') return 'ตู้ -30°C'
  return '-'
}
