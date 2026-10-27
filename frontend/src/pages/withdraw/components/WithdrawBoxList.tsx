// ============================================================
//  src/pages/withdraw/components/WithdrawBoxList.tsx
// ============================================================

import { useMemo } from "react";
import { Search, ChevronRight } from "lucide-react";
import type { WithdrawBoxItem } from "../services/WithdrawType";
import { groupSurface, groupInk } from "../../../helpers/blood";
import useBloodTypes from "../../../helpers/useBloodTypes";
import { zoneLabel } from "../../../helpers/zone";
import FormInput from "../../../components/common/FormInput";
import SelectDropdown, {
  type OptionType,
} from "../../../components/common/SelectDropdown";

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

/* ── Helpers ── */
const toOption = (value: string, label: string): OptionType => ({
  value,
  label,
});
const findOption = (options: OptionType[], value: string): OptionType | null =>
  options.find((o) => o.value === value) ?? null;

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

  const bloodOptions = useMemo<OptionType[]>(
    () => [
      { value: "", label: "ทุกหมู่เลือด" },
      ...bloodTypes.map((g) => toOption(g, g)),
    ],
    [bloodTypes]
  );

  const handleBloodChange = (opt: OptionType | null) => {
    onFilterBloodChange(opt?.value ?? "");
  };

  return (
    <div style={{ flex: "1 1 400px", minWidth: 0 }}>
      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <FormInput
            placeholder="ค้นหากล่อง หรือ unit..."
            value={searchQuery}
            onChange={onSearchChange}
            icon={<Search size={14} />}
            size="sm"
          />
        </div>
        <div style={{ minWidth: 150 }}>
          <SelectDropdown
            placeholder="หมู่เลือด"
            options={bloodOptions}
            value={findOption(bloodOptions, filterBlood)}
            onChange={handleBloodChange}
            isClearable={false}
            isSearchable={false}
          />
        </div>
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
            {searchQuery
              ? "ไม่พบกล่องที่ตรงกับคำค้นหา"
              : "ไม่มีกล่องที่พร้อมนำออก"}
          </div>
        ) : (
          boxes.map((box) => {
            const isSelected = box.id === selectedBoxId;
            return (
              <button
                key={box.id}
                onClick={() => onSelectBox(box.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  background: isSelected
                    ? "var(--group-a-surface, #DBEAFE)"
                    : "var(--surface, #fff)",
                  border: isSelected
                    ? "2px solid var(--primary, #2563EB)"
                    : "1px solid var(--border, #E4E4E7)",
                  borderRadius: "var(--radius-md, 8px)",
                  cursor: "pointer",
                  transition: "border 0.15s",
                  textAlign: "left",
                  fontFamily: "inherit",
                  width: "100%",
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