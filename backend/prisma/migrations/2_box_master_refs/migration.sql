ALTER TABLE "boxes"
  ADD COLUMN "box_name" TEXT,
  ADD COLUMN "year" INTEGER,
  ADD COLUMN "zone_id" TEXT;

ALTER TABLE "boxes" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "boxes" ALTER COLUMN "type" TYPE TEXT USING "type"::text;
ALTER TABLE "boxes" ALTER COLUMN "blood" TYPE TEXT USING "blood"::text;

UPDATE "boxes" b SET "zone_id" = z."id"
  FROM "master_zones" z WHERE z."legacy_key" = b."location"::text;
UPDATE "boxes" SET "year" = EXTRACT(YEAR FROM "stored_at")::int;

ALTER TABLE "boxes"
  ALTER COLUMN "zone_id" SET NOT NULL,
  ALTER COLUMN "year" SET NOT NULL;

DROP INDEX "boxes_location_shelf_idx";
ALTER TABLE "boxes" DROP COLUMN "location";

CREATE INDEX "boxes_zone_id_shelf_idx" ON "boxes"("zone_id", "shelf");
ALTER TABLE "boxes" ADD CONSTRAINT "boxes_zone_id_fkey"
  FOREIGN KEY ("zone_id") REFERENCES "master_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
