// ============================================================
//  src/pages/withdraw/components/WithdrawBoxList.tsx
// ============================================================

import { Search, ChevronRight } from "lucide-react";
import type { WithdrawBoxItem } from "../services/WithdrawType";
import { groupSurface, groupInk } from "../../../helpers/blood";
import useBloodTypes from "../../../helpers/useBloodTypes";
import { zoneLabel } from "../../../helpers/zone";

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid var(--border, #E4E4E7)",
  borderRadius: "var(--radius-sm, 6px)",
  fontSize: 14,
  background: "var(--surface, #fff)",
  color: "var(--text-primary, #18181B)",
  width: "100%",
};

interface Props {
  boxes: WithdrawBoxItem[];
  loading: boolean;
  selectedBoxId?: string;
  searchQuery: string;
  filterBlood: string;
  onSearchChange: (q: string) => void;
  onFilterBloodChange: (b: string) => void;
  onSelectBox: (boxId: string) => void;
}

export default function WithdrawBoxList({
  boxes,
  loading,
  selectedBoxId,
  searchQuery,
  filterBlood,
  onSearchChange,
  onFilterBloodChange,
  onSelectBox,
}: Props) {
  const bloodTypes = useBloodTypes();

  return (
    <div style={{ flex: "1 1 400px", minWidth: 0 }}>
      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-secondary)",
            }}
          />
          <input
            placeholder="ค้นหากล่อง หรือ unit..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
        </div>
        <select
          value={filterBlood}
          onChange={(e) => onFilterBloodChange(e.target.value)}
          style={{ ...inputStyle, width: "auto" }}
        >
          <option value="">ทุกหมู่เลือด</option>
          {bloodTypes.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Box cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {loading ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            กำลังโหลด...
          </div>
        ) : boxes.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            {searchQuery ? "ไม่พบกล่องที่ค้นหา" : "ไม่มีกล่องที่เก็บอยู่"}
          </div>
        ) : (
          boxes.map((box) => {
            const isSelected = selectedBoxId === box.id;
            return (
              <button
                key={box.id}
                onClick={() => onSelectBox(box.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  textAlign: "left",
                  width: "100%",
                  background: isSelected
                    ? "var(--group-a-surface, #DBEAFE)"
                    : "var(--surface, #fff)",
                  border: isSelected
                    ? "2px solid var(--primary, #2563EB)"
                    : "1px solid var(--border, #E4E4E7)",
                  borderRadius: "var(--radius-md, 8px)",
                  cursor: "pointer",
                  transition: "border 0.15s",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: groupSurface(box.blood),
                    color: groupInk(box.blood),
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {box.blood}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {box.boxLabel}
                    {box.boxName && (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 400,
                          fontFamily: "inherit",
                          color: "var(--text-secondary)",
                          marginLeft: 8,
                        }}
                      >
                        · {box.boxName}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      marginTop: 2,
                    }}
                  >
                    {box.type} · {zoneLabel(box.zoneName, box.location)} · ชั้น{" "}
                    {box.shelf} · {box.units.length} units
                  </div>
                </div>

                <ChevronRight
                  size={16}
                  style={{ color: "var(--text-secondary)", flexShrink: 0 }}
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
