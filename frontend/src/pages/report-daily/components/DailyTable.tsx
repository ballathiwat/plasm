// frontend/src/pages/report-daily/components/DailyTable.tsx

import type { DailyData } from "../services/DailyReportType";
import { sumBlood } from "../services/DailyReportType";
import { groupColor } from "../../../helpers/blood";

const STORE_COLOR = "#16A34A";
const WITHDRAW_COLOR = "#DC2626";

interface Props {
  dailyData: DailyData[];
  groups: string[];
  totals: { store: Record<string, number>; withdraw: Record<string, number> };
}

const Cell = ({ k, v }: { k: string; v: number }) => (
  <span
    key={k}
    style={{
      textAlign: "center",
      fontVariantNumeric: "tabular-nums",
      color: v ? "var(--text-primary)" : "var(--text-disabled)",
    }}
  >
    {v || "-"}
  </span>
);

export default function DailyTable({ dailyData, groups, totals }: Props) {
  const span = groups.length + 1;
  const cols = `100px repeat(${span}, minmax(40px, 1fr)) repeat(${span}, minmax(40px, 1fr))`;
  const minWidth = Math.max(760, 70 + span * 2 * 48);

  return (
    <div
      style={{
        background: "var(--surface, #fff)",
        border: "1px solid var(--border, #E4E4E7)",
        borderRadius: "var(--radius-lg, 10px)",
        boxShadow: "var(--shadow-sm)",
        padding: 20,
      }}
    >
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px" }}>
        ตารางรายวัน แยกหมู่เลือด
      </h3>

      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth, fontSize: 13 }}>
          {/* Group header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: cols,
              gap: 4,
              padding: "6px 0",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <span />
            <span
              style={{
                gridColumn: `span ${span}`,
                textAlign: "center",
                color: STORE_COLOR,
                background: "#F0FDF4",
                borderRadius: 6,
                padding: "4px 0",
              }}
            >
              นำเข้า (units)
            </span>
            <span
              style={{
                gridColumn: `span ${span}`,
                textAlign: "center",
                color: WITHDRAW_COLOR,
                background: "#FEF2F2",
                borderRadius: 6,
                padding: "4px 0",
              }}
            >
              นำออก (units)
            </span>
          </div>

          {/* Column header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: cols,
              gap: 4,
              padding: "8px 0",
              borderBottom: "1px solid var(--border)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            <span>วันที่</span>
            {groups.map((g) => (
              <span
                key={`hs-${g}`}
                style={{ textAlign: "center", color: groupColor(g) }}
              >
                {g}
              </span>
            ))}
            <span style={{ textAlign: "center" }}>รวม</span>
            {groups.map((g) => (
              <span
                key={`hw-${g}`}
                style={{ textAlign: "center", color: groupColor(g) }}
              >
                {g}
              </span>
            ))}
            <span style={{ textAlign: "center" }}>รวม</span>
          </div>

          {/* Rows */}
          {dailyData.map((d) => {
            const st = sumBlood(d.store);
            const wd = sumBlood(d.withdraw);
            return (
              <div
                key={d.date}
                style={{
                  display: "grid",
                  gridTemplateColumns: cols,
                  gap: 4,
                  padding: "9px 0",
                  borderBottom: "1px solid var(--border)",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "var(--text-secondary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {d.label}
                </span>
                {groups.map((g) => (
                  <Cell key={`s-${g}`} k={`s-${g}`} v={d.store[g] || 0} />
                ))}
                <span
                  style={{
                    textAlign: "center",
                    fontWeight: 700,
                    color: st ? STORE_COLOR : "var(--text-disabled)",
                  }}
                >
                  {st || "-"}
                </span>
                {groups.map((g) => (
                  <Cell key={`w-${g}`} k={`w-${g}`} v={d.withdraw[g] || 0} />
                ))}
                <span
                  style={{
                    textAlign: "center",
                    fontWeight: 700,
                    color: wd ? WITHDRAW_COLOR : "var(--text-disabled)",
                  }}
                >
                  {wd || "-"}
                </span>
              </div>
            );
          })}

          {/* Totals */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: cols,
              gap: 4,
              padding: "10px 0",
              fontWeight: 700,
              background: "var(--surface-raised, #F4F4F5)",
              borderRadius: 6,
              marginTop: 6,
            }}
          >
            <span style={{ paddingLeft: 8 }}>รวม</span>
            {groups.map((g) => (
              <Cell key={`ts-${g}`} k={`ts-${g}`} v={totals.store[g] || 0} />
            ))}
            <span style={{ textAlign: "center", color: STORE_COLOR }}>
              {sumBlood(totals.store)}
            </span>
            {groups.map((g) => (
              <Cell key={`tw-${g}`} k={`tw-${g}`} v={totals.withdraw[g] || 0} />
            ))}
            <span style={{ textAlign: "center", color: WITHDRAW_COLOR }}>
              {sumBlood(totals.withdraw)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
