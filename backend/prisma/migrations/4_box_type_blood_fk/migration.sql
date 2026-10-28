ALTER TABLE "boxes"
  ADD COLUMN "plasma_type_id" TEXT,
  ADD COLUMN "blood_type_id" TEXT;

UPDATE "boxes" b SET "plasma_type_id" = pt."id"
  FROM "master_plasma_types" pt WHERE pt."code" = b."type";

UPDATE "boxes" b SET "blood_type_id" = bt."id"
  FROM "master_blood_types" bt WHERE bt."code" = b."blood";

ALTER TABLE "boxes"
  ALTER COLUMN "plasma_type_id" SET NOT NULL,
  ALTER COLUMN "blood_type_id" SET NOT NULL;

ALTER TABLE "boxes" ADD CONSTRAINT "boxes_plasma_type_id_fkey"
  FOREIGN KEY ("plasma_type_id") REFERENCES "master_plasma_types"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "boxes" ADD CONSTRAINT "boxes_blood_type_id_fkey"
  FOREIGN KEY ("blood_type_id") REFERENCES "master_blood_types"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "boxes_blood_type_id_status_idx" ON "boxes"("blood_type_id", "status");