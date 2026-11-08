// frontend/src/pages/ExtBloodForm/services/useExtForm.ts

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../Routes/AuthProtected";
import { extBloodService } from "./ExtFormService";
import type {
  ExtDocument,
  ExtSource,
  ExtStorage,
  ExtBloodProduct,
  UserSummary,
} from "./ExtFormService";
import type {
  ExtFormData,
  SignState,
  FormStep,
  AttachmentFile,
} from "./ExtFormType";
import apiAdapter from "../../../helpers/http/apiAdapter";
import { EXT_BASE } from "../../../helpers/url_helper";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function useExtForm() {
  const { id: docId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!docId;

  const [existingDoc, setExistingDoc] = useState<ExtDocument | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<FormStep>(1);

  const [sources, setSources] = useState<ExtSource[]>([]);
  const [storages, setStorages] = useState<ExtStorage[]>([]);
  const [bloodProducts, setBloodProducts] = useState<ExtBloodProduct[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);

  const [form, setForm] = useState<ExtFormData>({
    receivedDate: new Date().toISOString().slice(0, 10),
    sourceId: "",
    bloodProductId: "",
    bloodGroup: "",
    boxLabel: "",
    storageId: "",
    bags: [],
    deferApproval: false,
    plasmaType: "",
  });
  const [bagInput, setBagInput] = useState("");
  const [bagError, setBagError] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [signs, setSigns] = useState<SignState[]>([
    { role: "verifier", userId: "", userName: "", status: "unsigned" },
    {
      role: "storer",
      userId: user.id,
      userName: user.name,
      status: "unsigned",
    },
    { role: "approver", userId: "", userName: "", status: "unsigned" },
  ]);

  const [nextLabel, setNextLabel] = useState("");

  // Load master
  useEffect(() => {
    Promise.all([
      extBloodService.getSources(),
      extBloodService.getStorages(),
      extBloodService.getBloodProducts(),
    ]).then(([s, st, b]) => {
      setSources(s.filter((x) => x.active));
      setStorages(st.filter((x) => x.active));
      setBloodProducts(b.filter((x) => x.active));
    });
    import("../../../helpers/http/apiAdapter").then(({ default: api }) => {
      api
        .get<UserSummary[]>("/api/v1/ext/users")
        .then(setUsers)
        .catch(() => {});
    });
  }, []);

  // Load existing
  useEffect(() => {
    if (!docId) return;
    setLoading(true);
    extBloodService
      .getDocument(docId)
      .then((doc) => {
        setExistingDoc(doc);
        setForm({
          receivedDate: doc.receivedDate.slice(0, 10),
          sourceId: doc.source.id,
          bloodProductId: doc.bloodProduct.id,
          bloodGroup: doc.bloodGroup,
          boxLabel: doc.boxLabel,
          storageId: doc.storage.id,
          bags: doc.bags.map((b) => b.bagNumber),
          deferApproval: doc.deferApproval,
          plasmaType: (doc as any).plasmaType || "",
        });
        setAttachments(
          doc.attachments.map((a) => ({
            id: a.id,
            fileName: a.fileName,
            fileSize: a.fileSize,
            fileType: a.fileType,
          })),
        );
        setSigns([
          {
            role: "verifier",
            userId: doc.verifier?.id || "",
            userName: doc.verifier?.name || "",
            status: doc.verifierPin ? "signed" : "unsigned",
            signedAt: doc.verifiedAt || undefined,
          },
          {
            role: "storer",
            userId: doc.storer?.id || user.id,
            userName: doc.storer?.name || user.name,
            status: doc.storerPin ? "signed" : "unsigned",
            signedAt: doc.storedAt || undefined,
          },
          {
            role: "approver",
            userId: doc.approver?.id || "",
            userName: doc.approver?.name || "",
            status: doc.approverPin ? "signed" : "unsigned",
            signedAt: doc.approvedAt || undefined,
          },
        ]);
      })
      .catch((e) => setError(e?.message || "ไม่พบเอกสาร"))
      .finally(() => setLoading(false));
  }, [docId]);

  const setField = useCallback(
    <K extends keyof ExtFormData>(key: K, value: ExtFormData[K]) =>
      setForm((p) => ({ ...p, [key]: value })),
    [],
  );

  const addBag = () => {
    const n = bagInput.trim();
    if (!n) return;
    if (form.bags.includes(n)) {
      setBagError("เลขถุงซ้ำ");
      return;
    }
    setForm((p) => ({ ...p, bags: [...p.bags, n] }));
    setBagInput("");
    setBagError("");
  };
  const removeBag = (num: string) =>
    setForm((p) => ({ ...p, bags: p.bags.filter((b) => b !== num) }));

  const addAttachments = (files: FileList) => {
    const arr = Array.from(files).map((f) => ({
      file: f,
      fileName: f.name,
      fileSize: f.size,
      fileType: f.type,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }));
    setAttachments((p) => [...p, ...arr].slice(0, 10));
  };
  const removeAttachment = (i: number) => {
    setAttachments((p) => {
      const r = p[i];
      if (r.preview) URL.revokeObjectURL(r.preview);
      if (r.id) extBloodService.deleteAttachment(r.id).catch(() => {});
      return p.filter((_, j) => j !== i);
    });
  };

  const handleSign = async (
    role: SignState["role"],
    userId: string,
    pin: string,
  ) => {
    const targetId = docId || existingDoc?.id;
    if (!targetId) return;
    setSigns((p) =>
      p.map((s) => (s.role === role ? { ...s, status: "verifying" } : s)),
    );
    try {
      await extBloodService.sign(targetId, { role, userId, pin });
      setSigns((p) =>
        p.map((s) =>
          s.role === role
            ? {
                ...s,
                status: "signed",
                signedAt: new Date().toISOString(),
                errorMsg: undefined,
              }
            : s,
        ),
      );
    } catch (err: any) {
      setSigns((p) =>
        p.map((s) =>
          s.role === role
            ? {
                ...s,
                status: err?.locked ? "locked" : "error",
                errorMsg: err?.message || "PIN ไม่ถูกต้อง",
                remaining: err?.remaining,
              }
            : s,
        ),
      );
    }
  };
  const handleUnsign = async (role: SignState["role"]) => {
    const targetId = docId || existingDoc?.id;
    if (!targetId) return;
    await extBloodService.unsign(targetId, { role });
    setSigns((p) =>
      p.map((s) =>
        s.role === role ? { ...s, status: "unsigned", signedAt: undefined } : s,
      ),
    );
  };

  const buildFormData = (): FormData => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "bags") (v as string[]).forEach((b) => fd.append("bags[]", b));
      else fd.append(k, String(v));
    });
    attachments
      .filter((a) => a.file)
      .forEach((a) => fd.append("files", a.file!));
    return fd;
  };
  const saveDraft = async () => {
    setSaving(true);
    setError("");
    try {
      const fd = buildFormData();
      fd.append("status", "DRAFT");
      if (isEdit && docId) await extBloodService.updateDocument(docId, fd);
      else await extBloodService.createDocument(fd);
      navigate("/ext-blood");
    } catch (e: any) {
      setError(e?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };
  const saveAndSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const fd = buildFormData();
      fd.append("status", "PENDING");
      if (isEdit && docId) await extBloodService.updateDocument(docId, fd);
      else await extBloodService.createDocument(fd);
      navigate("/ext-blood");
    } catch (e: any) {
      setError(e?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const canSubmit =
    signs.find((s) => s.role === "verifier")?.status === "signed" &&
    signs.find((s) => s.role === "storer")?.status === "signed";

  // --- เพิ่ม useEffect ดึง nextLabel ---
  useEffect(() => {
    const { plasmaType, bloodGroup } = form;
    if (!plasmaType || !bloodGroup) {
      setNextLabel("");
      return;
    }
    // ถ้าเป็นโหมดแก้ไข ใช้ boxLabel เดิม
    if (isEdit && existingDoc) {
      setNextLabel(existingDoc.boxLabel);
      return;
    }
    let alive = true;
    apiAdapter
      .get<{ label: string }>(`${EXT_BASE}/next-box-label`, {
        plasmaType,
        bloodGroup,
      })
      .then((r) => {
        if (alive) setNextLabel(r.label);
      })
      .catch(() => {
        if (alive) setNextLabel("");
      });
    return () => {
      alive = false;
    };
  }, [form.plasmaType, form.bloodGroup, isEdit, existingDoc]);


  return {
    isEdit,
    docId,
    existingDoc,
    loading,
    saving,
    error,
    step,
    setStep,
    form,
    setField,
    bagInput,
    setBagInput,
    addBag,
    removeBag,
    bagError,
    attachments,
    addAttachments,
    removeAttachment,
    signs,
    handleSign,
    handleUnsign,
    sources,
    storages,
    bloodProducts,
    users,
    saveDraft,
    saveAndSubmit,
    canSubmit,
    nextLabel,
  };
}
