-- เปลี่ยนจาก 1 คน 1 หน้าที่ → 1 คนทำได้หลายหน้าที่ (ห้ามซ้ำ role เดียวกัน)
DROP INDEX IF EXISTS "ext_committee_document_id_user_id_key";
CREATE UNIQUE INDEX "ext_committee_document_id_user_id_role_key"
  ON "ext_committee"("document_id", "user_id", "role");
