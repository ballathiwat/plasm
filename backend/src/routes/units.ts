// src/routes/units.ts

import { Router } from "express";
import { prisma } from "../lib/prisma";
import { locationKey } from "../lib/boxDto";

const router = Router();

// ===== GET /api/v1/units =====
router.get("/", async (_req, res) => {
  try {
    const units = await prisma.unit.findMany({
      include: {
        box: {
          select: {
            boxLabel: true,
            blood: true,
            zone: { select: { legacyKey: true, name: true } },
            shelf: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(units);
  } catch (error) {
    console.error("GET /units error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ===== GET /api/v1/units/search?q= =====
router.get("/search", async (req, res) => {
  try {
    const q = ((req.query.q as string) || "").trim();
    if (!q) {
      res.json([]);
      return;
    }

    const units = await prisma.unit.findMany({
      where: {
        OR: [
          { unitNumber: { contains: q, mode: "insensitive" } },
          { box: { boxLabel: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: {
        box: {
          select: {
            id: true,
            boxLabel: true,
            blood: true,
            type: true,
            zone: { select: { legacyKey: true, name: true } },
            shelf: true,
            status: true,
            collectionDate: true,
            boxName: true,
            withdrawnAt: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { unitNumber: "asc" }],
      take: 50,
    });

    const result = units.map((u) => ({
      id: u.id,
      unitNumber: u.unitNumber,
      status: u.status.toLowerCase(),
      withdrawnAt: u.withdrawnAt ? u.withdrawnAt.toISOString() : null,
      box: {
        id: u.box.id,
        blood: u.box.blood,
        type: u.box.type,
        location: locationKey(u.box.zone),
        zoneName: u.box.zone.name,
        shelf: u.box.shelf,
        status: u.box.status.toLowerCase(),
        collectionDate: u.box.collectionDate.toISOString().split("T")[0],
        boxLabel: u.box.boxLabel,
        boxName: u.box.boxName,
        withdrawnAt: u.box.withdrawnAt ? u.box.withdrawnAt.toISOString() : null,
      },
    }));

    res.json(result);
  } catch (error) {
    console.error("GET /units/search error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ===== GET /api/v1/units/check?unit= =====
// ตรวจว่าเลข unit นี้มีในระบบแล้วหรือไม่ (รวม unit ที่นำออกแล้ว)
router.get("/check", async (req, res) => {
  try {
    const unit = ((req.query.unit as string) || "").trim();
    if (!unit) {
      res.json({ exists: false });
      return;
    }

    const found = await prisma.unit.findFirst({
      where: { unitNumber: { equals: unit, mode: "insensitive" } },
      select: {
        unitNumber: true,
        status: true,
        box: { select: { id: true, boxLabel: true } },
      },
    });

    if (!found) {
      res.json({ exists: false });
      return;
    }

    res.json({
      exists: true,
      unitNumber: found.unitNumber,
      status: found.status.toLowerCase(),
      boxId: found.box.id,
      boxLabel: found.box.boxLabel,
    });
  } catch (error) {
    console.error("GET /units/check error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ===== PATCH /api/v1/units/:id/withdraw =====
router.patch("/:id/withdraw", async (req, res) => {
  try {
    const unit = await prisma.unit.findUnique({
      where: { id: req.params.id },
      include: { box: true },
    });

    if (!unit) {
      res.status(404).json({ message: "ไม่พบ unit" });
      return;
    }

    if (unit.status === "WITHDRAWN") {
      res.status(400).json({ message: "Unit นี้ถูกนำออกแล้ว" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.unit.update({
        where: { id: unit.id },
        data: { status: "WITHDRAWN", withdrawnAt: new Date() },
      });

      await tx.logEntry.create({
        data: {
          action: "WITHDRAW",
          boxId: unit.boxId,
          detail: `นำออก unit ${unit.unitNumber} จากกล่อง ${unit.box.boxLabel}`,
          unitCount: 1,
          userId: req.user?.id,
        },
      });

      // ถ้าไม่เหลือ unit ที่เก็บอยู่ → ปิดกล่อง
      const remaining = await tx.unit.count({
        where: { boxId: unit.boxId, status: "STORED" },
      });
      if (remaining === 0) {
        await tx.box.update({
          where: { id: unit.boxId },
          data: { status: "WITHDRAWN", withdrawnAt: new Date() },
        });
      }
    });

    res.json({ message: `นำออก unit ${unit.unitNumber} สำเร็จ` });
  } catch (error) {
    console.error("PATCH /units/:id/withdraw error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

export default router;
