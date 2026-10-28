// ============================================================
//  src/pages/log/components/LogFiltersBar.tsx
// ============================================================

import { Filter, RotateCcw } from "lucide-react";
import Button from "../../../components/common/Button";
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
    <div className="plasm-filter">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 40,
          flexShrink: 0,
        }}
      >
        <Filter size={16} color="var(--text-secondary)" />
      </div>{" "}
      <div className="plasm-filter__item">
        <SelectDropdown
          label="การดำเนินการ"
          placeholder="การดำเนินการ"
          options={actionOpts}
          value={findOpt(actionOpts, filters.action)}
          onChange={(opt) => onChange("action", opt?.value ?? "")}
          isClearable={false}
          isSearchable={false}
        />
      </div>
      <div className="plasm-filter__item">
        <SelectDropdown
          label="หมู่เลือด"
          placeholder="หมู่เลือด"
          options={bloodOpts}
          value={findOpt(bloodOpts, filters.blood)}
          onChange={(opt) => onChange("blood", opt?.value ?? "")}
          isClearable={false}
          isSearchable={false}
        />
      </div>
      <div className="plasm-filter__item">
        <DateInput
          label="จาก"
          value={filters.dateFrom}
          onChange={(iso) => onChange("dateFrom", iso)}
          max={filters.dateTo}
        />
      </div>
      <div className="plasm-filter__item">
        <DateInput
          label="ถึง"
          value={filters.dateTo}
          onChange={(iso) => onChange("dateTo", iso)}
          min={filters.dateFrom}
        />
      </div>
      {hasFilter && (
        <Button
          variant="ghost"
          size="md"
          icon={<RotateCcw size={14} />}
          onClick={onReset}
        >
          ล้าง
        </Button>
      )}
    </div>
  );
}
