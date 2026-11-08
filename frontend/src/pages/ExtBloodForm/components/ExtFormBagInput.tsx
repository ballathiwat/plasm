// frontend/src/pages/ExtBloodForm/components/ExtFormBagInput.tsx
import { Plus, X } from "lucide-react";
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
  return (
    <div className="ext-form-section">
      <h3 className="ext-form-section-title">ถุงเลือด ({bags.length})</h3>
      <div className="ext-bag-input-row">
        <input
          type="text"
          className="ext-form-input"
          placeholder="พิมพ์หรือสแกนเลขถุงเลือด..."
          value={bagInput}
          onChange={(e) => setBagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addBag();
            }
          }}
          autoFocus
        />
        <button className="plasm-btn plasm-btn--primary" onClick={addBag}>
          <Plus size={16} /> เพิ่ม
        </button>
      </div>
      {bagError && <p className="ext-bag-error">{bagError}</p>}
      {bags.length > 0 && (
        <div className="ext-bag-chips">
          {bags.map((n) => (
            <span key={n} className="ext-bag-chip-edit">
              {n}
              <button
                className="ext-bag-chip-remove"
                onClick={() => removeBag(n)}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      {bags.length === 0 && (
        <p className="ext-form-hint" style={{ marginTop: 12 }}>
          ยังไม่มีถุงเลือด — พิมพ์หรือสแกนเลขถุงเลือดแล้วกด Enter
        </p>
      )}
    </div>
  );
}
