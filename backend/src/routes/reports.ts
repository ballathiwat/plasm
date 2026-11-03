// src/routes/reports.ts
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

const bkkToday = (): string =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
const parseDate = (s: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00+07:00`);
  return isNaN(d.getTime()) ? null : d;
};
const diffDays = (a: Date, b: Date) =>
  Math.round((b.getTime() - a.getTime()) / 86400000) + 1;

const ALL_KEYS = [
  "A","A+","A-","B","B+","B-","O","O+","O-","AB","AB+","AB-",
];
const GROUPS_ORDER = ["A","B","O","AB"];
const sortKey = (a: string, b: string) => ALL_KEYS.indexOf(a) - ALL_KEYS.indexOf(b);

const baseGroup = (k: string) =>
  /^AB/i.test(k) ? "AB" : /^[ABO]/i.test(k) ? k[0].toUpperCase() : k;

// ===== GET /api/v1/reports/movements =====
router.get("/movements", async (req, res) => {
  try {
    const { from: fromStr, to: toStr, types: typesStr, blood } =
      req.query as Record<string, string | undefined>;

    // --- Validate dates ---
    if (!fromStr || !toStr) {
      res.status(400).json({ message: "กรุณาเลือกวันที่ให้ครบ" }); return;
    }
    const fromDate = parseDate(fromStr);
    const toDate = parseDate(toStr);
    if (!fromDate || !toDate) {
      res.status(400).json({ message: "กรุณาเลือกวันที่ให้ครบ" }); return;
    }
    if (toDate < fromDate) {
      res.status(400).json({ message: "วันสิ้นสุดต้องไม่ก่อนวันเริ่ม" }); return;
    }
    if (toDate > parseDate(bkkToday())!) {
      res.status(400).json({ message: "เลือกวันในอนาคตไม่ได้" }); return;
    }
    const days = diffDays(fromDate, toDate);
    if (days > 366) {
      res.status(400).json({ message: "เลือกช่วงได้ไม่เกิน 1 ปี — ลองแบ่งดูทีละช่วง" }); return;
    }

    // --- Resolve types ---
    const masterTypes = await prisma.masterPlasmaType.findMany({
      where: { active: true }, orderBy: [{ sort: "asc" }, { code: "asc" }],
    });
    const masterCodes = masterTypes.map((t) => t.code);
    let filterTypes: string[];
    if (typesStr && typesStr.trim()) {
      filterTypes = typesStr.split(",").map((s) => s.trim()).filter(Boolean);
      for (const code of filterTypes) {
        if (!masterCodes.includes(code)) {
          res.status(400).json({ message: `ไม่พบชนิด ${code}` }); return;
        }
      }
    } else {
      filterTypes = masterCodes;
    }

    // --- Validate blood ---
    const filterBlood = blood && blood !== "all" ? blood : null;
    if (filterBlood && !ALL_KEYS.includes(filterBlood)) {
      res.status(400).json({ message: "หมู่เลือดไม่ถูกต้อง" }); return;
    }

    // --- Granularity ---
    const granularity: "day" | "week" | "month" =
      days <= 14 ? "day" : days <= 90 ? "week" : "month";

    // --- Query ---
    const startTs = new Date(`${fromStr}T00:00:00+07:00`);
    const endTs = new Date(`${toStr}T23:59:59.999+07:00`);
    const params: unknown[] = [startTs, endTs];
    const conds: string[] = [];

    if (filterTypes.length < masterCodes.length) {
      const ph = filterTypes.map((_, i) => `$${params.length + i + 1}`);
      params.push(...filterTypes);
      conds.push(`AND b.type IN (${ph.join(",")})`);
    }
    if (filterBlood) {
      params.push(filterBlood);
      conds.push(`AND bkey = $${params.length}`);
    }
    const extra = conds.join(" ");

    // bkey: exact blood code. A = no Rh, A+ = Rh+, A- = Rh-
    const bkeyExpr = `
      CASE
        WHEN b.blood LIKE '%+' THEN REPLACE(b.blood::text, '+', '') || '+'
        WHEN b.blood LIKE '%-' THEN REPLACE(b.blood::text, '-', '') || '-'
        ELSE b.blood::text
      END`;

    const rows = await prisma.$queryRawUnsafe<{
      day: Date; action: string; plasma_type: string; bkey: string; count: bigint;
    }[]>(`
      SELECT day, action, plasma_type, bkey, COUNT(*) AS count FROM (
        SELECT
          DATE((u.created_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Bangkok') AS day,
          'STORE' AS action,
          b.type::text AS plasma_type,
          ${bkeyExpr} AS bkey
        FROM units u JOIN boxes b ON u.box_id = b.id
        WHERE u.created_at >= $1 AND u.created_at <= $2 ${extra}
        UNION ALL
        SELECT
          DATE((u.withdrawn_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Bangkok') AS day,
          'WITHDRAW' AS action,
          b.type::text AS plasma_type,
          ${bkeyExpr} AS bkey
        FROM units u JOIN boxes b ON u.box_id = b.id
        WHERE u.status = 'WITHDRAWN'
          AND u.withdrawn_at >= $1 AND u.withdrawn_at <= $2 ${extra}
      ) t GROUP BY day, action, plasma_type, bkey
    `, ...params);

    // --- Determine active keys ---
    const activeKeys = new Set<string>();
    for (const r of rows) activeKeys.add(r.bkey);
    if (activeKeys.size === 0) {
      if (filterBlood) activeKeys.add(filterBlood);
      else ALL_KEYS.forEach((k) => activeKeys.add(k));
    }
    const keys = ALL_KEYS.filter((k) => activeKeys.has(k));

    // --- Build buckets ---
    interface BD { start: string; end: string }
    const bds: BD[] = [];
    if (granularity === "day") {
      for (let i = 0; i < days; i++) {
        const d = new Date(fromDate.getTime() + i * 86400000);
        const iso = d.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
        bds.push({ start: iso, end: iso });
      }
    } else if (granularity === "week") {
      let c = new Date(fromDate);
      while (c <= toDate) {
        const we = new Date(c.getTime() + 6 * 86400000);
        const e = we > toDate ? toDate : we;
        bds.push({
          start: c.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }),
          end: e.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }),
        });
        c = new Date(we.getTime() + 86400000);
      }
    } else {
      let c = new Date(fromDate);
      while (c <= toDate) {
        const y = c.getFullYear(), m = c.getMonth();
        const me = new Date(y, m + 1, 0);
        const e = me > toDate ? toDate : me;
        bds.push({
          start: c.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }),
          end: e.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }),
        });
        c = new Date(y, m + 1, 1);
      }
    }

    const emptyK = (): Record<string, number> => {
      const r: Record<string, number> = {};
      for (const k of keys) r[k] = 0;
      return r;
    };
    const buckets = bds.map((b) => ({
      start: b.start, end: b.end, store: emptyK(), withdraw: emptyK(),
    }));

    // --- Matrix accumulators ---
    const mat: Record<string, { in: number; out: number }> = {};
    let totalIn = 0, totalOut = 0;

    for (const r of rows) {
      const dayStr = new Date(r.day).toISOString().split("T")[0];
      const cnt = Number(r.count);
      const bucket = buckets.find((b) => dayStr >= b.start && dayStr <= b.end);
      if (bucket) {
        const t = r.action === "STORE" ? bucket.store : bucket.withdraw;
        if (t[r.bkey] !== undefined) t[r.bkey] += cnt;
      }
      // matrix
      const mk = `${r.plasma_type}|${r.bkey}`;
      if (!mat[mk]) mat[mk] = { in: 0, out: 0 };
      if (r.action === "STORE") { mat[mk].in += cnt; totalIn += cnt; }
      else { mat[mk].out += cnt; totalOut += cnt; }
    }

    // Build matrix array (only non-zero)
    const matrix = Object.entries(mat)
      .filter(([, v]) => v.in > 0 || v.out > 0)
      .map(([k, v]) => {
        const [type, key] = k.split("|");
        return { type, key, in: v.in, out: v.out };
      })
      .sort((a, b) => {
        const ti = filterTypes.indexOf(a.type) - filterTypes.indexOf(b.type);
        if (ti !== 0) return ti;
        return sortKey(a.key, b.key);
      });

    res.json({
      from: fromStr, to: toStr, days, granularity,
      types: filterTypes, keys, buckets, matrix,
      totals: { in: totalIn, out: totalOut },
    });
  } catch (error) {
    console.error("GET /reports/movements error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

export default router;
