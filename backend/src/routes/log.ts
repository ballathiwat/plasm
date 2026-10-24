// src/routes/log.ts

import { Router } from "express";
import { prisma } from "../lib/prisma";
import { locationKey } from "../lib/boxDto";

const router = Router();

// ===== GET /api/v1/log =====
router.get("/", async (req, res) => {
  try {
    const {
      action,
      blood,
      dateFrom,
      dateTo,
      limit = "50",
      offset = "0",
    } = req.query;

    const where: Record<string, unknown> = {};
    if (action) where.action = (action as string).toUpperCase();
    if (blood) {
      where.box = { blood: (blood as string).toUpperCase() };
    }

    // กรองช่วงวันที่ (เวลาไทย)
    const ts: Record<string, Date> = {};
    if (dateFrom) ts.gte = new Date(`${dateFrom}T00:00:00+07:00`);
    if (dateTo) ts.lte = new Date(`${dateTo}T23:59:59.999+07:00`);
    if (Object.keys(ts).length) where.timestamp = ts;

    const entries = await prisma.logEntry.findMany({
      where,
      include: {
        box: {
          select: {
            boxLabel: true,
            type: true,
            blood: true,
            shelf: true,
            zone: { select: { legacyKey: true, name: true } },
          },
        },
        user: { select: { name: true } },
      },
      orderBy: { timestamp: "desc" },
      take: Number(limit),
      skip: Number(offset),
    });

    const result = entries.map((e) => ({
      id: e.id,
      action: e.action.toLowerCase(),
      boxLabel: e.box?.boxLabel || "-",
      type: e.box?.type || "FFP",
      blood: e.box?.blood || "-",
      units: [],
      unitCount: e.unitCount,
      location: e.box ? locationKey(e.box.zone) : undefined,
      zoneName: e.box?.zone?.name,
      shelf: e.box?.shelf,
      timestamp: e.timestamp.toISOString(),
      detail: e.detail,
      performedBy: e.user?.name,
    }));

    res.json(result);
  } catch (error) {
    console.error("GET /log error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

export default router;
