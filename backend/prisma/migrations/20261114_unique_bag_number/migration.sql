-- ลบ record ถุงเลือดที่ซ้ำ (เก็บไว้เฉพาะ record แรก)
DELETE FROM ext_bags
WHERE id NOT IN (
  SELECT MIN(id) FROM ext_bags GROUP BY bag_number
);

-- เปลี่ยน index เป็น unique constraint
DROP INDEX IF EXISTS "ext_bags_bag_number_idx";

-- CreateIndex
CREATE UNIQUE INDEX "ext_bags_bag_number_key" ON "ext_bags"("bag_number");
