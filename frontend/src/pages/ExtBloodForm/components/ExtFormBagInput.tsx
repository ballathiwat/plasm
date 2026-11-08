// frontend/src/pages/ExtBloodForm/components/ExtFormBagInput.tsx
import { Plus, X, ScanBarcode } from "lucide-react";
import FormInput from "../../../components/common/FormInput";
import Button from "../../../components/common/Button";

interface Props {
  bags: string[];
  bagInput: string;
  setBagInput: (v: string) => void;
  addBag: () => void;
  removeBag: (n: string) => void;
  bagError: string;
}

export default function ExtFormBagInput({
  bags,
  bagInput,
  setBagInput,
  addBag,
  removeBag,
  bagError,
}: Props) {
  /** กด Enter ใน input → เพิ่มถุง */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBag();
    }
  };

  // จำนวนช่องแสดง = ถุงที่มี + 1 ช่องว่างถัดไป (แต่ขั้นต่ำ 4 ช่อง เพื่อไม่ให้ว่างเกินไป)
  const totalSlots = Math.max(bags.length + 1, 4);

  return (
    <div className="ext-form-section">
      <h3 className="ext-form-section-title">
        <ScanBarcode size={16} style={{ verticalAlign: "-2px", marginRight: 6 }} />
        สแกนถุงเลือด ({bags.length})
      </h3>

      {/* ── Input row ── */}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <FormInput
            label=""
            value={bagInput}
            onChange={setBagInput}
            placeholder={`สแกนถุงที่ ${bags.length + 1} แล้วกด Enter`}
            mono
            icon={<ScanBarcode size={14} />}
            error={bagError}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <div style={{ paddingBottom: bagError ? 22 : 0 }}>
          <Button variant="primary" icon={<Plus size={14} />} onClick={addBag}>
            เพิ่ม
          </Button>
        </div>
      </div>

      {/* ── Bag grid ── */}
      <div style={{ marginTop: 16 }}>
        <div className="bag-grid-head">
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>
            รายการถุงเลือด
          </span>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            {bags.length} ถุง
          </span>
        </div>

        <ol
          className="bag-grid"
          aria-label="ลำดับถุงเลือดที่สแกน"
          style={{ listStyle: "none", margin: 0, padding: 0 }}
        >
          {Array.from({ length: totalSlots }, (_, i) => i + 1).map((n) => {
            const unit = bags[n - 1];
            const isNext = !unit && n === bags.length + 1;

            return (
              <li
                key={n}
                className={`bag${unit ? " bag--filled" : ""}${isNext ? " bag--next" : ""}`}
                style={unit ? { background: "var(--primary-light, var(--primary-surface))" } : undefined}
              >
                <span className="bag__row">
                  <span className="bag__no">ถุงที่ {n}</span>
                  {unit && (
                    <button
                      type="button"
                      className="bag__x"
                      style={{ marginLeft: "auto" }}
                      aria-label={`ลบ ${unit}`}
                      onClick={() => removeBag(unit)}
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
                {unit ? (
                  <span className="bag__unit" style={{ color: "var(--primary)" }}>
                    {unit}
                  </span>
                ) : (
                  <span className="bag__empty">
                    {isNext ? "สแกนถัดไป" : "ว่าง"}
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "8px 0 0" }}>
          พิมพ์หรือสแกนเลขถุงเลือดแล้วกด Enter เพื่อเพิ่ม
        </p>
      </div>
    </div>
  );
}