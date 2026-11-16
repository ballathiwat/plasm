-- Migration: min_stock_by_type
-- สต็อกขั้นต่ำแยกตาม "ชนิดเลือด × หมู่เลือด" (เดิม: ค่าเดียวต่อหมู่เลือดใน settings.key = 'minimumStock')
--
-- หมายเหตุสำคัญ
--   * ไม่คัดลอกค่าเดิมมาใส่ตารางใหม่ — ค่าเดิมเป็นยอดรวมทุกชนิด ใช้เป็นขั้นต่ำรายชนิดตรงๆ ไม่ได้
--     ทุกคู่จึงเริ่มที่ "ไม่ได้ตั้งค่า" (ไม่มีแถว / min_units = NULL) จนกว่า ADMIN จะกรอกในหน้า ตั้งค่า › สต็อกขั้นต่ำ
--   * ไม่ลบ settings.key = 'minimumStock' — เก็บไว้อ้างอิงจนกว่าจะยืนยันลบ (โค้ดไม่ได้อ่านค่านี้แล้ว)
--   * การแจ้งเตือน lowstock แบบรายหมู่เดิมคำนวณสด ไม่มีข้อมูลค้างในฐานข้อมูลให้ต้องย้าย
-- ============================================================

-- Step 1: ค่าขั้นต่ำต่อคู่ ชนิด × หมู่
CREATE TABLE "min_stock" (
    "id" TEXT NOT NULL,
    "plasma_type_id" TEXT NOT NULL,
    "blood_type_id" TEXT NOT NULL,
    "min_units" INTEGER,
    "updated_by_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "min_stock_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "min_stock_min_units_check" CHECK ("min_units" IS NULL OR "min_units" >= 0)
);

CREATE UNIQUE INDEX "min_stock_plasma_type_id_blood_type_id_key"
  ON "min_stock" ("plasma_type_id", "blood_type_id");

ALTER TABLE "min_stock" ADD CONSTRAINT "min_stock_plasma_type_id_fkey"
  FOREIGN KEY ("plasma_type_id") REFERENCES "master_plasma_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "min_stock" ADD CONSTRAINT "min_stock_blood_type_id_fkey"
  FOREIGN KEY ("blood_type_id") REFERENCES "master_blood_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "min_stock" ADD CONSTRAINT "min_stock_updated_by_id_fkey"
  FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 2: การแจ้งเตือนสต็อกต่ำต่อคู่ ชนิด × หมู่ (มีแถวเฉพาะคู่ที่ DANGER / WARNING)
CREATE TYPE "StockAlertStatus" AS ENUM ('DANGER', 'WARNING');

CREATE TABLE "stock_alerts" (
    "id" TEXT NOT NULL,
    "plasma_type_id" TEXT NOT NULL,
    "blood_type_id" TEXT NOT NULL,
    "status" "StockAlertStatus" NOT NULL,
    "since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged_at" TIMESTAMP(3),
    "acknowledged_by_id" TEXT,

    CONSTRAINT "stock_alerts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "stock_alerts_plasma_type_id_blood_type_id_key"
  ON "stock_alerts" ("plasma_type_id", "blood_type_id");

ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_plasma_type_id_fkey"
  FOREIGN KEY ("plasma_type_id") REFERENCES "master_plasma_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_blood_type_id_fkey"
  FOREIGN KEY ("blood_type_id") REFERENCES "master_blood_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_acknowledged_by_id_fkey"
  FOREIGN KEY ("acknowledged_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 3: index สำหรับนับสต็อกตาม ชนิด × หมู่ (GET /stock/min-stock/status เรียกทุก 60 วินาที)
CREATE INDEX IF NOT EXISTS "boxes_plasma_type_id_blood_type_id_status_idx"
  ON "boxes" ("plasma_type_id", "blood_type_id", "status");
