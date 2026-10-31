// src/routes/boxes.ts

import { Router } from "express";
import { prisma } from "../lib/prisma";
import { boxDto, zoneSelect } from "../lib/boxDto";
import {
  BOX_CAPACITY,
  HttpError,
  assertNotLockedByOther,
  assertSlotFree,
  isRackZone,
  parseSlot,
  positionLabel,
  releaseOwnLock,
} from "../lib/rack";

const router = Router();

const sendHttpError = (res: any, error: unknown, tag: string) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message, ...error.extra });
    return;
  }
  if ((error as any)?.code === "P2002") {
    res.status(409).json({ message: "ช่องนี้มีกล่องอยู่แล้ว หรือข้อมูลซ้ำ" });
    return;
  }
  console.error(tag, error);
  res.status(500).json({ message: "เกิดข้อผิดพลาด" });
};

// ปี ค.ศ. ตามเวลาไทย
const bkkYear = () =>
  Number(
    new Date()
      .toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })
      .slice(0, 4),
  );

const formatLabel = (type: string, blood: string, year: number, no: number) =>
  `${type}_${blood}_${year}_${String(no).padStart(5, "0")}`;

// ===== GET /api/v1/boxes =====
router.get("/", async (req, res) => {
  try {
    const { blood, location, status, page, pageSize } = req.query;

    const where: Record<string, unknown> = {};
    if (blood) where.blood = (blood as string).toUpperCase();
    if (location)
      where.zone = { legacyKey: (location as string).toUpperCase() };
    if (status) where.status = (status as string).toUpperCase();

    const onlyStored = String(status ?? "").toUpperCase() === "STORED";

    const mapBox = (b: any) => ({
      ...boxDto(b),
      units: b.units
        .filter((u: any) => !onlyStored || u.status === "STORED")
        .map((u: any) => u.unitNumber),
    });

    const include = {
      zone: zoneSelect,
      units: {
        select: { unitNumber: true, status: true },
        orderBy: [{ seq: "asc" as const }, { createdAt: "asc" as const }],
      },
    };

    // ถ้าส่ง page → paginated response, ถ้าไม่ส่ง → array เดิม (backward compat)
    if (page) {
      const pageNum = Math.max(1, Number(page));
      const size = Math.min(100, Math.max(1, Number(pageSize || 20)));

      const [boxes, total] = await Promise.all([
        prisma.box.findMany({
          where,
          include,
          orderBy: { storedAt: "desc" },
          take: size,
          skip: (pageNum - 1) * size,
        }),
        prisma.box.count({ where }),
      ]);

      res.json({
        data: boxes.map(mapBox),
        total,
        page: pageNum,
        pageSize: size,
        totalPages: Math.ceil(total / size),
      });
    } else {
      const boxes = await prisma.box.findMany({
        where,
        include,
        orderBy: { storedAt: "desc" },
      });
      res.json(boxes.map(mapBox));
    }
  } catch (error) {
    console.error("GET /boxes error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ===== GET /api/v1/boxes/next-label?type=&blood= =====
// ต้องอยู่ก่อน /:id
router.get("/next-label", async (req, res) => {
  try {
    const type = String(req.query.type ?? "").trim();
    const blood = String(req.query.blood ?? "").trim();

    const [pt, bt] = await Promise.all([
      prisma.masterPlasmaType.findUnique({ where: { code: type } }),
      prisma.masterBloodType.findUnique({ where: { code: blood } }),
    ]);
    if (!pt || !bt) {
      res.status(400).json({ message: "ไม่พบชนิดหรือหมู่เลือด" });
      return;
    }

    const year = bkkYear();

    // หาเลขสูงสุดจาก box จริง (รวม WITHDRAWN) — ถ้าลบกล่องท้ายๆ ออก เลขจะรันต่อจากกล่องที่เหลือ
    const maxBox = await prisma.box.findFirst({
      where: { type: pt.code, blood: bt.code, year },
      orderBy: { boxLabel: "desc" },
      select: { boxLabel: true },
    });
    const maxExisting = maxBox
      ? parseInt(maxBox.boxLabel.replace(/.*[_\-]/, ""), 10) || 0
      : 0;

    const nextNo = maxExisting + 1;

    res.json({
      label: formatLabel(pt.code, bt.code, year, nextNo),
      year,
    });
  } catch (error) {
    console.error("GET /boxes/next-label error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ===== GET /api/v1/boxes/search?q= =====
// ค้นหากล่องหรือ unit ที่ยังจัดเก็บอยู่ ทุกสถานที่ (≥ 2 ตัวอักษร, ≤ 20 รายการ) — ต้องอยู่ก่อน /:id
router.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    if (q.length < 2) {
      res.json([]);
      return;
    }

    const [byBox, byUnit] = await Promise.all([
      prisma.box.findMany({
        where: { status: "STORED", boxLabel: { contains: q, mode: "insensitive" } },
        include: { zone: zoneSelect },
        orderBy: { boxLabel: "asc" },
        take: 20,
      }),
      prisma.unit.findMany({
        where: {
          status: "STORED",
          unitNumber: { contains: q, mode: "insensitive" },
          box: { status: "STORED" },
        },
        include: { box: { include: { zone: zoneSelect } } },
        orderBy: { unitNumber: "asc" },
        take: 20,
      }),
    ]);

    const out: any[] = [];
    const seen = new Set<string>();
    for (const b of byBox) {
      seen.add(b.id);
      out.push({ box: boxDto(b), matchedUnit: null });
    }
    for (const u of byUnit) {
      const key = `${u.boxId}:${u.unitNumber}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ box: boxDto(u.box), matchedUnit: u.unitNumber });
    }

    res.json(
      out.slice(0, 20).map((r) => ({
        ...r,
        zoneName: r.box.zoneName,
        shelf: r.box.shelf,
        level: r.box.level,
        position: r.box.position,
      })),
    );
  } catch (error) {
    console.error("GET /boxes/search error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ===== GET /api/v1/boxes/:id =====
router.get("/:id", async (req, res) => {
  try {
    const box = await prisma.box.findUnique({
      where: { id: req.params.id },
      include: {
        zone: zoneSelect,
        units: {
          select: { id: true, unitNumber: true, status: true },
          orderBy: [{ seq: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!box) {
      res.status(404).json({ message: "ไม่พบกล่อง" });
      return;
    }

    res.json({
      ...boxDto(box),
      units: box.units.map((u) => ({
        id: u.id,
        unitNumber: u.unitNumber,
        status: u.status.toLowerCase(),
      })),
      unitCount: box.units.length,
      storedCount: box.units.filter((u) => u.status === "STORED").length,
    });
  } catch (error) {
    console.error("GET /boxes/:id error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ===== POST /api/v1/boxes =====
// backend ออกเลขกล่องเอง ไม่รับ boxLabel จาก client
router.post("/", async (req, res) => {
  try {
    const { boxName, type, blood, zoneId, shelf, collectionDate, units } =
      req.body;
    const unitList: string[] = Array.from(
      new Set(
        (Array.isArray(units) ? units : [])
          .map((u: unknown) => String(u).trim().toUpperCase())
          .filter(Boolean),
      ),
    );
    const slot = parseSlot(req.body.level, req.body.position);

    if (!type || !blood || !zoneId || !shelf || !collectionDate) {
      res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
      return;
    }
    if (unitList.length === 0) {
      res.status(400).json({ message: "กรุณาเพิ่ม Unit อย่างน้อย 1 รายการ" });
      return;
    }
    if (unitList.length > BOX_CAPACITY) {
      res
        .status(400)
        .json({ message: `กล่องรับได้สูงสุด ${BOX_CAPACITY} ถุง` });
      return;
    }

    // ตรวจ unit ซ้ำ (รวม unit ที่นำออกแล้ว)
    const existing = await prisma.unit.findMany({
      where: {
        OR: unitList.map((u) => ({
          unitNumber: { equals: u, mode: "insensitive" as const },
        })),
      },
      select: { unitNumber: true },
    });
    if (existing.length > 0) {
      const dupes = existing.map((u) => u.unitNumber);
      res
        .status(409)
        .json({ message: `Unit ซ้ำ: ${dupes.join(", ")}`, duplicates: dupes });
      return;
    }

    const box = await prisma.$transaction(async (tx) => {
      const [pt, bt, zone] = await Promise.all([
        tx.masterPlasmaType.findFirst({
          where: { code: String(type), active: true },
        }),
        tx.masterBloodType.findFirst({
          where: { code: String(blood), active: true },
        }),
        tx.masterZone.findFirst({
          where: { id: String(zoneId), active: true },
        }),
      ]);
      if (!pt) throw new HttpError(400, "ไม่พบชนิดพลาสมา หรือถูกปิดใช้งาน");
      if (!bt) throw new HttpError(400, "ไม่พบหมู่เลือด หรือถูกปิดใช้งาน");
      if (!zone)
        throw new HttpError(400, "ไม่พบสถานที่จัดเก็บ หรือถูกปิดใช้งาน");

      const shelfCode = String(shelf).trim().toUpperCase();
      const shelfRow = await tx.masterShelf.findUnique({
        where: { zoneId_code: { zoneId: zone.id, code: shelfCode } },
      });
      if (!shelfRow || !shelfRow.active) {
        throw new HttpError(
          400,
          `ไม่พบชั้น "${shelfCode}" ในสถานที่นี้ หรือถูกปิดใช้งาน`,
        );
      }

      // ห้อง -30°C ต้องระบุชั้น + ช่อง และช่องต้องว่าง/ไม่ถูกล็อกโดยคนอื่น
      const rackSlot = isRackZone(zone) ? slot : null;
      if (isRackZone(zone)) {
        if (!rackSlot) throw new HttpError(400, "กรุณาเลือกชั้นและช่องใน rack");
        const slotWhere = { zoneId: zone.id, shelf: shelfCode, ...rackSlot };
        await assertNotLockedByOther(tx, slotWhere, req.user?.id);
        await assertSlotFree(tx, slotWhere);
      }
      const whereLabel = rackSlot
        ? positionLabel({ shelf: shelfCode, ...rackSlot })
        : null;

      // เพิ่มเลขแบบ atomic ภายใน transaction
      const year = bkkYear();

      // หาเลขกล่องสูงสุดที่มีอยู่จริงใน DB (รวม WITHDRAWN)
      const maxBox = await tx.box.findFirst({
        where: { type: pt.code, blood: bt.code, year },
        orderBy: { boxLabel: "desc" },
        select: { boxLabel: true },
      });
      const maxExisting = maxBox
        ? parseInt(maxBox.boxLabel.replace(/.*[_\-]/, ""), 10) || 0
        : 0;

      // รันเลขต่อจากกล่องที่มีอยู่จริง (ไม่ใช้ counter เดิม เพื่อให้ลบกล่องท้ายๆ แล้วเลขย้อนกลับได้)
      // counter ยังอัปเดตไว้เป็นข้อมูลอ้างอิง; ถ้ามีคนสร้างพร้อมกัน boxLabel @unique จะกันเลขซ้ำ
      const newNo = maxExisting + 1;

      await tx.boxCounter.upsert({
        where: {
          plasmaTypeId_bloodTypeId_year: {
            plasmaTypeId: pt.id,
            bloodTypeId: bt.id,
            year,
          },
        },
        create: {
          plasmaTypeId: pt.id,
          bloodTypeId: bt.id,
          year,
          lastNo: newNo,
        },
        update: { lastNo: newNo },
      });

      const boxLabel = formatLabel(pt.code, bt.code, year, newNo);

      return tx.box.create({
        data: {
          boxLabel,
          boxName: boxName?.toString().trim() || null,
          type: pt.code,
          blood: bt.code,
          plasmaTypeId: pt.id,
          bloodTypeId: bt.id,
          year,
          zoneId: zone.id,
          shelf: shelfCode,
          level: rackSlot?.level ?? null,
          position: rackSlot?.position ?? null,
          collectionDate: new Date(collectionDate),
          status: "STORED",
          units: {
            create: unitList.map((u, i) => ({ unitNumber: u, seq: i + 1 })),
          },
          logs: {
            create: {
              action: "STORE",
              detail:
                `จัดเก็บกล่อง ${boxLabel} จำนวน ${unitList.length} units` +
                (whereLabel ? ` ที่ ${whereLabel}` : ""),
              unitCount: unitList.length,
              userId: req.user?.id,
            },
          },
        },
        include: {
          zone: zoneSelect,
          units: { select: { unitNumber: true }, orderBy: { seq: "asc" } },
        },
      }).then(async (created) => {
        if (rackSlot) {
          await releaseOwnLock(
            tx,
            { zoneId: zone.id, shelf: shelfCode, ...rackSlot },
            req.user?.id,
          );
        }
        return created;
      });
    });

    res
      .status(201)
      .json({ ...boxDto(box), units: box.units.map((u) => u.unitNumber) });
  } catch (error: any) {
    if (error?.code === "P2002" && !(error instanceof HttpError)) {
      res
        .status(409)
        .json({ message: "ข้อมูลซ้ำ (หมายเลขกล่อง, Unit หรือช่องนี้มีกล่องแล้ว)" });
      return;
    }
    sendHttpError(res, error, "POST /boxes error:");
  }
});

// ===== PATCH /api/v1/boxes/:id/withdraw =====
router.patch("/:id/withdraw", async (req, res) => {
  try {
    const box = await prisma.box.findUnique({
      where: { id: req.params.id },
      include: { units: true },
    });

    if (!box) {
      res.status(404).json({ message: "ไม่พบกล่อง" });
      return;
    }
    if (box.status === "WITHDRAWN") {
      res.status(400).json({ message: "กล่องนี้ถูกนำออกแล้ว" });
      return;
    }

    const now = new Date();
    const storedCount = box.units.filter((u) => u.status === "STORED").length;

    await prisma.$transaction([
      prisma.box.update({
        where: { id: box.id },
        data: { status: "WITHDRAWN", withdrawnAt: now },
      }),
      prisma.unit.updateMany({
        where: { boxId: box.id, status: "STORED" },
        data: { status: "WITHDRAWN", withdrawnAt: now },
      }),
      prisma.logEntry.create({
        data: {
          action: "WITHDRAW",
          boxId: box.id,
          detail: `นำออกกล่อง ${box.boxLabel} จำนวน ${storedCount} units`,
          unitCount: storedCount,
          userId: req.user?.id,
        },
      }),
    ]);

    res.json({ message: `นำออกกล่อง ${box.boxLabel} สำเร็จ` });
  } catch (error) {
    console.error("PATCH /boxes/:id/withdraw error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ===== POST /api/v1/boxes/:id/withdraw =====
// นำออกบางถุง (หรือทั้งกล่อง) — body { units: string[] }
// ถ้าไม่เหลือถุงที่จัดเก็บ → ปิดกล่อง (level/position คงไว้เป็นประวัติ ช่องว่างเพราะ partial index)
router.post("/:id/withdraw", async (req, res) => {
  try {
    const picked: string[] = Array.from(
      new Set(
        (Array.isArray(req.body?.units) ? req.body.units : [])
          .map((u: unknown) => String(u).trim())
          .filter(Boolean),
      ),
    );
    if (picked.length === 0) {
      res.status(400).json({ message: "กรุณาเลือก unit ที่จะนำออก" });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const box = await tx.box.findUnique({
        where: { id: req.params.id },
        include: { units: { where: { status: "STORED" } } },
      });
      if (!box) throw new HttpError(404, "ไม่พบกล่อง");
      if (box.status === "WITHDRAWN") throw new HttpError(400, "กล่องนี้ถูกนำออกแล้ว");

      if (box.level != null && box.position != null) {
        await assertNotLockedByOther(
          tx,
          { zoneId: box.zoneId, shelf: box.shelf, level: box.level, position: box.position },
          req.user?.id,
        );
      }

      const stored = box.units.map((u) => u.unitNumber);
      const invalid = picked.filter((u) => !stored.includes(u));
      if (invalid.length > 0) {
        throw new HttpError(400, `Unit ${invalid.join(", ")} ไม่ได้อยู่ในกล่องนี้`);
      }

      const now = new Date();
      const all = picked.length === stored.length;

      await tx.unit.updateMany({
        where: { boxId: box.id, unitNumber: { in: picked }, status: "STORED" },
        data: { status: "WITHDRAWN", withdrawnAt: now },
      });
      if (all) {
        await tx.box.update({
          where: { id: box.id },
          data: { status: "WITHDRAWN", withdrawnAt: now },
        });
      }
      await tx.logEntry.create({
        data: {
          action: "WITHDRAW",
          boxId: box.id,
          detail:
            (all
              ? `นำออกทั้งกล่อง ${box.boxLabel} จำนวน ${picked.length} units`
              : `นำออก Unit ${picked.join(", ")}`) + ` จาก ${positionLabel(box)}`,
          unitCount: picked.length,
          userId: req.user?.id,
        },
      });
      if (box.level != null && box.position != null) {
        await releaseOwnLock(
          tx,
          { zoneId: box.zoneId, shelf: box.shelf, level: box.level, position: box.position },
          req.user?.id,
        );
      }
      return { allWithdrawn: all, count: picked.length, boxLabel: box.boxLabel };
    });

    res.json({ success: true, ...result });
  } catch (error) {
    sendHttpError(res, error, "POST /boxes/:id/withdraw error:");
  }
});

// ===== PUT /api/v1/boxes/:id/units =====
// แก้ไขรายการ units ในกล่อง (เพิ่ม/ลบ)
router.put("/:id/units", async (req, res) => {
  try {
    const { units, removals } = req.body;
    // หมายเหตุการลบ: [{ unitNumber, reasonId, detail? }] — reasonId ต้องเป็นตัวเลือกที่เปิดใช้งานในเมนูตั้งค่า
    const removalNotes = new Map<string, string>();
    if (Array.isArray(removals) && removals.length > 0) {
      const reasonIds = removals
        .map((r: any) => String(r?.reasonId ?? "").trim())
        .filter(Boolean);
      const reasons = await prisma.masterRemovalReason.findMany({
        where: { id: { in: reasonIds }, active: true },
        select: { id: true, name: true },
      });
      const reasonName = new Map(reasons.map((r) => [r.id, r.name]));

      for (const r of removals) {
        const num = String(r?.unitNumber ?? "").trim();
        const name = reasonName.get(String(r?.reasonId ?? "").trim());
        const detail = String(r?.detail ?? "").trim().slice(0, 300);
        if (num && name) {
          removalNotes.set(num, detail ? `${name} — ${detail}` : name);
        }
      }
    }
    const unitList: string[] = Array.from(
      new Set(
        (Array.isArray(units) ? units : [])
          .map((u: unknown) => String(u).trim())
          .filter(Boolean),
      ),
    );

    if (unitList.length === 0) {
      res.status(400).json({ message: "กรุณาเพิ่ม Unit อย่างน้อย 1 รายการ" });
      return;
    }
    if (unitList.length > BOX_CAPACITY) {
      res
        .status(400)
        .json({ message: `กล่องรับได้สูงสุด ${BOX_CAPACITY} ถุง` });
      return;
    }

    const box = await prisma.box.findUnique({
      where: { id: req.params.id },
      include: {
        units: { select: { id: true, unitNumber: true, status: true } },
      },
    });

    if (!box) {
      res.status(404).json({ message: "ไม่พบกล่อง" });
      return;
    }
    if (box.status === "WITHDRAWN") {
      res
        .status(400)
        .json({ message: "กล่องนี้ถูกนำออกแล้ว ไม่สามารถแก้ไขได้" });
      return;
    }

    // แก้ไขได้เฉพาะ unit ที่ยังจัดเก็บอยู่ — unit ที่นำออกแล้วต้องคงไว้ (ห้ามลบ/ห้ามเพิ่มซ้ำ)
    const storedUnits = box.units.filter((u) => u.status === "STORED");
    const storedNumbers = storedUnits.map((u) => u.unitNumber);
    const toAdd = unitList.filter((u) => !storedNumbers.includes(u));
    const toRemove = storedUnits.filter((u) => !unitList.includes(u.unitNumber));

    // ลบ unit ต้องระบุหมายเหตุทุกครั้ง
    const missingNote = toRemove
      .filter((u) => !removalNotes.has(u.unitNumber))
      .map((u) => u.unitNumber);
    if (missingNote.length > 0) {
      res.status(400).json({
        message: `กรุณาเลือกหมายเหตุการลบ unit: ${missingNote.join(", ")}`,
        missingNote,
      });
      return;
    }

    // ตรวจ unit ซ้ำ (ทั้งกล่องอื่น และ unit ที่นำออกแล้วในกล่องนี้)
    if (toAdd.length > 0) {
      const existing = await prisma.unit.findMany({
        where: {
          OR: toAdd.map((u) => ({
            unitNumber: { equals: u, mode: "insensitive" as const },
          })),
        },
        select: { unitNumber: true, status: true },
      });
      if (existing.length > 0) {
        const dupes = existing.map((u) =>
          u.status === "WITHDRAWN" ? `${u.unitNumber} (นำออกแล้ว)` : u.unitNumber,
        );
        res.status(409).json({
          message: `Unit ซ้ำ: ${dupes.join(", ")}`,
          duplicates: existing.map((u) => u.unitNumber),
        });
        return;
      }
    }

    await prisma.$transaction(async (tx) => {
      if (box.level != null && box.position != null) {
        await assertNotLockedByOther(
          tx,
          { zoneId: box.zoneId, shelf: box.shelf, level: box.level, position: box.position },
          req.user?.id,
        );
      }

      // ลบ units ที่ไม่อยู่ในรายการใหม่
      if (toRemove.length > 0) {
        // บันทึกข้อมูลการลบ (เลข unit, กล่อง, หมายเหตุ, ผู้ลบ, เวลา)
        await tx.unitRemoval.createMany({
          data: toRemove.map((u) => ({
            unitNumber: u.unitNumber,
            boxId: box.id,
            boxLabel: box.boxLabel,
            note: removalNotes.get(u.unitNumber)!,
            userId: req.user?.id,
          })),
        });
        await tx.unit.deleteMany({
          where: { id: { in: toRemove.map((u) => u.id) } },
        });
      }

      // เพิ่ม units ใหม่
      if (toAdd.length > 0) {
        await tx.unit.createMany({
          data: toAdd.map((u) => ({
            unitNumber: u,
            boxId: box.id,
            seq: unitList.indexOf(u) + 1,
          })),
        });
      }

      // เรียงลำดับถุงตาม array ที่ส่งมา (1 = หน้า … 10 = หลัง)
      const reordered = storedUnits.filter((u) => unitList.includes(u.unitNumber));
      for (const u of reordered) {
        await tx.unit.update({
          where: { id: u.id },
          data: { seq: unitList.indexOf(u.unitNumber) + 1 },
        });
      }

      // log — "แก้ไขข้อมูล · เพิ่ม A0240 · ลบ A0233 (สแกนผิดกล่อง)"
      const details: string[] = [];
      if (toAdd.length > 0) details.push(`เพิ่ม ${toAdd.join(", ")}`);
      if (toRemove.length > 0)
        details.push(
          `ลบ ${toRemove
            .map((u) => `${u.unitNumber} (${removalNotes.get(u.unitNumber)})`)
            .join(", ")}`,
        );

      if (details.length > 0) {
        await tx.logEntry.create({
          data: {
            action: "EDIT",
            boxId: box.id,
            detail: `แก้ไขข้อมูล ${box.boxLabel} · ${details.join(" · ")}`,
            unitCount: unitList.length,
            userId: req.user?.id,
          },
        });
      }

      if (box.level != null && box.position != null) {
        await releaseOwnLock(
          tx,
          { zoneId: box.zoneId, shelf: box.shelf, level: box.level, position: box.position },
          req.user?.id,
        );
      }
    });

    const updated = await prisma.box.findUnique({
      where: { id: box.id },
      include: {
        zone: zoneSelect,
        units: {
          where: { status: "STORED" },
          select: { unitNumber: true },
          orderBy: [{ seq: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    res.json({
      ...boxDto(updated!),
      units: updated!.units.map((u) => u.unitNumber),
    });
  } catch (error) {
    sendHttpError(res, error, "PUT /boxes/:id/units error:");
  }
});

// ===== GET /api/v1/boxes/:id/removals =====
// ประวัติการลบ unit ของกล่องนี้ (พร้อมหมายเหตุ)
router.get("/:id/removals", async (req, res) => {
  try {
    const rows = await prisma.unitRemoval.findMany({
      where: { boxId: req.params.id },
      include: { user: { select: { name: true } } },
      orderBy: { removedAt: "desc" },
    });
    res.json(
      rows.map((r) => ({
        id: r.id,
        unitNumber: r.unitNumber,
        boxLabel: r.boxLabel,
        note: r.note,
        userName: r.user?.name ?? null,
        removedAt: r.removedAt.toISOString(),
      })),
    );
  } catch (error) {
    console.error("GET /boxes/:id/removals error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ===== PATCH /api/v1/boxes/:id/location =====
// แก้ไขตำแหน่งจัดเก็บ (สถานที่ + ชั้นวาง [+ ชั้น/ช่อง สำหรับห้อง -30°C])
router.patch("/:id/location", async (req, res) => {
  try {
    const { zoneId } = req.body;
    const shelf = String(req.body.shelf ?? "").trim().toUpperCase();

    if (!zoneId || !shelf) {
      res.status(400).json({ message: "กรุณาระบุสถานที่และชั้นวาง" });
      return;
    }
    const slot = parseSlot(req.body.level, req.body.position);

    const updated = await prisma.$transaction(async (tx) => {
      const box = await tx.box.findUnique({ where: { id: req.params.id } });
      if (!box) throw new HttpError(404, "ไม่พบกล่อง");
      if (box.status === "WITHDRAWN") {
        throw new HttpError(400, "กล่องนี้ถูกนำออกแล้ว ไม่สามารถแก้ไขตำแหน่งได้");
      }

      // ตรวจว่า zone + shelf มีอยู่จริง
      const zone = await tx.masterZone.findUnique({
        where: { id: zoneId },
        include: { shelves: { where: { code: shelf, active: true } } },
      });
      if (!zone) throw new HttpError(400, "ไม่พบสถานที่ที่ระบุ");
      if (zone.shelves.length === 0) {
        throw new HttpError(400, `ไม่พบชั้น "${shelf}" ในสถานที่ "${zone.name}"`);
      }

      const rack = isRackZone(zone);
      if (rack && !slot) throw new HttpError(400, "กรุณาเลือกชั้นและช่องปลายทาง");
      const target = rack && slot ? slot : null;

      // ต้นทางถูกคนอื่นล็อกอยู่ → ห้ามย้าย
      if (box.level != null && box.position != null) {
        await assertNotLockedByOther(
          tx,
          { zoneId: box.zoneId, shelf: box.shelf, level: box.level, position: box.position },
          req.user?.id,
        );
      }
      // ปลายทางต้องว่าง + ไม่ถูกล็อก
      if (target) {
        const where = { zoneId: zone.id, shelf, ...target };
        await assertNotLockedByOther(tx, where, req.user?.id);
        await assertSlotFree(tx, where, box.id);
      }

      const from = `${positionLabel(box)}`;
      const to = positionLabel({ shelf, level: target?.level, position: target?.position });

      const result = await tx.box.update({
        where: { id: box.id },
        data: {
          zoneId,
          shelf,
          level: target?.level ?? null,
          position: target?.position ?? null,
        },
        include: {
          zone: zoneSelect,
          units: {
            where: { status: "STORED" },
            select: { unitNumber: true },
            orderBy: [{ seq: "asc" }, { createdAt: "asc" }],
          },
        },
      });

      await tx.logEntry.create({
        data: {
          action: "EDIT",
          boxId: box.id,
          detail:
            zone.id === box.zoneId
              ? `ย้ายตำแหน่ง ${box.boxLabel} ${from} → ${to}`
              : `ย้ายตำแหน่ง ${box.boxLabel} ${from} → ${zone.name} ${to}`,
          unitCount: 0,
          userId: req.user?.id,
        },
      });

      if (box.level != null && box.position != null) {
        await releaseOwnLock(
          tx,
          { zoneId: box.zoneId, shelf: box.shelf, level: box.level, position: box.position },
          req.user?.id,
        );
      }
      if (target) {
        await releaseOwnLock(tx, { zoneId: zone.id, shelf, ...target }, req.user?.id);
      }

      return result;
    });

    res.json({
      ...boxDto(updated),
      units: updated.units.map((u) => u.unitNumber),
    });
  } catch (error) {
    sendHttpError(res, error, "PATCH /boxes/:id/location error:");
  }
});

export default router;
