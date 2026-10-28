// src/routes/stock.ts

import { Router } from "express";
import { prisma } from "../lib/prisma";

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

    const [bloodTypes, nowRows, pastRows, setting] = await Promise.all([
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
      prisma.setting.findUnique({ where: { key: "minimumStock" } }),
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

    // ขั้นต่ำ: เฉพาะหมู่ที่ตั้งค่าไว้ (หมู่ที่ไม่มี = ไม่กำหนด)
    const rawMin = (setting?.value ?? {}) as Record<string, unknown>;
    const minimum: Record<string, number> = {};
    for (const g of groups) {
      const v = Number(rawMin[g]);
      if (Number.isFinite(v) && v > 0) minimum[g] = v;
    }

    res.json({ groups, stocks, minimum, change });
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
      SELECT
        DATE((le.timestamp AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Bangkok') AS day,
        le.action::text AS action,
        b.blood::text AS blood,
        COALESCE(SUM(le.unit_count), 0) AS count
      FROM log_entries le
      JOIN boxes b ON b.id = le.box_id
      WHERE le.timestamp >= ${startDate}
      AND le.action IN ('STORE', 'WITHDRAW')
      GROUP BY 1, 2, 3
    `;

    const result = Array.from({ length: days }, (_, i) => {
      const d = new Date(startDate.getTime() + i * DAY_MS);
      const date = bkk(d);
      const [, m, dd] = date.split("-");
      const store: Record<string, number> = {}; // เปลี่ยน: ไม่ fix 4 หมู่แล้ว
      const withdraw: Record<string, number> = {};

      for (const r of rows) {
        if (new Date(r.day).toISOString().split("T")[0] !== date) continue;
        if (r.action !== "STORE" && r.action !== "WITHDRAW") continue;
        const target = r.action === "STORE" ? store : withdraw;
        target[r.blood] = Number(r.count);
      }

      return { date, label: `${Number(dd)}/${Number(m)}`, store, withdraw };
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

    const storeRows = await prisma.$queryRaw<
      { type: string; blood: string; count: bigint }[]
    >`
      SELECT b.type::text AS type, b.blood::text AS blood, COALESCE(SUM(le.unit_count), 0) AS count
      FROM log_entries le
      JOIN boxes b ON b.id = le.box_id
      WHERE le.action = 'STORE'
        AND le.timestamp >= ${startDate}
        AND le.timestamp <= ${endDate}
      GROUP BY b.type, b.blood
    `;

    const withdrawRows = await prisma.$queryRaw<
      { type: string; blood: string; count: bigint }[]
    >`
      SELECT b.type::text AS type, b.blood::text AS blood, COALESCE(SUM(le.unit_count), 0) AS count
      FROM log_entries le
      JOIN boxes b ON b.id = le.box_id
      WHERE le.action = 'WITHDRAW'
        AND le.timestamp >= ${startDate}
        AND le.timestamp <= ${endDate}
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

export default router;
