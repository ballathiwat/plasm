// ============================================================
//  src/pages/map/components/MapCabinetGrid.tsx
// ============================================================

import type { BloodGroup } from "../../../types/models";
import type { LocationSummary } from "../services/MapType";



interface Props {
  data: LocationSummary;
}

export default function MapCabinetGrid({ data }: Props) {
  return (
    <div
      style={{
        background: "var(--surface, #fff)",
        border: "1px solid var(--border, #E4E4E7)",
        borderRadius: "var(--radius-lg, 10px)",
        padding: 24,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>ตู้ -30°C</h3>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {data.totalBoxes} กล่อง · {data.totalUnits} units
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.shelves.map((shelf) => {
          const hasBoxes = shelf.totalBoxes > 0;
          return (
            <div
              key={shelf.shelf}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderRadius: "var(--radius-md, 8px)",
                border: `1px solid ${hasBoxes ? "var(--primary, #2563EB)" : "var(--border, #E4E4E7)"}`,
                background: hasBoxes
                  ? "var(--group-a-surface, #DBEAFE)"
                  : "var(--surface-raised, #F4F4F5)",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: hasBoxes
                      ? "var(--primary)"
                      : "var(--text-secondary)",
                  }}
                >
                  {shelf.shelf}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    marginLeft: 12,
                  }}
                >
                  {shelf.totalBoxes} กล่อง · {shelf.totalUnits} units
                </span>
              </div>

              <div style={{ display: "flex", gap: 4 }}>
                {(["A", "B", "O", "AB"] as BloodGroup[]).map((g) => {
                  const count = shelf.byBlood[g];
                  if (!count) return null;
                  return (
                    <span
                      key={g}
                      className="blood-badge"
                      data-blood={g}
                      style={{ fontSize: 10, padding: "2px 6px" }}
                    >
                      {g}:{count}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
