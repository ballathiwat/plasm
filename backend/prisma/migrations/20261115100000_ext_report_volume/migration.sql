-- Migration: ext_report_volume
-- รองรับรายงานรับเลือดจากภายนอก (GET /api/v1/ext/reports/receipts)
--   ปริมาตรต่อถุง = COALESCE(ext_bags.volume_ml, master_plasma_types.default_volume_ml, 0)
-- หมายเหตุ: ext_blood_products ถูกยุบรวมเข้า master_plasma_types แล้ว (migration 20261114)
--           ค่ามาตรฐานต่อถุงจึงเก็บที่ master_plasma_types
-- ============================================================

-- Step 1: ปริมาตรมาตรฐานต่อถุง (ml) ของแต่ละชนิดเลือด
ALTER TABLE "master_plasma_types" ADD COLUMN IF NOT EXISTS "default_volume_ml" INTEGER;

-- Step 2: seed ค่ามาตรฐาน — แตะเฉพาะ row ที่ยังไม่มีค่า (ไม่ทับค่าที่ตั้งเองไว้แล้ว)
UPDATE "master_plasma_types"
SET "default_volume_ml" = CASE "code"
  WHEN 'FFP'  THEN 220
  WHEN 'LPRC' THEN 250
  WHEN 'PC'   THEN 55
END
WHERE "code" IN ('FFP', 'LPRC', 'PC')
  AND "default_volume_ml" IS NULL;

-- Step 3: ปริมาตรจริงรายถุง (ถ้ามี — ใช้แทนค่ามาตรฐาน)
ALTER TABLE "ext_bags" ADD COLUMN IF NOT EXISTS "volume_ml" INTEGER;

-- Step 4: index สำหรับ query รายงาน
CREATE INDEX IF NOT EXISTS "ext_documents_received_date_status_idx"
  ON "ext_documents" ("received_date", "status");
CREATE INDEX IF NOT EXISTS "ext_bags_document_id_idx"
  ON "ext_bags" ("document_id");
