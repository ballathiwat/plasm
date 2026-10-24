-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "PlasmaType" AS ENUM ('FFP', 'Cryo');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A', 'B', 'O', 'AB');

-- CreateEnum
CREATE TYPE "StorageLocation" AS ENUM ('ROOM', 'CABINET');

-- CreateEnum
CREATE TYPE "BoxStatus" AS ENUM ('STORED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('STORED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('STORE', 'WITHDRAW');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boxes" (
    "id" TEXT NOT NULL,
    "box_label" TEXT NOT NULL,
    "type" "PlasmaType" NOT NULL DEFAULT 'FFP',
    "blood" "BloodGroup" NOT NULL,
    "location" "StorageLocation" NOT NULL,
    "shelf" TEXT NOT NULL,
    "collection_date" DATE NOT NULL,
    "status" "BoxStatus" NOT NULL DEFAULT 'STORED',
    "stored_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawn_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "unit_number" TEXT NOT NULL,
    "box_id" TEXT NOT NULL,
    "status" "UnitStatus" NOT NULL DEFAULT 'STORED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_entries" (
    "id" TEXT NOT NULL,
    "action" "LogAction" NOT NULL,
    "box_id" TEXT,
    "detail" TEXT NOT NULL,
    "unit_count" INTEGER NOT NULL DEFAULT 0,
    "user_id" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_plasma_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "master_plasma_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_blood_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "master_blood_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legacy_key" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "master_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_shelves" (
    "id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "master_shelves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "box_counters" (
    "plasma_type_id" TEXT NOT NULL,
    "blood_type_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "last_no" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "box_counters_pkey" PRIMARY KEY ("plasma_type_id","blood_type_id","year")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "boxes_box_label_key" ON "boxes"("box_label");

-- CreateIndex
CREATE INDEX "boxes_blood_status_idx" ON "boxes"("blood", "status");

-- CreateIndex
CREATE INDEX "boxes_location_shelf_idx" ON "boxes"("location", "shelf");

-- CreateIndex
CREATE UNIQUE INDEX "units_unit_number_key" ON "units"("unit_number");

-- CreateIndex
CREATE INDEX "units_unit_number_idx" ON "units"("unit_number");

-- CreateIndex
CREATE INDEX "log_entries_timestamp_idx" ON "log_entries"("timestamp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "master_plasma_types_code_key" ON "master_plasma_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "master_blood_types_code_key" ON "master_blood_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "master_zones_name_key" ON "master_zones"("name");

-- CreateIndex
CREATE UNIQUE INDEX "master_zones_legacy_key_key" ON "master_zones"("legacy_key");

-- CreateIndex
CREATE UNIQUE INDEX "master_shelves_zone_id_code_key" ON "master_shelves"("zone_id", "code");

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_box_id_fkey" FOREIGN KEY ("box_id") REFERENCES "boxes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_entries" ADD CONSTRAINT "log_entries_box_id_fkey" FOREIGN KEY ("box_id") REFERENCES "boxes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_entries" ADD CONSTRAINT "log_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_shelves" ADD CONSTRAINT "master_shelves_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "master_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

