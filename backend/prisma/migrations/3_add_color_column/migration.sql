ALTER TABLE "master_plasma_types" ADD COLUMN "color" TEXT;
ALTER TABLE "master_blood_types" ADD COLUMN "color" TEXT;

UPDATE "master_blood_types" SET "color" = '#EAB308' WHERE "code" = 'A';
UPDATE "master_blood_types" SET "color" = '#EC4899' WHERE "code" = 'B';
UPDATE "master_blood_types" SET "color" = '#0EA5E9' WHERE "code" = 'O';
UPDATE "master_blood_types" SET "color" = '#8B5CF6' WHERE "code" = 'AB';

UPDATE "master_plasma_types" SET "color" = '#2563EB' WHERE "code" = 'FFP';
UPDATE "master_plasma_types" SET "color" = '#F59E0B' WHERE "code" = 'Cryo';
