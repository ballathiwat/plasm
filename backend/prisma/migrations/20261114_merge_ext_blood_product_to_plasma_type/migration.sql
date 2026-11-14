-- Migration: Merge ext_blood_products into master_plasma_types
-- ExtDocument.blood_product_id จะชี้ไป master_plasma_types แทน ext_blood_products
-- ============================================================

-- Step 1: เพิ่ม code ที่มีใน ext_blood_products แต่ไม่มีใน master_plasma_types
-- (ป้องกัน orphan FK กรณี admin ตั้ง code ไม่เหมือนกัน)
INSERT INTO master_plasma_types (id, code, name, active, sort)
SELECT
  concat('migext_', substr(md5(random()::text || clock_timestamp()::text), 1, 20)),
  ebp.code,
  ebp.name,
  ebp.active,
  ebp.sort + COALESCE((SELECT MAX(sort) FROM master_plasma_types), 0) + 1
FROM ext_blood_products ebp
WHERE NOT EXISTS (
  SELECT 1 FROM master_plasma_types mpt WHERE mpt.code = ebp.code
);

-- Step 2: remap ext_documents.blood_product_id จาก ext_blood_products.id → master_plasma_types.id
-- ใช้ code เป็นตัวเชื่อม
UPDATE ext_documents ed
SET blood_product_id = mpt.id
FROM ext_blood_products ebp
JOIN master_plasma_types mpt ON mpt.code = ebp.code
WHERE ed.blood_product_id = ebp.id;

-- Step 3: ลบ FK เดิมที่ชี้ ext_blood_products
ALTER TABLE ext_documents DROP CONSTRAINT IF EXISTS ext_documents_blood_product_id_fkey;

-- Step 4: เพิ่ม FK ใหม่ที่ชี้ master_plasma_types
ALTER TABLE ext_documents ADD CONSTRAINT ext_documents_blood_product_id_fkey
  FOREIGN KEY (blood_product_id) REFERENCES master_plasma_types(id);

-- Step 5: ลบตาราง ext_blood_products (ย้ายข้อมูลไปหมดแล้ว)
DROP TABLE IF EXISTS ext_blood_products;
