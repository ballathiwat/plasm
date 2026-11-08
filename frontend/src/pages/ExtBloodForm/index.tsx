// frontend/src/pages/ExtBloodForm/index.tsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import useExtForm from "./services/useExtForm";
import ExtFormStepBar from "./components/ExtFormStepBar";
import ExtFormReceiveInfo from "./components/ExtFormReceiveInfo";
import ExtFormBagInput from "./components/ExtFormBagInput";
import ExtFormAttachments from "./components/ExtFormAttachments";
import ExtFormSigning from "./components/ExtFormSigning";
import ExtFormFooter from "./components/ExtFormFooter";
import "../../assets/styles/ext-blood-form.css";

export default function ExtBloodFormPage() {
  const navigate = useNavigate();
  const h = useExtForm();
  if (h.loading)
    return (
      <div className="ext-form-loading">
        <Loader2 size={32} className="ext-spin" color="var(--primary)" />
      </div>
    );
  return (
    <div
      className="ext-form-page"
      style={{ animation: "plasm-fade-in 0.2s ease" }}
    >
      <div className="ext-form-header">
        <button className="ext-back-btn" onClick={() => navigate("/ext-blood")}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="ext-title">
            {h.isEdit ? "แก้ไขเอกสาร" : "บันทึกรับเลือดจากภายนอก"}
          </h2>
          {h.existingDoc && (
            <p className="ext-subtitle">{h.existingDoc.docNumber}</p>
          )}
        </div>
      </div>
      <ExtFormStepBar step={h.step} onStepClick={h.setStep} />
      {h.error && (
        <div className="ext-form-error" style={{ marginBottom: 16 }}>
          <AlertTriangle size={14} /> {h.error}
        </div>
      )}
      <div className="ext-form-content">
        {h.step === 1 && (
          <ExtFormReceiveInfo
            form={h.form}
            setField={h.setField}
            sources={h.sources}
            storages={h.storages}
            nextLabel={h.nextLabel} 
          />
        )}
        {h.step === 2 && (
          <ExtFormBagInput
            bags={h.form.bags}
            bagInput={h.bagInput}
            setBagInput={h.setBagInput}
            addBag={h.addBag}
            removeBag={h.removeBag}
            bagError={h.bagError}
          />
        )}
        {h.step === 3 && (
          <ExtFormAttachments
            attachments={h.attachments}
            onAdd={h.addAttachments}
            onRemove={h.removeAttachment}
          />
        )}
        {h.step === 4 && (
          <ExtFormSigning
            signs={h.signs}
            users={h.users}
            deferApproval={h.form.deferApproval}
            onDeferChange={(v) => h.setField("deferApproval", v)}
            onSign={h.handleSign}
            onUnsign={h.handleUnsign}
          />
        )}
      </div>
      <ExtFormFooter
        step={h.step}
        setStep={h.setStep}
        saving={h.saving}
        canSubmit={h.canSubmit}
        onSaveDraft={h.saveDraft}
        onSaveAndSubmit={h.saveAndSubmit}
      />
    </div>
  );
}
