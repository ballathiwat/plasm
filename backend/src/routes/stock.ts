// src/routes/stock.ts

import { Router } from "express";
import { prisma } from "../lib/prisma";
import { adminOnly } from "../middleware/auth";
import { buildMinStockStatus, loadActiveMasters, cellKey } from "../lib/minStock";

const router = Router();

type CountRow = { blood: string; count: bigint };

const toRecord = (rows: CountRow[]) => {
  const r: Record<string, number> = {};
  for (const row of rows) r[row.blood] = Number(row.count);
  return r;
};

// ===== GET /api/v1/stock/summary =====
router.get("/summary", async (_req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [bloodTypes, nowRows, pastRows] = await Promise.all([
      prisma.masterBloodType.findMany({
        where: { active: true },
        orderBy: [{ sort: "asc" }, { code: "asc" }],
      }),
      prisma.$queryRaw<CountRow[]>`
        SELECT b.blood, COUNT(u.id) AS count
        FROM units u
        JOIN boxes b ON u.box_id = b.id
        WHERE u.status = 'STORED' AND b.status = 'STORED'
        GROUP BY b.blood
      `,
      prisma.$queryRaw<CountRow[]>`
        SELECT b.blood, COUNT(u.id) AS count
        FROM units u
        JOIN boxes b ON u.box_id = b.id
        WHERE u.status = 'STORED' AND b.status = 'STORED'
          AND u.created_at <= ${sevenDaysAgo}
        GROUP BY b.blood
      `,
    ]);

    const nowStocks = toRecord(nowRows);
    const pastStocks = toRecord(pastRows);

    // หมู่เลือดที่ active ตามลำดับใน master + หมู่ที่ปิดใช้งานแล้วแต่ยังมีสต็อก (กันตัวเลขหาย)
    const groups = bloodTypes.map((b) => b.code);
    for (const code of Object.keys(nowStocks).sort()) {
      if (!groups.includes(code)) groups.push(code);
    }

    const stocks: Record<string, number> = {};
    const change: Record<string, number> = {};
    for (const g of groups) {
      const curr = nowStocks[g] || 0;
      const prev = pastStocks[g] || 0;
      stocks[g] = curr;
      change[g] =
        prev > 0
          ? Math.round(((curr - prev) / prev) * 100)
          : curr > 0
            ? 100
            : 0;
    }

    // ขั้นต่ำย้ายไปเป็นราย ชนิด × หมู่ แล้ว → GET /stock/min-stock/status
    res.json({ groups, stocks, change });
  } catch (error) {
    console.error("GET /stock/summary error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ===== GET /api/v1/stock/daily?days=7 =====
// จำนวน unit ที่นำเข้า/นำออก แยกหมู่เลือด รายวัน (เวลาไทย)
router.get("/daily", async (req, res) => {
  try {
    const days = Math.min(Number(req.query.days) || 7, 30);
    const DAY_MS = 86400000;
    const bkk = (d: Date) =>
      d.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }); // YYYY-MM-DD

    const todayStart = new Date(`${bkk(new Date())}T00:00:00+07:00`);
    const startDate = new Date(todayStart.getTime() - (days - 1) * DAY_MS);

        const rows = await prisma.$queryRaw<
      { day: Date; action: string; blood: string; count: bigint }[]
    >`
      SELECT day, action, blood, COUNT(*) AS count FROM (
        SELECT
          DATE((u.created_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Bangkok') AS day,
          'STORE' AS action,
          b.blood::text AS blood
        FROM units u
        JOIN boxes b ON u.box_id = b.id
        WHERE u.created_at >= ${startDate}
        UNION ALL
        SELECT
          DATE((u.withdrawn_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Bangkok') AS day,
          'WITHDRAW' AS action,
          b.blood::text AS blood
        FROM units u
        JOIN boxes b ON u.box_id = b.id
        WHERE u.status = 'WITHDRAWN'
          AND u.withdrawn_at >= ${startDate}
      ) t
      GROUP BY day, action, blood
    `;

    const result = Array.from({ length: days }, (_, i) => {
      const d = new Date(startDate.getTime() + i * DAY_MS);
      const date = bkk(d);
      const [y, m, dd] = date.split("-");
      const store: Record<string, number> = {}; // เปลี่ยน: ไม่ fix 4 หมู่แล้ว
      const withdraw: Record<string, number> = {};

      for (const r of rows) {
        if (new Date(r.day).toISOString().split("T")[0] !== date) continue;
        if (r.action !== "STORE" && r.action !== "WITHDRAW") continue;
        const target = r.action === "STORE" ? store : withdraw;
        target[r.blood] = Number(r.count);
      }

      return { date, label: `${dd}-${m}-${y}`, store, withdraw };
    });

    res.json(result);
  } catch (error) {
    console.error("GET /stock/daily error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ===== GET /api/v1/stock/report =====
// ?date=2026-10-22              → วันเดียว
// ?from=2026-10-15&to=2026-10-20  → ช่วงวัน
router.get("/report", async (req, res) => {
  try {
    const { date, from, to } = req.query as Record<string, string | undefined>;

    let startDate: Date;
    let endDate: Date;

    if (date) {
      startDate = new Date(`${date}T00:00:00+07:00`);
      endDate = new Date(`${date}T23:59:59.999+07:00`);
    } else if (from && to) {
      startDate = new Date(`${from}T00:00:00+07:00`);
      endDate = new Date(`${to}T23:59:59.999+07:00`);
    } else {
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Bangkok",
      });
      startDate = new Date(`${today}T00:00:00+07:00`);
      endDate = new Date(`${today}T23:59:59.999+07:00`);
    }

    const [plasmaTypes, bloodTypes] = await Promise.all([
      prisma.masterPlasmaType.findMany({
        where: { active: true },
        orderBy: [{ sort: "asc" }, { code: "asc" }],
      }),
      prisma.masterBloodType.findMany({
        where: { active: true },
        orderBy: [{ sort: "asc" }, { code: "asc" }],
      }),
    ]);

    const types = plasmaTypes.map((t) => t.code);
    const bloods = bloodTypes.map((b) => b.code);

    // นับจัดเก็บจาก units.created_at (แทน log) — กันกรณีเพิ่ม unit ทีหลังผ่านแก้ไข
    const storeRows = await prisma.$queryRaw<
      { type: string; blood: string; count: bigint }[]
    >`
      SELECT b.type::text AS type, b.blood::text AS blood, COUNT(u.id) AS count
      FROM units u
      JOIN boxes b ON u.box_id = b.id
      WHERE u.created_at >= ${startDate}
        AND u.created_at <= ${endDate}
      GROUP BY b.type, b.blood
    `;

    const withdrawRows = await prisma.$queryRaw<
      { type: string; blood: string; count: bigint }[]
    >`
      SELECT b.type::text AS type, b.blood::text AS blood, COUNT(u.id) AS count
      FROM units u
      JOIN boxes b ON u.box_id = b.id
      WHERE u.status = 'WITHDRAWN'
        AND u.withdrawn_at >= ${startDate}
        AND u.withdrawn_at <= ${endDate}
      GROUP BY b.type, b.blood
    `;

    const stockRows = await prisma.$queryRaw<
      { type: string; blood: string; count: bigint }[]
    >`
      SELECT b.type::text AS type, b.blood::text AS blood, COUNT(u.id) AS count
      FROM units u
      JOIN boxes b ON u.box_id = b.id
      WHERE u.status = 'STORED' AND b.status = 'STORED'
      GROUP BY b.type, b.blood
    `;

    const allTypes = [...types];
    const allBloods = [...bloods];
    for (const row of [...storeRows, ...withdrawRows, ...stockRows]) {
      if (!allTypes.includes(row.type)) allTypes.push(row.type);
      if (!allBloods.includes(row.blood)) allBloods.push(row.blood);
    }

    const data: Record<
      string,
      Record<string, { stored: number; withdrawn: number }>
    > = {};
    const stock: Record<string, Record<string, number>> = {};

    for (const t of allTypes) {
      data[t] = {};
      stock[t] = {};
      for (const b of allBloods) {
        data[t][b] = { stored: 0, withdrawn: 0 };
        stock[t][b] = 0;
      }
    }

    for (const r of storeRows) {
      if (data[r.type]?.[r.blood])
        data[r.type][r.blood].stored = Number(r.count);
    }
    for (const r of withdrawRows) {
      if (data[r.type]?.[r.blood])
        data[r.type][r.blood].withdrawn = Number(r.count);
    }
    for (const r of stockRows) {
      if (stock[r.type]?.[r.blood] !== undefined)
        stock[r.type][r.blood] = Number(r.count);
    }

    res.json({ types: allTypes, bloods: allBloods, data, stock });
  } catch (error) {
    console.error("GET /stock/report error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ============================================================
//  สต็อกขั้นต่ำ แยกตาม ชนิดเลือด × หมู่เลือด
// ============================================================

const MAX_MIN_UNITS = 1_000_000;

/** รายการค่าขั้นต่ำ (เฉพาะชนิด/หมู่ที่ active) + ผู้แก้ล่าสุด */
async function readMinStock() {
  const [{ types, groups }, rows, last] = await Promise.all([
    loadActiveMasters(),
    prisma.minStock.findMany({
      select: { plasmaTypeId: true, bloodTypeId: true, minUnits: true },
    }),
    prisma.minStock.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true, updatedBy: { select: { name: true } } },
    }),
  ]);
  const map = new Map(
    rows.map((r) => [cellKey(r.plasmaTypeId, r.bloodTypeId), r.minUnits]),
  );
  return {
    types: types.map((t) => ({ code: t.code, name: t.name })),
    groups: groups.map((g) => g.code),
    items: types.flatMap((t) =>
      groups.map((g) => ({
        type: t.code,
        group: g.code,
        minUnits: map.get(cellKey(t.id, g.id)) ?? null,
      })),
    ),
    meta: {
      updatedBy: last?.updatedBy?.name ?? null,
      updatedAt: last ? last.updatedAt.toISOString() : null,
    },
  };
}

// ===== GET /api/v1/stock/min-stock =====
router.get("/min-stock", async (_req, res) => {
  try {
    res.json(await readMinStock());
  } catch (error) {
    console.error("GET /stock/min-stock error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ===== GET /api/v1/stock/min-stock/status =====
// สถานะทุกคู่ ชนิด × หมู่ — ใช้ร่วมกันทั้งแดชบอร์ดและกระดิ่งแจ้งเตือน
router.get("/min-stock/status", async (_req, res) => {
  try {
    res.json(await buildMinStockStatus());
  } catch (error) {
    console.error("GET /stock/min-stock/status error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ===== PUT /api/v1/stock/min-stock =====
// body { items: [{ type, group, minUnits: int >= 0 | null }] } — ADMIN เท่านั้น
// ส่งเฉพาะช่องที่แก้ก็ได้; ช่องที่ไม่ได้ส่งมาคงค่าเดิม
router.put("/min-stock", adminOnly, async (req, res) => {
  try {
    const raw: unknown = req.body?.items;
    if (!Array.isArray(raw) || raw.length === 0 || raw.length > 2000) {
      res.status(400).json({ message: "รูปแบบข้อมูลไม่ถูกต้อง: items" });
      return;
    }

    const { types, groups } = await loadActiveMasters();
    const typeId = new Map(types.map((t) => [t.code, t.id]));
    const groupId = new Map(groups.map((g) => [g.code, g.id]));

    const wanted = new Map<
      string,
      { plasmaTypeId: string; bloodTypeId: string; minUnits: number | null }
    >();
    for (const it of raw as unknown[]) {
      const row = (it ?? {}) as Record<string, unknown>;
      const type = typeof row.type === "string" ? row.type : "";
      const group = typeof row.group === "string" ? row.group : "";
      const plasmaTypeId = typeId.get(type);
      const bloodTypeId = groupId.get(group);
      if (!plasmaTypeId || !bloodTypeId) {
        res.status(400).json({
          message: `ไม่พบชนิดเลือด/หมู่เลือดที่เปิดใช้งาน: ${type || "?"} หมู่ ${group || "?"}`,
        });
        return;
      }
      const v = row.minUnits;
      const ok =
        v === null ||
        (typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= MAX_MIN_UNITS);
      if (!ok) {
        res.status(400).json({
          message: `ค่าขั้นต่ำของ ${type} หมู่ ${group} ต้องเป็นจำนวนเต็ม 0 ขึ้นไป หรือเว้นว่าง`,
        });
        return;
      }
      wanted.set(cellKey(plasmaTypeId, bloodTypeId), {
        plasmaTypeId,
        bloodTypeId,
        minUnits: v as number | null,
      });
    }

    const userId = req.user!.id;
    const changed = await prisma.$transaction(async (tx) => {
      const existing = await tx.minStock.findMany({
        select: { plasmaTypeId: true, bloodTypeId: true, minUnits: true },
      });
      const cur = new Map(
        existing.map((r) => [cellKey(r.plasmaTypeId, r.bloodTypeId), r.minUnits]),
      );
      const now = new Date();
      let n = 0;
      for (const [k, w] of wanted) {
        // แตะเฉพาะช่องที่ค่าเปลี่ยนจริง — updatedBy/updatedAt จึงหมายถึง "แก้ล่าสุด" จริงๆ
        if ((cur.get(k) ?? null) === w.minUnits) continue;
        await tx.minStock.upsert({
          where: {
            plasmaTypeId_bloodTypeId: {
              plasmaTypeId: w.plasmaTypeId,
              bloodTypeId: w.bloodTypeId,
            },
          },
          update: { minUnits: w.minUnits, updatedById: userId, updatedAt: now },
          create: { ...w, updatedById: userId, updatedAt: now },
        });
        n++;
      }
      return n;
    });

    // คำนวณสถานะ + การแจ้งเตือนใหม่ทันที
    if (changed > 0) await buildMinStockStatus();

    res.json({ ...(await readMinStock()), changed });
  } catch (error) {
    console.error("PUT /stock/min-stock error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

export default router;
