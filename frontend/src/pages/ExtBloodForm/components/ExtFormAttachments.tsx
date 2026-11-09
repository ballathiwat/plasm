// frontend/src/pages/ExtBloodForm/components/ExtFormAttachments.tsx
import { useRef } from "react";
import { Upload, X, Paperclip, Image } from "lucide-react";
import type { AttachmentFile } from "../services/ExtFormType";
interface Props {
  attachments: AttachmentFile[];
  onAdd: (f: FileList) => void;
  onRemove: (i: number) => void;
}
const ACCEPT =
  "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export default function ExtFormAttachments({
  attachments,
  onAdd,
  onRemove,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="ext-form-section">
      <div
        className="ext-drop-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) onAdd(e.dataTransfer.files);
        }}
        onClick={() => ref.current?.click()}
      >
        <Upload size={24} color="var(--text-disabled)" />
        <p>ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก</p>
        <p className="ext-form-hint">
          รองรับ รูปภาพ, PDF, Word — สูงสุด 10 ไฟล์, ไฟล์ละ 10 MB
        </p>
        <input
          ref={ref}
          type="file"
          multiple
          accept={ACCEPT}
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files) onAdd(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {attachments.length > 0 && (
        <div className="ext-file-list">
          {attachments.map((a, i) => (
            <div key={i} className="ext-file-item">
              <span className="ext-file-icon">
                {a.fileType.startsWith("image/") ? (
                  <Image size={16} />
                ) : (
                  <Paperclip size={16} />
                )}
              </span>
              <span className="ext-file-name">{a.fileName}</span>
              <span className="ext-file-size">
                {Math.round(a.fileSize / 1024)} KB
              </span>
              <button className="ext-file-remove" onClick={() => onRemove(i)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
