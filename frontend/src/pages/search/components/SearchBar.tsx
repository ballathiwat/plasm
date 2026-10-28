// ============================================================
//  src/pages/search/components/SearchBar.tsx
// ============================================================

import { Search, X } from "lucide-react";
import FormInput from "../../../components/common/FormInput";
import Button from "../../../components/common/Button";
interface Props {
  query: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function SearchBar({ query, onChange, onClear }: Props) {
  return (
    <div style={{ position: "relative", maxWidth: 560, marginBottom: 24 }}>
      <FormInput
        placeholder="พิมพ์หมายเลข Unit หรือกล่อง เช่น U001, FFP-A-0001..."
        value={query}
        onChange={onChange}
        icon={<Search size={16} />}
        size="lg"
        autoFocus
      />
      {query && (
        <div
          style={{
            position: "absolute",
            right: 6,
            top: 28,
            transform: "translateY(-50%)",
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            icon={<X size={16} />}
          />
        </div>
      )}
    </div>
  );
}
