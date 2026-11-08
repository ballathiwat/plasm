-- คณะกรรมการอนุมัติเอกสารรับเลือดจากภายนอก
CREATE TYPE "ExtCommitteeRole" AS ENUM ('VERIFIER', 'STORER', 'APPROVER');
CREATE TYPE "ExtCommitteeStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "ext_committee" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ExtCommitteeRole" NOT NULL,
    "status" "ExtCommitteeStatus" NOT NULL DEFAULT 'DRAFT',
    "reason" TEXT,
    "acted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ext_committee_pkey" PRIMARY KEY ("id")
);
-- 1 คน 1 หน้าที่ ต่อเอกสาร
CREATE UNIQUE INDEX "ext_committee_document_id_user_id_key" ON "ext_committee"("document_id", "user_id");
CREATE INDEX "ext_committee_user_id_status_idx" ON "ext_committee"("user_id", "status");

ALTER TABLE "ext_committee" ADD CONSTRAINT "ext_committee_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "ext_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ext_committee" ADD CONSTRAINT "ext_committee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ext_documents" ADD COLUMN "submitted_at" TIMESTAMP(3);
