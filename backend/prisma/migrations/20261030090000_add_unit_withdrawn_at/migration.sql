-- AlterTable
ALTER TABLE "units" ADD COLUMN "withdrawn_at" TIMESTAMP(3);

-- Backfill 1: unit ที่นำออกทีละ unit → ใช้เวลาจาก log "นำออก unit <เลข> จากกล่อง ..."
UPDATE "units" u
SET "withdrawn_at" = l.ts
FROM (
  SELECT u2."id" AS unit_id, MIN(le."created_at") AS ts
  FROM "units" u2
  JOIN "log_entries" le
    ON le."box_id" = u2."box_id"
   AND le."action" = 'WITHDRAW'
   AND le."detail" LIKE 'นำออก unit ' || u2."unit_number" || ' จากกล่อง%'
  WHERE u2."status" = 'WITHDRAWN'
  GROUP BY u2."id"
) l
WHERE u."id" = l.unit_id AND u."withdrawn_at" IS NULL;

-- Backfill 2: ที่เหลือ (นำออกทั้งกล่อง) → ใช้ withdrawn_at ของกล่อง
UPDATE "units" u
SET "withdrawn_at" = b."withdrawn_at"
FROM "boxes" b
WHERE u."box_id" = b."id"
  AND u."status" = 'WITHDRAWN'
  AND u."withdrawn_at" IS NULL
  AND b."withdrawn_at" IS NOT NULL;
