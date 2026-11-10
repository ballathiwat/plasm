// frontend/src/pages/ExtBloodForm/services/useExtForm.ts

import { useState, useEffect, useCallback, useMemo } from "react";
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
  FormStep,
  AttachmentFile,
  CommitteeDraft,
} from "./ExtFormType";
import type { ExtRoleRules } from "../../ExtBlood/services/ExtBloodType";
import apiAdapter from "../../../helpers/http/apiAdapter";
import { EXT_BASE } from "../../../helpers/url_helper";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function useExtForm() {
  const { id: docId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!docId;

  const [existingDoc, setExistingDoc] = useState<ExtDocument | null>(null);
  const [savedId, setSavedId] = useState<string | null>(docId ?? null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState<"" | "draft" | "submit">("");
  const [error, setError] = useState("");
  const [tried, setTried] = useState(false);
  const [step, setStepRaw] = useState<FormStep>(1);
  const [dirty, setDirty] = useState(false);

  const [sources, setSources] = useState<ExtSource[]>([]);
  const [storages, setStorages] = useState<ExtStorage[]>([]);
  const [bloodProducts, setBloodProducts] = useState<ExtBloodProduct[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [rules, setRules] = useState<ExtRoleRules>({});

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
  const [committee, setCommitteeRaw] = useState<CommitteeDraft[]>([]);
  const [nextLabel, setNextLabel] = useState("");

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
    extBloodService
      .getUsers()
      .then(setUsers)
      .catch(() => {});
    extBloodService
      .getRoleRules()
      .then(setRules)
      .catch(() => {});
  }, []);

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
          plasmaType: (doc as any).plasmaType || doc.bloodProduct.code || "",
        });
        setAttachments(
          doc.attachments.map((a) => ({
            id: a.id,
            fileName: a.fileName,
            fileSize: a.fileSize,
            fileType: a.fileType,
          })),
        );
        setCommitteeRaw(
          (doc.committee ?? []).map((m) => ({
            userId: m.userId,
            userName: m.user.name,
            role: m.role,
          })),
        );
      })
      .catch((e) => setError(e?.message || "ไม่พบเอกสาร"))
      .finally(() => setLoading(false));
  }, [docId]);

  const setField = useCallback(
    <K extends keyof ExtFormData>(key: K, val: ExtFormData[K]) => {
      setForm((p) => {
        const next = { ...p, [key]: val };
        // auto-resolve bloodProductId เมื่อเลือก plasmaType
        if (key === "plasmaType" && typeof val === "string") {
          const found = bloodProducts.find((b) => b.code === val);
          if (found) next.bloodProductId = found.id;
        }
        return next;
      });
      setDirty(true);
    },
    [bloodProducts],
  );
  const setCommittee = (c: CommitteeDraft[]) => {
    setDirty(true);
    setCommitteeRaw(c);
  };

  const addBag = () => {
    const n = bagInput.trim().toUpperCase();
    if (!n) return;
    if (form.bags.includes(n)) {
      setBagError(`${n} ถูกสแกนแล้ว (ถุงที่ ${form.bags.indexOf(n) + 1})`);
      return;
    }
    setDirty(true);
    setForm((p) => ({ ...p, bags: [...p.bags, n] }));
    setBagInput("");
    setBagError("");
  };
  const removeBag = (num: string) => {
    setDirty(true);
    setForm((p) => ({ ...p, bags: p.bags.filter((b) => b !== num) }));
  };

  const addAttachments = (files: FileList) => {
    setDirty(true);
    const arr = Array.from(files).map((f) => ({
      file: f,
      fileName: f.name,
      fileSize: f.size,
      fileType: f.type,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }));
    setAttachments((p) => [...p, ...arr].slice(0, 10));
  };
  const removeAttachment = (i: number) =>
    setAttachments((p) => {
      const r = p[i];
      if (r.preview) URL.revokeObjectURL(r.preview);
      if (r.id) extBloodService.deleteAttachment(r.id).catch(() => {});
      return p.filter((_, j) => j !== i);
    });

  // หมายเลขกล่องอัตโนมัติ
  useEffect(() => {
    const { plasmaType, bloodGroup } = form;
    if (!plasmaType || !bloodGroup) {
      setNextLabel("");
      return;
    }
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

  // ── validation ขั้นที่ 1 ──
  const errors = useMemo(
    () => ({
      sourceId: !form.sourceId ? "เลือกสถานที่ส่งเลือด" : "",
      plasmaType: !form.plasmaType ? "เลือกชนิดพลาสมา" : "",
      bloodGroup: !form.bloodGroup ? "เลือกหมู่เลือด" : "",
      storageId: !form.storageId ? "เลือกตำแหน่งจัดเก็บ" : "",
      bags: form.bags.length === 0 ? "สแกนถุงเลือดอย่างน้อย 1 ถุง" : "",
    }),
    [form],
  );
  const infoLeft = ["sourceId", "plasmaType", "bloodGroup", "storageId"].filter(
    (k) => (errors as any)[k],
  ).length;
  const valid1 = !Object.values(errors).some(Boolean);
  const setStep = (s: FormStep) => {
    if (s === 2 && !valid1) {
      setTried(true);
      return;
    }
    setStepRaw(s);
  };

  // หน้าที่ที่แนะนำตามชนิดเลือด
  const productCode =
    form.plasmaType ||
    bloodProducts.find((b) => b.id === form.bloodProductId)?.code ||
    "";
  const suggestedRoles = rules[productCode] ?? [
    "VERIFIER",
    "STORER",
    "APPROVER",
  ];
  const missingRoles = suggestedRoles.filter(
    (r) => !committee.some((m) => m.role === r),
  );

  const buildFormData = (): FormData => {
    const fd = new FormData();
    const bloodProductId =
      form.bloodProductId ||
      bloodProducts.find((b) => b.code === form.plasmaType)?.id ||
      "";
    const data = {
      ...form,
      bloodProductId,
      boxLabel: form.boxLabel || nextLabel,
    };
    Object.entries(data).forEach(([k, v]) => {
      if (k === "bags") (v as string[]).forEach((b) => fd.append("bags[]", b));
      else if (v !== undefined) fd.append(k, String(v));
    });
    fd.set("status", "DRAFT");
    attachments
      .filter((a) => a.file)
      .forEach((a) => fd.append("files", a.file!));
    return fd;
  };

  /** บันทึกเอกสาร (ร่าง) + รายชื่อคณะกรรมการ → คืน id */
  const persist = async (): Promise<string> => {
    const fd = buildFormData();
    const doc = savedId
      ? await extBloodService.updateDocument(savedId, fd)
      : await extBloodService.createDocument(fd);
    setSavedId(doc.id);
    setAttachments((p) => p.map((a) => ({ ...a, file: undefined })));
    await extBloodService.setCommittee(
      doc.id,
      committee.map((m) => ({ userId: m.userId, role: m.role })),
    );
    return doc.id;
  };

  const saveDraft = async () => {
    setSaving("draft");
    setError("");
    try {
      await persist();
      setDirty(false);
      navigate("/ext-blood", {
        state: {
          toast: {
            type: "success",
            msg: 'บันทึกร่างแล้ว — แก้ไขต่อได้จากแท็บ "ร่าง"',
          },
        },
      });
    } catch (e: any) {
      setError(e?.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving("");
    }
  };

  const submit = async () => {
    if (!valid1) {
      setTried(true);
      setStepRaw(1);
      return;
    }
    if (!committee.length) {
      setError("เพิ่มคณะกรรมการอย่างน้อย 1 คน");
      return;
    }
    setSaving("submit");
    setError("");
    try {
      const id = await persist();
      const doc = await extBloodService.submit(id);
      setDirty(false);
      navigate("/ext-blood", {
        state: {
          toast: {
            type: "success",
            msg: `ส่ง ${doc.docNumber} ให้คณะกรรมการ ${committee.length} คนแล้ว — สถานะ "รออนุมัติ"`,
          },
        },
      });
    } catch (e: any) {
      setError(e?.message || "ส่งไม่สำเร็จ");
    } finally {
      setSaving("");
    }
  };

  return {
    user,
    isEdit,
    docId,
    existingDoc,
    loading,
    saving,
    error,
    tried,
    dirty,
    step,
    setStep,
    valid1,
    errors,
    infoLeft,
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
    committee,
    setCommittee,
    users,
    suggestedRoles,
    missingRoles,
    sources,
    storages,
    bloodProducts,
    nextLabel,
    saveDraft,
    submit,
  };
}
