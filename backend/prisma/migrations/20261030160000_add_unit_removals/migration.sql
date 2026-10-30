-- CreateTable: บันทึกการลบ unit พร้อมหมายเหตุ
CREATE TABLE "unit_removals" (
    "id" TEXT NOT NULL,
    "unit_number" TEXT NOT NULL,
    "box_id" TEXT NOT NULL,
    "box_label" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "user_id" TEXT,
    "removed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_removals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "unit_removals_unit_number_idx" ON "unit_removals"("unit_number");
CREATE INDEX "unit_removals_box_id_idx" ON "unit_removals"("box_id");

-- AddForeignKey
ALTER TABLE "unit_removals" ADD CONSTRAINT "unit_removals_box_id_fkey"
  FOREIGN KEY ("box_id") REFERENCES "boxes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "unit_removals" ADD CONSTRAINT "unit_removals_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
