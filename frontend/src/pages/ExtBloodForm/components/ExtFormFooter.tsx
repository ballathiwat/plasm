// frontend/src/pages/ExtBloodForm/components/ExtFormFooter.tsx
import { ChevronLeft, ChevronRight, Save, Send, Loader2 } from "lucide-react";
import type { FormStep } from "../services/ExtFormType";
import Button from "../../../components/common/Button";
interface Props {
  step: FormStep;
  setStep: (s: FormStep) => void;
  saving: boolean;
  canSubmit: boolean;
  onSaveDraft: () => Promise<void>;
  onSaveAndSubmit: () => Promise<void>;
}
export default function ExtFormFooter({
  step,
  setStep,
  saving,
  canSubmit,
  onSaveDraft,
  onSaveAndSubmit,
}: Props) {
  return (
    <div className="ext-form-footer">
      <div className="ext-form-footer-left">
        {step > 1 && (
          <Button
            variant="secondary"
            icon={<ChevronLeft size={16} />}
            onClick={() => setStep((step - 1) as FormStep)}
            disabled={saving}
          >
            <ChevronLeft size={16} /> ย้อนกลับ
          </Button>
        )}
      </div>
      <div className="ext-form-footer-right">
        {step < 4 && (
          <Button
            variant="secondary"
            iconRight={<ChevronRight size={16} />}
            onClick={() => setStep((step + 1) as FormStep)}
          >
            ถัดไป <ChevronRight size={16} />
          </Button>
        )}
        <Button
          variant="secondary"
          icon={<Save size={16} />}
          onClick={onSaveDraft}
          disabled={saving}
        >
          {saving ? (
            <Loader2 size={16} className="ext-spin" />
          ) : (
            <Save size={16} />
          )}{" "}
          บันทึกร่าง
        </Button>
        {step === 4 && (
          <Button
            variant="primary"
            icon={<Send size={16} />}
            onClick={onSaveAndSubmit}
            disabled={saving || !canSubmit}
          >
            title={canSubmit ? "" : "ต้องลงนามผู้ตรวจ+ผู้จัดเก็บก่อน"}
            {saving ? (
              <Loader2 size={16} className="ext-spin" />
            ) : (
              <Send size={16} />
            )}{" "}
            บันทึกและส่งอนุมัติ
          </Button>
        )}
      </div>
    </div>
  );
}
