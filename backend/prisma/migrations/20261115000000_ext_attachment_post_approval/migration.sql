-- รูปที่เพิ่มหลังอนุมัติ (รับเลือดจากภายนอก)
-- รูปเดิมทั้งหมดถือเป็นรูปก่อนอนุมัติ → is_post_approval = false (ค่า default)
-- uploaded_by_id ของรูปเดิมเป็น NULL เพราะไม่เคยเก็บข้อมูลผู้อัปโหลด

-- AlterTable
ALTER TABLE "ext_attachments"
  ADD COLUMN "is_post_approval" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "uploaded_by_id" TEXT;

-- AddForeignKey
ALTER TABLE "ext_attachments"
  ADD CONSTRAINT "ext_attachments_uploaded_by_id_fkey"
  FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
