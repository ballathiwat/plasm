// ============================================================
//  src/pages/map/index.tsx
// ============================================================

import { useState } from "react";
import useMap from "./services/useMap";
import MapZoneCard from "./components/MapZoneCard";
import { bloodBase } from "../../helpers/blood";
import type { BloodGroupAgeInfo } from "./services/MapType";

// สีการ์ดสรุปของแต่ละสถานที่ (วนซ้ำถ้ามีมากกว่านี้)
const ZONE_COLORS = [
  "var(--group-a)",
  "var(--group-ab)",
  "var(--group-o)",
  "var(--group-other)",
];

const MapPage = () => {
  const { zones, bloodOrder, bloodAgeMap, totalBoxes, totalUnits, loading } =
    useMap();
  const [tab, setTab] = useState<"map" | "age">("map");

  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "var(--text-secondary)",
        }}
      >
        กำลังโหลด...
      </div>
    );
  }

  const summaryCards = [
    {
      key: "total-boxes",
      label: "กล่องทั้งหมด",
      value: totalBoxes,
      color: "var(--primary)",
    },
    {
      key: "total-units",
      label: "Unit ทั้งหมด",
      value: totalUnits,
      color: "var(--group-b)",
    },
    ...zones.map((z, i) => ({
      key: z.id,
      label: z.name,
      value: z.totalBoxes,
      color: ZONE_COLORS[i % ZONE_COLORS.length],
    })),
  ];

  return (
    <div style={{ animation: "plasm-fade-in 0.2s ease" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
          แผนผังจัดเก็บ
        </h2>
        <p
          style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}
        >
          ภาพรวมตำแหน่งจัดเก็บพลาสมา · รวม {totalBoxes} กล่อง · {totalUnits}{" "}
          units
        </p>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {summaryCards.map((item) => (
          <div
            key={item.key}
            style={{
              background: "var(--surface, #fff)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md, 8px)",
              padding: "14px 18px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>
              {item.value}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                marginTop: 2,
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 16,
          borderBottom: "2px solid var(--border)",
        }}
      >
        {[
          { key: "map" as const, label: "🗺️ แผนผัง" },
          { key: "age" as const, label: "📦 เก่าสุด / ใหม่สุด" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? "var(--primary)" : "var(--text-secondary)",
              background: "none",
              border: "none",
              borderBottom:
                tab === t.key
                  ? "2px solid var(--primary)"
                  : "2px solid transparent",
              marginBottom: -2,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content: แผนผัง */}
      {tab === "map" &&
        (zones.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            ยังไม่มีสถานที่จัดเก็บ — เพิ่มได้ที่ ตั้งค่า › สถานที่จัดเก็บ
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: 16,
            }}
          >
            {zones.map((z) => (
              <MapZoneCard key={z.id} zone={z} bloodOrder={bloodOrder} />
            ))}
          </div>
        ))}

      {/* Tab content: เก่าสุด / ใหม่สุด */}
      {tab === "age" && bloodAgeMap.length > 0 && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: 20,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                  <th style={{ padding: "8px 12px", textAlign: "left" }}>
                    กรุ๊ป
                  </th>
                  <th style={{ padding: "8px 12px", textAlign: "left" }}>
                    📦 เก่าสุด
                  </th>
                  <th style={{ padding: "8px 12px", textAlign: "left" }}>
                    📦 ใหม่สุด
                  </th>
                </tr>
              </thead>
              <tbody>
                {bloodAgeMap.map((row: BloodGroupAgeInfo) => (
                  <tr
                    key={row.blood}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "8px 12px" }}>
                      <span
                        className="blood-badge"
                        data-blood={bloodBase(row.blood)}
                        style={{ fontSize: 12, padding: "3px 10px" }}
                      >
                        {row.blood}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        color: "var(--stock-danger)",
                      }}
                    >
                      {row.oldest ? (
                        <div style={{ lineHeight: 1.6 }}>
                          <div style={{ fontWeight: 600 }}>
                            {row.oldest.boxLabel}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {row.oldest.zoneName} · ชั้น {row.oldest.shelf}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text-disabled)",
                            }}
                          >
                            วันที่เก็บ {row.oldest.collectionDate}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        color: "var(--stock-normal)",
                      }}
                    >
                      {row.newest ? (
                        <div style={{ lineHeight: 1.6 }}>
                          <div style={{ fontWeight: 600 }}>
                            {row.newest.boxLabel}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {row.newest.zoneName} · ชั้น {row.newest.shelf}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text-disabled)",
                            }}
                          >
                            วันที่เก็บ {row.newest.collectionDate}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
