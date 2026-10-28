// ============================================================
//  src/pages/log/components/LogFiltersBar.tsx
// ============================================================

import { Filter, RotateCcw } from "lucide-react";
import type { LogFilters } from "../services/LogType";
import useBloodTypes from "../../../helpers/useBloodTypes";
import { useMemo } from "react";
import SelectDropdown, {
  type OptionType,
} from "../../../components/common/SelectDropdown";
import DateInput from "../../../components/common/DateInput";

const findOpt = (opts: OptionType[], v: string) =>
  opts.find((o) => o.value === v) ?? null;

const actionOpts: OptionType[] = [
  { value: "", label: "ทุกการดำเนินการ" },
  { value: "store", label: "จัดเก็บ" },
  { value: "withdraw", label: "นำออก" },
];

interface Props {
  filters: LogFilters;
  onChange: (field: keyof LogFilters, value: string) => void;
  onReset: () => void;
}

export default function LogFiltersBar({ filters, onChange, onReset }: Props) {
  const bloodTypes = useBloodTypes();
  const hasFilter =
    filters.action || filters.blood || filters.dateFrom || filters.dateTo;

  const bloodOpts = useMemo<OptionType[]>(
    () => [
      { value: "", label: "ทุกหมู่เลือด" },
      ...bloodTypes.map((g) => ({ value: g, label: g })),
    ],
    [bloodTypes],
  );

  return (
        <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: '16px 20px',
      marginBottom: 16,
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'flex-end',
      gap: 12,
    }}>
      <Filter size={14} style={{ color: "var(--text-secondary)" }} />

      <SelectDropdown
        placeholder="การดำเนินการ"
        options={actionOpts}
        value={findOpt(actionOpts, filters.action)}
        onChange={(opt) => onChange("action", opt?.value ?? "")}
        isClearable={false}
        isSearchable={false}
      />

      <SelectDropdown
        placeholder="หมู่เลือด"
        options={bloodOpts}
        value={findOpt(bloodOpts, filters.blood)}
        onChange={(opt) => onChange("blood", opt?.value ?? "")}
        isClearable={false}
        isSearchable={false}
      />

      <DateInput
        label="จาก"
        value={filters.dateFrom}
        onChange={(iso) => onChange("dateFrom", iso)}
        max={filters.dateTo}
      />

      <DateInput
        label="ถึง"
        value={filters.dateTo}
        onChange={(iso) => onChange("dateTo", iso)}
        min={filters.dateFrom}
      />

      {hasFilter && (
        <button
          onClick={onReset}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "7px 12px",
            borderRadius: "var(--radius-sm, 6px)",
            border: "1px solid var(--border)",
            background: "transparent",
            fontSize: 12,
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          <RotateCcw size={12} /> ล้าง
        </button>
      )}
    </div>
  );
}
