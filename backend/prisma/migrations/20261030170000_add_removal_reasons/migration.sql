-- CreateTable: ตัวเลือกหมายเหตุการลบ unit
CREATE TABLE "master_removal_reasons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "master_removal_reasons_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "master_removal_reasons_name_key" ON "master_removal_reasons"("name");

-- ค่าเริ่มต้น (แก้ไข/ปิดใช้งานได้ที่ ตั้งค่า > หมายเหตุการลบ)
INSERT INTO "master_removal_reasons" ("id", "name", "sort") VALUES
  ('rr_default_1', 'สแกนผิดกล่อง', 0),
  ('rr_default_2', 'บันทึกเลข unit ผิด', 1),
  ('rr_default_3', 'ถุงชำรุด / รั่ว', 2),
  ('rr_default_4', 'อื่นๆ', 3);
