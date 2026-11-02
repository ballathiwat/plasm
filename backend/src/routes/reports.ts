// src/routes/reports.ts

import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// ===== Helpers =====
const bkkToday = (): string =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

const parseDate = (s: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(`${s}T00:00:00+07:00`);
  return isNaN(d.getTime()) ? null : d;
};

const diffDays = (from: Date, to: Date): number =>
  Math.round((to.getTime() - from.getTime()) / 86400000) + 1;

const GROUPS_ORDER = ["A", "B", "O", "AB"];
const sortGroup = (a: string, b: string) =>
  (GROUPS_ORDER.indexOf(a) === -1 ? 99 : GROUPS_ORDER.indexOf(a)) -
  (GROUPS_ORDER.indexOf(b) === -1 ? 99 : GROUPS_ORDER.indexOf(b));

// ===== GET /api/v1/reports/movements =====
router.get("/movements", async (req, res) => {
  try {
    const { from: fromStr, to: toStr, type, group } = req.query as Record<
      string,
      string | undefined
    >;

    // --- Validation ---
    if (!fromStr || !toStr) {
      res.status(400).json({ message: "กรุณาระบุวันเริ่มต้นและวันสิ้นสุด" });
      return;
    }

    const fromDate = parseDate(fromStr);
    const toDate = parseDate(toStr);

    if (!fromDate || !toDate) {
      res.status(400).json({ message: "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)" });
      return;
    }

    if (toDate < fromDate) {
      res.status(400).json({ message: "วันสิ้นสุดต้องไม่ก่อนวันเริ่ม" });
      return;
    }

    const today = parseDate(bkkToday())!;
    if (toDate > today) {
      res.status(400).json({ message: "วันสิ้นสุดต้องไม่เกินวันนี้" });
      return;
    }

    const days = diffDays(fromDate, toDate);
    if (days > 366) {
      res
        .status(400)
        .json({ message: "เลือกช่วงได้ไม่เกิน 1 ปี — ลองแบ่งดูทีละช่วง" });
      return;
    }

    // --- Filters ---
    const filterType = type && type !== "all" ? type : null;
    const filterGroup = group && group !== "all" ? group : null;

    // --- Granularity ---
    const granularity: "day" | "week" | "month" =
      days <= 14 ? "day" : days <= 90 ? "week" : "month";

    // --- Query ---
    const startTs = new Date(`${fromStr}T00:00:00+07:00`);
    const endTs = new Date(`${toStr}T23:59:59.999+07:00`);

    const conditions: string[] = [];
    const params: unknown[] = [startTs, endTs];

    if (filterType) {
      params.push(filterType);
      conditions.push(`AND b.type = $${params.length}`);
    }
    if (filterGroup) {
      params.push(`${filterGroup}%`);
      conditions.push(`AND b.blood LIKE $${params.length}`);
    }

    const extra = conditions.join(" ");

    const rows = await prisma.$queryRawUnsafe<
      {
        day: Date;
        action: string;
        plasma_type: string;
        blood_group: string;
        rh: string;
        count: bigint;
      }[]
    >(
      `
      SELECT day, action, plasma_type, blood_group, rh, COUNT(*) AS count FROM (
        SELECT
          DATE((u.created_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Bangkok') AS day,
          'STORE' AS action,
          b.type::text AS plasma_type,
          CASE
            WHEN b.blood LIKE 'AB%' THEN 'AB'
            WHEN b.blood LIKE 'A%' THEN 'A'
            WHEN b.blood LIKE 'B%' THEN 'B'
            WHEN b.blood LIKE 'O%' THEN 'O'
            ELSE b.blood::text
          END AS blood_group,
          CASE
            WHEN b.blood LIKE '%-' THEN '-'
            ELSE '+'
          END AS rh
        FROM units u
        JOIN boxes b ON u.box_id = b.id
        WHERE u.created_at >= $1 AND u.created_at <= $2 ${extra}
        UNION ALL
        SELECT
          DATE((u.withdrawn_at AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Bangkok') AS day,
          'WITHDRAW' AS action,
          b.type::text AS plasma_type,
          CASE
            WHEN b.blood LIKE 'AB%' THEN 'AB'
            WHEN b.blood LIKE 'A%' THEN 'A'
            WHEN b.blood LIKE 'B%' THEN 'B'
            WHEN b.blood LIKE 'O%' THEN 'O'
            ELSE b.blood::text
          END AS blood_group,
          CASE
            WHEN b.blood LIKE '%-' THEN '-'
            ELSE '+'
          END AS rh
        FROM units u
        JOIN boxes b ON u.box_id = b.id
        WHERE u.status = 'WITHDRAWN'
          AND u.withdrawn_at >= $1 AND u.withdrawn_at <= $2 ${extra}
      ) t
      GROUP BY day, action, plasma_type, blood_group, rh
      `,
      ...params,
    );

    // --- Active types & groups ---
    const activeTypesSet = new Set<string>();
    const activeGroupsSet = new Set<string>();
    for (const r of rows) {
      activeTypesSet.add(r.plasma_type);
      activeGroupsSet.add(r.blood_group);
    }

    if (activeTypesSet.size === 0) {
      const pts = await prisma.masterPlasmaType.findMany({
        where: { active: true },
        orderBy: [{ sort: "asc" }],
      });
      for (const p of pts) {
        if (!filterType || p.code === filterType) activeTypesSet.add(p.code);
      }
    }
    if (activeGroupsSet.size === 0) {
      for (const g of GROUPS_ORDER) {
        if (!filterGroup || g === filterGroup) activeGroupsSet.add(g);
      }
    }

    const types = Array.from(activeTypesSet).sort();
    const groups = Array.from(activeGroupsSet).sort(sortGroup);

    // --- Build buckets ---
    interface BucketDef {
      start: string;
      end: string;
    }
    const bucketDefs: BucketDef[] = [];

    if (granularity === "day") {
      for (let i = 0; i < days; i++) {
        const d = new Date(fromDate.getTime() + i * 86400000);
        const iso = d.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
        bucketDefs.push({ start: iso, end: iso });
      }
    } else if (granularity === "week") {
      let cursor = new Date(fromDate);
      while (cursor <= toDate) {
        const weekEnd = new Date(cursor.getTime() + 6 * 86400000);
        const end = weekEnd > toDate ? toDate : weekEnd;
        bucketDefs.push({
          start: cursor.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }),
          end: end.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }),
        });
        cursor = new Date(weekEnd.getTime() + 86400000);
      }
    } else {
      let cursor = new Date(fromDate);
      while (cursor <= toDate) {
        const y = cursor.getFullYear();
        const m = cursor.getMonth();
        const monthEnd = new Date(y, m + 1, 0);
        const end = monthEnd > toDate ? toDate : monthEnd;
        bucketDefs.push({
          start: cursor.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }),
          end: end.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }),
        });
        cursor = new Date(y, m + 1, 1);
      }
    }

    // --- Aggregate ---
    type ActionData = Record<string, Record<string, number>>;
    const emptyAction = (): ActionData => {
      const a: ActionData = {};
      for (const t of types) {
        a[t] = {};
        for (const g of groups) a[t][g] = 0;
      }
      return a;
    };

    const buckets = bucketDefs.map((bd) => ({
      start: bd.start,
      end: bd.end,
      store: emptyAction(),
      withdraw: emptyAction(),
    }));

    const summaryStore: Record<string, number> = {};
    const summaryWithdraw: Record<string, number> = {};

    for (const r of rows) {
      const dayStr = new Date(r.day).toISOString().split("T")[0];
      const count = Number(r.count);

      const bucket = buckets.find((b) => dayStr >= b.start && dayStr <= b.end);
      if (bucket) {
        const target = r.action === "STORE" ? bucket.store : bucket.withdraw;
        if (target[r.plasma_type]?.[r.blood_group] !== undefined) {
          target[r.plasma_type][r.blood_group] += count;
        }
      }

      const bloodFull = `${r.blood_group}${r.rh}`;
      const summaryKey = `${r.action}|${r.plasma_type}|${bloodFull}`;
      const summaryTarget = r.action === "STORE" ? summaryStore : summaryWithdraw;
      summaryTarget[summaryKey] = (summaryTarget[summaryKey] || 0) + count;
    }

    // --- Summary arrays ---
    const buildSummary = (map: Record<string, number>) => {
      const result: { type: string; blood: string; group: string; qty: number }[] = [];
      for (const [key, qty] of Object.entries(map)) {
        const [, pType, blood] = key.split("|");
        const grp = blood.replace(/[+-]$/, "");
        result.push({ type: pType, blood, group: grp, qty });
      }
      result.sort((a, b) => {
        const gCmp = sortGroup(a.group, b.group);
        if (gCmp !== 0) return gCmp;
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        return a.blood < b.blood ? -1 : a.blood > b.blood ? 1 : 0;
      });
      return result;
    };

    // --- Totals ---
    const totals = {
      store: {} as Record<string, number>,
      withdraw: {} as Record<string, number>,
    };
    for (const g of groups) {
      totals.store[g] = 0;
      totals.withdraw[g] = 0;
    }
    for (const bucket of buckets) {
      for (const t of types) {
        for (const g of groups) {
          totals.store[g] += bucket.store[t]?.[g] || 0;
          totals.withdraw[g] += bucket.withdraw[t]?.[g] || 0;
        }
      }
    }

    res.json({
      from: fromStr,
      to: toStr,
      days,
      granularity,
      types,
      groups,
      buckets,
      summary: {
        store: buildSummary(summaryStore),
        withdraw: buildSummary(summaryWithdraw),
      },
      totals,
    });
  } catch (error) {
    console.error("GET /reports/movements error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

export default router;
