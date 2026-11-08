-- AlterTable: เพิ่ม PIN fields ใน users
ALTER TABLE "users" ADD COLUMN "pin_hash" TEXT;
ALTER TABLE "users" ADD COLUMN "pin_fail_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "pin_locked_until" TIMESTAMP(3);

-- CreateEnum
CREATE TYPE "ExtDocStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'EXPORTED', 'CANCELLED');
CREATE TYPE "ExtBagStatus" AS ENUM ('IN_STOCK', 'EXPORTED');

-- CreateTable: ext_sources
CREATE TABLE "ext_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ext_sources_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ext_sources_name_key" ON "ext_sources"("name");

-- CreateTable: ext_storages
CREATE TABLE "ext_storages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ext_storages_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ext_storages_name_key" ON "ext_storages"("name");

-- CreateTable: ext_blood_products
CREATE TABLE "ext_blood_products" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ext_blood_products_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ext_blood_products_code_key" ON "ext_blood_products"("code");

-- CreateTable: ext_export_reasons
CREATE TABLE "ext_export_reasons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ext_export_reasons_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ext_export_reasons_name_key" ON "ext_export_reasons"("name");

-- CreateTable: ext_documents
CREATE TABLE "ext_documents" (
    "id" TEXT NOT NULL,
    "doc_number" TEXT NOT NULL,
    "received_date" DATE NOT NULL,
    "source_id" TEXT NOT NULL,
    "blood_product_id" TEXT NOT NULL,
    "blood_group" TEXT NOT NULL,
    "box_label" TEXT NOT NULL,
    "storage_id" TEXT NOT NULL,
    "status" "ExtDocStatus" NOT NULL DEFAULT 'DRAFT',
    "edit_reason" TEXT,
    "defer_approval" BOOLEAN NOT NULL DEFAULT false,
    "verifier_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "verifier_pin" BOOLEAN NOT NULL DEFAULT false,
    "storer_id" TEXT,
    "stored_at" TIMESTAMP(3),
    "storer_pin" BOOLEAN NOT NULL DEFAULT false,
    "approver_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "approver_pin" BOOLEAN NOT NULL DEFAULT false,
    "reject_reason" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ext_documents_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ext_documents_doc_number_key" ON "ext_documents"("doc_number");

-- CreateTable: ext_bags
CREATE TABLE "ext_bags" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "bag_number" TEXT NOT NULL,
    "status" "ExtBagStatus" NOT NULL DEFAULT 'IN_STOCK',
    "exported_at" TIMESTAMP(3),
    "export_id" TEXT,
    CONSTRAINT "ext_bags_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ext_bags_bag_number_idx" ON "ext_bags"("bag_number");

-- CreateTable: ext_attachments
CREATE TABLE "ext_attachments" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ext_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ext_exports
CREATE TABLE "ext_exports" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "reason_id" TEXT NOT NULL,
    "export_date" DATE NOT NULL,
    "note" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ext_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ext_timeline
CREATE TABLE "ext_timeline" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ext_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ext_doc_counters
CREATE TABLE "ext_doc_counters" (
    "year" INTEGER NOT NULL,
    "last_no" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ext_doc_counters_pkey" PRIMARY KEY ("year")
);

-- AddForeignKey
ALTER TABLE "ext_documents" ADD CONSTRAINT "ext_documents_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "ext_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ext_documents" ADD CONSTRAINT "ext_documents_blood_product_id_fkey" FOREIGN KEY ("blood_product_id") REFERENCES "ext_blood_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ext_documents" ADD CONSTRAINT "ext_documents_storage_id_fkey" FOREIGN KEY ("storage_id") REFERENCES "ext_storages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ext_documents" ADD CONSTRAINT "ext_documents_verifier_id_fkey" FOREIGN KEY ("verifier_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ext_documents" ADD CONSTRAINT "ext_documents_storer_id_fkey" FOREIGN KEY ("storer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ext_documents" ADD CONSTRAINT "ext_documents_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ext_documents" ADD CONSTRAINT "ext_documents_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ext_bags" ADD CONSTRAINT "ext_bags_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "ext_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ext_bags" ADD CONSTRAINT "ext_bags_export_id_fkey" FOREIGN KEY ("export_id") REFERENCES "ext_exports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ext_attachments" ADD CONSTRAINT "ext_attachments_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "ext_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ext_exports" ADD CONSTRAINT "ext_exports_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "ext_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ext_exports" ADD CONSTRAINT "ext_exports_reason_id_fkey" FOREIGN KEY ("reason_id") REFERENCES "ext_export_reasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ext_exports" ADD CONSTRAINT "ext_exports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ext_timeline" ADD CONSTRAINT "ext_timeline_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "ext_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ext_timeline" ADD CONSTRAINT "ext_timeline_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
