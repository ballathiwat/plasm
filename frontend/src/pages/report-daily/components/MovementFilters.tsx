// frontend/src/pages/report-daily/components/MovementFilters.tsx

import { Search, Info, Check } from "lucide-react";
import DateInput from "../../../components/common/DateInput";
import BloodGroupSelect from "../../../components/common/BloodGroupSelect";
import Button from "../../../components/common/Button";
import { plasmaChartColor } from "../../../helpers/blood";
import { type FilterDraft, type PresetKey } from "../services/DailyReportType";
import type { ValidationError } from "../services/useDailyReport";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "today", label: "วันนี้" },
  { key: "7d", label: "7 วัน" },
  { key: "30d", label: "30 วัน" },
  { key: "this-month", label: "เดือนนี้" },
  { key: "last-month", label: "เดือนก่อน" },
  { key: "this-year", label: "ปีนี้" },
  { key: "last-year", label: "ปีก่อน" },
];

const bkkToday = (): string =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

function TypeToggle({
  code,
  on,
  last,
  onToggle,
}: {
  code: string;
  on: boolean;
  last: boolean;
  onToggle: () => void;
}) {
  const tc = plasmaChartColor(code);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-disabled={last || undefined}
      title={last ? "ต้องเลือกอย่างน้อย 1 ชนิด" : undefined}
      onClick={onToggle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 14px 6px 10px",
        minHeight: 36,
        borderRadius: "var(--radius-full, 99px)",
        fontSize: 13,
        fontWeight: on ? 600 : 500,
        fontFamily: "inherit",
        cursor: last ? "not-allowed" : "pointer",
        transition: "background .15s, border-color .15s",
        border: on
          ? `2px solid ${tc}`
          : "1px dashed var(--border-strong, #A1A1AA)",
        margin: on ? 0 : 1,
        background: on
          ? `color-mix(in srgb, ${tc} 12%, var(--surface, #fff))`
          : "transparent",
        color: on ? tc : "var(--text-secondary, #71717A)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: on ? tc : "var(--surface, #fff)",
          border: on ? "none" : "1.5px solid var(--text-disabled, #A1A1AA)",
        }}
      >
        {on && <Check size={13} strokeWidth={3} color="#fff" />}
      </span>
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          flexShrink: 0,
          background: tc || "var(--text-disabled)",
          opacity: on ? 1 : 0.45,
        }}
      />
      <span
        style={{
          textDecoration: on ? "none" : "line-through",
          textDecorationColor: on ? undefined : "var(--text-disabled, #A1A1AA)",
        }}
      >
        {code}
      </span>
    </button>
  );
}

interface Props {
  draft: FilterDraft;
  masterTypes: string[];
  loading: boolean;
  isDirty: boolean;
  validationError: ValidationError | null;
  onPreset: (k: PresetKey) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onBloodChange: (v: string) => void;
  onToggleType: (code: string) => void;
  onSelectAllTypes: () => void;
  onSearch: () => void;
}

export default function MovementFilters({
  draft,
  masterTypes,
  loading,
  isDirty,
  validationError,
  onPreset,
  onFromChange,
  onToChange,
  onBloodChange,
  onToggleType,
  onSelectAllTypes,
  onSearch,
}: Props) {
  const today = bkkToday();
  const hasError = !!validationError;
  const selCount = draft.types.length,
    allCount = masterTypes.length;

  return (
    <div
      style={{
        background: "var(--surface, #fff)",
        border: "1px solid var(--border, #E4E4E7)",
        borderRadius: "var(--radius-lg, 10px)",
        padding: "16px 20px",
        marginBottom: 16,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Row 1: presets (left) + type toggles (right) */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "10px 24px",
          marginBottom: 12,
        }}
      >
        {/* Presets */}
        <div
          role="group"
          aria-label="ช่วงเวลาที่ใช้บ่อย"
          style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
        >
          {PRESETS.map((p) => {
            const a = draft.preset === p.key;
            return (
              <button
                key={p.key}
                type="button"
                aria-pressed={a}
                onClick={() => onPreset(p.key)}
                style={{
                  minHeight: 36,
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full, 99px)",
                  border: a ? "none" : "1px solid var(--border, #E4E4E7)",
                  background: a
                    ? "var(--primary, #2563EB)"
                    : "var(--surface, #fff)",
                  color: a ? "#fff" : "var(--text-primary, #18181B)",
                  fontWeight: a ? 600 : 400,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        {/* Type toggles */}
        {masterTypes.length > 0 && (
          <div
            role="group"
            aria-label="ชนิด"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginRight: 2,
              }}
            >
              ชนิด
            </span>
            {masterTypes.map((c) => {
              const on = draft.types.includes(c);
              return (
                <TypeToggle
                  key={c}
                  code={c}
                  on={on}
                  last={on && selCount === 1}
                  onToggle={() => onToggleType(c)}
                />
              );
            })}
            <span
              aria-live="polite"
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                marginLeft: 4,
              }}
            >
              {selCount === allCount
                ? "เลือกครบทุกชนิด"
                : `เลือก ${selCount} จาก ${allCount} ชนิด`}
            </span>
            {selCount !== allCount && (
              <button
                type="button"
                onClick={onSelectAllTypes}
                style={{
                  minHeight: 36,
                  padding: "0 4px",
                  border: "none",
                  background: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--primary, #2563EB)",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                เลือกทั้งหมด
              </button>
            )}
          </div>
        )}
      </div>

      {/* Row 2: filter bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 160 }}>
          <DateInput
            label="ตั้งแต่"
            value={draft.from}
            onChange={onFromChange}
            max={today}
          />
        </div>
        <div style={{ minWidth: 160 }}>
          <DateInput
            label="ถึง"
            value={draft.to}
            onChange={onToChange}
            max={today}
            error={
              validationError?.field === "to"
                ? validationError.message
                : undefined
            }
          />
        </div>
        <div style={{ minWidth: 140 }}>
          <BloodGroupSelect
            value={draft.group}
            onChange={(v) => onBloodChange(v || "all")}
            allLabel="ทั้งหมด"
          />
        </div>
        <Button
          variant="primary"
          icon={<Search size={14} />}
          onClick={onSearch}
          disabled={loading || hasError || !draft.from || !draft.to}
          loading={loading}
        >
          ค้นหา
        </Button>
      </div>

      {/* Dirty indicator */}
      {isDirty && !hasError && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 10,
            padding: "8px 12px",
            background: "var(--warning-surface, #FFFBEB)",
            border: "1px solid #FDE68A",
            borderRadius: "var(--radius-md, 8px)",
            fontSize: 13,
            color: "var(--warning-ink, #92400E)",
          }}
        >
          <Info size={14} />
          <span>เปลี่ยนตัวกรองแล้ว — กด &quot;ค้นหา&quot; เพื่อแสดงผลใหม่</span>
        </div>
      )}
    </div>
  );
}
