-- Rack map: ตำแหน่งระดับ rack(shelf) → ชั้น(level 1–5) → ช่อง(position 1–20) สำหรับห้อง -30°C
-- ตู้ -30°C (zone อื่น) ยังใช้ shelf อย่างเดียว → level/position เป็น NULL

-- boxes: ชั้น + ช่อง
ALTER TABLE "boxes" ADD COLUMN "level" INTEGER;
ALTER TABLE "boxes" ADD COLUMN "position" INTEGER;
ALTER TABLE "boxes" ADD CONSTRAINT "boxes_level_check" CHECK ("level" IS NULL OR "level" BETWEEN 1 AND 5);
ALTER TABLE "boxes" ADD CONSTRAINT "boxes_position_check" CHECK ("position" IS NULL OR "position" BETWEEN 1 AND 20);

-- กันสองกล่องอยู่ช่องเดียวกัน (เฉพาะกล่องที่ยังจัดเก็บอยู่)
CREATE UNIQUE INDEX "boxes_slot_stored_key"
  ON "boxes" ("zone_id", "shelf", "level", "position")
  WHERE "status" = 'STORED' AND "level" IS NOT NULL AND "position" IS NOT NULL;

-- units: ลำดับถุงในกล่อง (1 = หน้า/ฝาเปิด … 10 = หลัง)
ALTER TABLE "units" ADD COLUMN "seq" INTEGER;

-- ล็อกช่องระหว่างแก้ไข (TTL 60s, ต่ออายุด้วย heartbeat)
CREATE TABLE "slot_locks" (
    "id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "shelf" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slot_locks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "slot_locks_zone_id_shelf_level_position_key"
  ON "slot_locks"("zone_id", "shelf", "level", "position");
CREATE INDEX "slot_locks_expires_at_idx" ON "slot_locks"("expires_at");

ALTER TABLE "slot_locks" ADD CONSTRAINT "slot_locks_zone_id_fkey"
  FOREIGN KEY ("zone_id") REFERENCES "master_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "slot_locks" ADD CONSTRAINT "slot_locks_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
