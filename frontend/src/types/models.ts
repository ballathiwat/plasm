// frontend/src/types/models.ts
//
// ชนิด/หมู่เลือด/สถานที่ เป็นข้อมูลหลัก (master) ที่เพิ่มได้เอง จึงเป็น string ในทุก type
// ไฟล์นี้เก็บเฉพาะ type ที่ยังใช้ร่วมกันข้ามหน้า

export type BoxStatus = 'stored' | 'withdrawn'

// ===== Summary Card =====
export interface SummaryCardData {
  label: string
  value: string
  icon: React.ComponentType<{ size?: number }>
  color: string
  bg: string
  sub?: string
}
