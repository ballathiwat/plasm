// src/routes/ext.ts — External Blood Receiving (รับเลือดจากภายนอก)

import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { adminOnly } from "../middleware/auth";
import { hashPin, verifyPin } from "../lib/extPin";
import {
  nextExtDocNumber,
  extDocInclude,
  formatExtDoc,
  isExtEditable,
  canAddPostApprovalImage,
} from "../lib/extHelpers";
import {
  extUpload,
  extImageUpload,
  isRealImageFile,
  discardUploadedFiles,
  removeAttachmentFiles,
  EXT_IMAGE_ONLY_MESSAGE,
  EXT_MAX_FILES,
} from "../lib/extUpload";
import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

const router = Router();
const fail = (res: any, e: unknown, tag: string) => {
  console.error(tag, e);
  // Prisma unique constraint violation (P2002)
  if (
    typeof e === "object" && e !== null && "code" in e &&
    (e as any).code === "P2002"
  ) {
    res.status(409).json({ message: "เลขถุงเลือดซ้ำในระบบ (DB constraint)" });
    return;
  }
  res.status(500).json({ message: "เกิดข้อผิดพลาด" });
};

// ═════════════════════════════════════════════
//  Documents CRUD
// ═════════════════════════════════════════════

// GET /documents — list with pagination + filter
router.get("/documents", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (req.query.status) where.status = String(req.query.status);
    if (req.query.sourceId) where.sourceId = String(req.query.sourceId);
    if (req.query.bloodProductId)
      where.bloodProductId = String(req.query.bloodProductId);
    if (req.query.bloodGroup) where.bloodGroup = String(req.query.bloodGroup);
    if (req.query.dateFrom || req.query.dateTo) {
      where.receivedDate = {};
      if (req.query.dateFrom)
        where.receivedDate.gte = new Date(String(req.query.dateFrom));
      if (req.query.dateTo)
        where.receivedDate.lte = new Date(String(req.query.dateTo));
    }
    if (req.query.search) {
      const s = String(req.query.search);
      where.OR = [
        { docNumber: { contains: s, mode: "insensitive" } },
        { bags: { some: { bagNumber: { contains: s, mode: "insensitive" } } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.extDocument.findMany({
        where,
        skip,
        take: limit,
        include: extDocInclude,
        orderBy: { createdAt: "desc" },
      }),
      prisma.extDocument.count({ where }),
    ]);

    res.json({
      data: data.map(formatExtDoc),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    fail(res, e, "GET /ext/documents");
  }
});

// ===== GET /api/v1/ext/next-box-label?plasmaType=&bloodGroup= =====
router.get("/next-box-label", async (req, res) => {
  try {
    const plasmaType = String(req.query.plasmaType ?? "").trim();
    const bloodGroup = String(req.query.bloodGroup ?? "").trim();

    if (!plasmaType || !bloodGroup) {
      res.status(400).json({ message: "กรุณาระบุชนิดพลาสมาและหมู่เลือด" });
      return;
    }

    // --- auto-generate boxLabel ---
    const year = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }),
    ).getFullYear();

    const maxDoc = await prisma.extDocument.findFirst({
      where: {
        boxLabel: { startsWith: `EX_${plasmaType}_${bloodGroup}_${year}_` },
      },
      orderBy: { boxLabel: "desc" },
      select: { boxLabel: true },
    });
    const maxNo = maxDoc
      ? parseInt(maxDoc.boxLabel.split("_").pop() ?? "0", 10) || 0
      : 0;
    const label = `EX_${plasmaType}_${bloodGroup}_${year}_${String(maxNo + 1).padStart(5, "0")}`;

    res.json({ label, year });
  } catch (e) {
    console.error("GET /ext/next-box-label error:", e);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// GET /bags/check?bagNumber=XXX — เช็คเลขถุงซ้ำในระบบ
router.get("/bags/check", async (req, res) => {
  try {
    const bagNumber = String(req.query.bagNumber ?? "")
      .trim()
      .toUpperCase();
    if (!bagNumber) {
      res.status(400).json({ message: "กรุณาระบุเลขถุงเลือด" });
      return;
    }
    const excludeDocId = req.query.excludeDocId
      ? String(req.query.excludeDocId)
      : undefined;

    const existing = await prisma.extBag.findFirst({
      where: {
        bagNumber,
        ...(excludeDocId ? { documentId: { not: excludeDocId } } : {}),
      },
      include: { document: { select: { docNumber: true, boxLabel: true } } },
    });

    if (existing) {
      res.json({
        exists: true,
        bagNumber,
        docNumber: existing.document.docNumber,
        boxLabel: existing.document.boxLabel,
      });
    } else {
      res.json({ exists: false, bagNumber });
    }
  } catch (e) {
    fail(res, e, "GET /ext/bags/check");
  }
});

// GET /documents/:id
router.get("/documents/:id", async (req, res) => {
  try {
    const doc = await prisma.extDocument.findUnique({
      where: { id: req.params.id },
      include: extDocInclude,
    });
    if (!doc) {
      res.status(404).json({ message: "ไม่พบเอกสาร" });
      return;
    }
    res.json(formatExtDoc(doc));
  } catch (e) {
    fail(res, e, "GET /ext/documents/:id");
  }
});

// POST /documents — create
router.post("/documents", extUpload.array("files", 10), async (req, res) => {
  try {
    const {
      receivedDate,
      sourceId,
      bloodProductId,
      bloodGroup,
      boxLabel,
      storageId,
      deferApproval,
      editReason,
    } = req.body as Record<string, string | undefined>;

    const resolvedProductId =
      bloodProductId ||
      (req.body.plasmaType
        ? (
            await prisma.masterPlasmaType.findFirst({
              where: { code: req.body.plasmaType },
            })
          )?.id
        : undefined);
    // ── parse bags (รองรับทั้ง bags[] และ bags) ──
    const rawBags = req.body["bags[]"] ?? req.body.bags;
    const bags: string[] = rawBags
      ? Array.isArray(rawBags) ? rawBags : [rawBags]
      : [];

    // ── validate required fields ──
    // เอกสารสร้างเป็น DRAFT เสมอ — FK fields ต้องมีค่า เพราะ Prisma relation บังคับ
    const missingFields: string[] = [];

    // FK fields — ต้องมีค่าเสมอ ไม่งั้น Prisma จะ error
    if (!sourceId?.trim()) missingFields.push("สถานที่ส่งเลือด");
    if (!resolvedProductId?.trim()) missingFields.push("ชนิดเลือด");
    if (!storageId?.trim()) missingFields.push("ตำแหน่งจัดเก็บ");

    if (missingFields.length > 0) {
      res.status(400).json({
        message: `กรุณากรอกข้อมูลให้ครบ: ${missingFields.join(", ")}`,
        missingFields,
      });
      return;
    }

    // ── เช็คเลขถุงซ้ำภายในรายการเดียวกัน ──
    if (bags.length > 0) {
      const uniqueBags = [...new Set(bags)];
      if (uniqueBags.length !== bags.length) {
        const dupesInArray = bags.filter((b, i) => bags.indexOf(b) !== i);
        res.status(400).json({
          message: `เลขถุงซ้ำกันในรายการ: ${[...new Set(dupesInArray)].join(", ")}`,
        });
        return;
      }
    }

    // ── เช็คเลขถุงซ้ำในระบบ ──
    if (bags.length > 0) {
      const dupes = await prisma.extBag.findMany({
        where: { bagNumber: { in: bags } },
        include: { document: { select: { docNumber: true } } },
      });
      if (dupes.length > 0) {
        const list = dupes
          .map((d) => d.bagNumber + " (อยู่ใน " + d.document.docNumber + ")")
          .join(", ");
        res.status(409).json({ message: "เลขถุงเลือดซ้ำในระบบ: " + list });
        return;
      }
    }

    const docNumber = await nextExtDocNumber();
    const files = (req.files as Express.Multer.File[]) || [];

    const doc = await prisma.extDocument.create({
      data: {
        docNumber,
        receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
        sourceId: sourceId as string,
        bloodProductId: resolvedProductId as string,
        bloodGroup: bloodGroup as string,
        boxLabel: boxLabel as string,
        storageId: storageId as string,
        status: "DRAFT", // ส่งอนุมัติได้ผ่าน POST /documents/:id/submit เท่านั้น
        deferApproval: deferApproval === "true",
        editReason: editReason || null,
        createdById: req.user!.id,
        bags: { create: bags.map((n) => ({ bagNumber: n })) },
        attachments: {
          create: files.map((f) => ({
            fileName: Buffer.from(f.originalname, "latin1").toString("utf8"),
            fileType: f.mimetype,
            fileSize: f.size,
            filePath: `uploads/ext/${f.filename}`,
            uploadedById: req.user!.id,
          })),
        },
        timeline: {
          create: {
            action: "สร้าง",
            detail: `สร้างเอกสาร ${docNumber} (${bags.length} ถุง)`,
            userId: req.user!.id,
          },
        },
      },
      include: extDocInclude,
    });

    res.status(201).json(formatExtDoc(doc));
  } catch (e) {
    fail(res, e, "POST /ext/documents");
  }
});

// PUT /documents/:id — update
router.post(
  "/documents/:id",
  extUpload.array("files", 10),
  async (req, res) => {
    try {
      const existing = await prisma.extDocument.findUnique({
        where: { id: req.params.id as string },
        include: { bags: true },
      });
      const uploaded = req.files as Express.Multer.File[] | undefined;
      if (!existing) {
        discardUploadedFiles(uploaded);
        res.status(404).json({ message: "ไม่พบเอกสาร" });
        return;
      }
      // ── ล็อก: แก้ไขได้เฉพาะเอกสารร่าง / ถูกส่งกลับแก้ไข และเฉพาะผู้สร้างหรือ ADMIN ──
      if (!isExtEditable(existing.status)) {
        discardUploadedFiles(uploaded);
        res.status(409).json({
          message: "แก้ไขได้เฉพาะเอกสารร่างหรือที่ถูกส่งกลับแก้ไข",
        });
        return;
      }
      if (
        existing.createdById !== req.user!.id &&
        req.user!.role !== "ADMIN"
      ) {
        discardUploadedFiles(uploaded);
        res.status(403).json({ message: "แก้ไขได้เฉพาะผู้สร้างเอกสาร" });
        return;
      }

      const {
        receivedDate,
        sourceId,
        bloodProductId,
        bloodGroup,
        storageId,
        deferApproval,
        editReason,
      } = req.body as Record<string, string | undefined>;
      // ── parse bags (รองรับทั้ง bags[] และ bags) ──
      const rawBags = req.body["bags[]"] ?? req.body.bags;
      const bags: string[] = rawBags
        ? Array.isArray(rawBags) ? rawBags : [rawBags]
        : [];
      const files = (req.files as Express.Multer.File[]) || [];

      // ── เช็คเลขถุงซ้ำภายในรายการเดียวกัน ──
      if (bags.length > 0) {
        const uniqueBags = [...new Set(bags)];
        if (uniqueBags.length !== bags.length) {
          const dupesInArray = bags.filter((b, i) => bags.indexOf(b) !== i);
          res.status(400).json({
            message: `เลขถุงซ้ำกันในรายการ: ${[...new Set(dupesInArray)].join(", ")}`,
          });
          return;
        }
      }

      // ── เช็คเลขถุงซ้ำในระบบ (ไม่นับเอกสารตัวเอง) ──
      if (bags.length > 0) {
        const dupes = await prisma.extBag.findMany({
          where: { bagNumber: { in: bags }, documentId: { not: existing.id } },
          include: { document: { select: { docNumber: true } } },
        });
        if (dupes.length > 0) {
          const list = dupes
            .map((d) => d.bagNumber + " (อยู่ใน " + d.document.docNumber + ")")
            .join(", ");
          res.status(409).json({ message: "เลขถุงเลือดซ้ำในระบบ: " + list });
          return;
        }
      }

      // Delete old bags and recreate
      await prisma.extBag.deleteMany({
        where: { documentId: existing.id, status: "IN_STOCK" },
      });

      const doc = await prisma.extDocument.update({
        where: { id: req.params.id as string },
        data: {
          receivedDate: receivedDate ? new Date(receivedDate) : undefined,
          sourceId,
          bloodProductId,
          bloodGroup,
          storageId,
          status: existing.status, // ไม่เปลี่ยนสถานะที่นี่ — ส่งอนุมัติผ่าน /submit เท่านั้น
          deferApproval: deferApproval === "true",
          editReason: editReason || null,
          bags: { create: bags.map((n) => ({ bagNumber: n })) },
          attachments:
            files.length > 0
              ? {
                  create: files.map((f) => ({
                    fileName: Buffer.from(f.originalname, "latin1").toString(
                      "utf8",
                    ),
                    fileType: f.mimetype,
                    fileSize: f.size,
                    filePath: `uploads/ext/${f.filename}`,
                    uploadedById: req.user!.id,
                  })),
                }
              : undefined,
          timeline: {
            create: {
              action: "แก้ไข",
              detail: `แก้ไขเอกสาร${editReason ? ` — ${editReason}` : ""}`,
              userId: req.user!.id,
            },
          },
        },
        include: extDocInclude,
      });

      res.json(formatExtDoc(doc));
    } catch (e) {
      fail(res, e, "PUT /ext/documents/:id");
    }
  },
);

// DELETE /documents/:id
router.delete("/documents/:id", async (req, res) => {
  try {
    const doc = await prisma.extDocument.findUnique({
      where: { id: req.params.id },
      include: { attachments: { select: { filePath: true } } },
    });
    if (!doc) {
      res.status(404).json({ message: "ไม่พบเอกสาร" });
      return;
    }
    if (doc.status !== "DRAFT") {
      res.status(400).json({ message: "ลบได้เฉพาะเอกสารร่าง" });
      return;
    }
    // ── สิทธิ์: ลบได้เฉพาะผู้สร้างเอกสารหรือ ADMIN ──
    if (doc.createdById !== req.user!.id && req.user!.role !== "ADMIN") {
      res.status(403).json({ message: "ลบได้เฉพาะผู้สร้างเอกสาร" });
      return;
    }
    await prisma.extDocument.delete({ where: { id: req.params.id } });
    // ไฟล์แนบของเอกสารถูกลบ record ไปด้วย (cascade) → ลบไฟล์จริงออกจากดิสก์ด้วย
    await removeAttachmentFiles(doc.attachments.map((a) => a.filePath));
    res.json({ message: "ลบเอกสารสำเร็จ" });
  } catch (e) {
    fail(res, e, "DELETE /ext/documents/:id");
  }
});

// หมายเหตุ: endpoint อนุมัติแบบเดิม (sign / unsign / approve / reject / batch-approve / batch-reject)
// ถูกลบแล้ว — การอนุมัติทั้งหมดต้องผ่านคณะกรรมการใน routes/extCommittee.ts เท่านั้น

// ═════════════════════════════════════════════
//  Export bags
// ═════════════════════════════════════════════

const EXPORT_MAX_BAGS = 500;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

router.post("/documents/:id/export", async (req, res) => {
  try {
    const id = String(req.params.id);
    const body = (req.body ?? {}) as Record<string, unknown>;

    // ── validate input ──
    const rawIds = body.bagIds;
    if (
      !Array.isArray(rawIds) ||
      rawIds.length === 0 ||
      rawIds.length > EXPORT_MAX_BAGS ||
      !rawIds.every((x) => typeof x === "string" && x.length > 0)
    ) {
      res.status(400).json({
        message: `กรุณาเลือกถุงเลือดอย่างน้อย 1 ถุง (สูงสุด ${EXPORT_MAX_BAGS} ถุงต่อครั้ง)`,
      });
      return;
    }
    const bagIds = [...new Set(rawIds as string[])];
    const reasonId = typeof body.reasonId === "string" ? body.reasonId : "";
    if (!reasonId) {
      res.status(400).json({ message: "กรุณาเลือกเหตุผลการนำออก" });
      return;
    }
    const dateStr = typeof body.date === "string" ? body.date.slice(0, 10) : "";
    if (dateStr && (!ISO_DATE.test(dateStr) || isNaN(new Date(dateStr).getTime()))) {
      res.status(400).json({ message: "รูปแบบวันที่นำออกไม่ถูกต้อง" });
      return;
    }
    const exportDate = dateStr ? new Date(dateStr) : new Date();
    const note = typeof body.note === "string" && body.note.trim() ? body.note.trim() : null;

    // ── ตรวจเอกสารและเหตุผลก่อนตรวจ PIN (คำขอที่ผิดไม่ควรนับเป็น PIN ผิด) ──
    const [docBefore, reason] = await Promise.all([
      prisma.extDocument.findUnique({ where: { id }, select: { status: true } }),
      prisma.extExportReason.findUnique({ where: { id: reasonId }, select: { id: true } }),
    ]);
    if (!docBefore) {
      res.status(404).json({ message: "ไม่พบเอกสาร" });
      return;
    }
    if (docBefore.status !== "APPROVED") {
      res.status(409).json({ message: "นำออกได้เฉพาะเอกสารที่อนุมัติแล้ว" });
      return;
    }
    if (!reason) {
      res.status(400).json({ message: "ไม่พบเหตุผลการนำออก" });
      return;
    }

    const result = await verifyPin(req.user!.id, String(body.pin ?? ""));
    if (!result.ok) {
      res.status(401).json({ message: "PIN ไม่ถูกต้อง", ...result });
      return;
    }

    const outcome = await prisma.$transaction(async (tx) => {
      // ตรวจซ้ำใน transaction — กันการนำออกซ้อนกัน
      const current = await tx.extDocument.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!current || current.status !== "APPROVED") return "NOT_APPROVED" as const;
      const available = await tx.extBag.count({
        where: { id: { in: bagIds }, documentId: id, status: "IN_STOCK" },
      });
      if (available !== bagIds.length) return "BAD_BAGS" as const;

      const exp = await tx.extExport.create({
        data: { documentId: id, reasonId, exportDate, note, userId: req.user!.id },
      });

      await tx.extBag.updateMany({
        where: { id: { in: bagIds }, documentId: id, status: "IN_STOCK" },
        data: { status: "EXPORTED", exportedAt: new Date(), exportId: exp.id },
      });

      // Check if all bags exported → mark document EXPORTED
      const remaining = await tx.extBag.count({
        where: { documentId: id, status: "IN_STOCK" },
      });
      if (remaining === 0) {
        await tx.extDocument.update({
          where: { id },
          data: { status: "EXPORTED" },
        });
      }

      await tx.extTimeline.create({
        data: {
          documentId: id,
          action: "นำออก",
          detail: `นำออก ${bagIds.length} ถุง`,
          userId: req.user!.id,
        },
      });
      return "OK" as const;
    });
    if (outcome === "NOT_APPROVED") {
      res.status(409).json({ message: "นำออกได้เฉพาะเอกสารที่อนุมัติแล้ว" });
      return;
    }
    if (outcome === "BAD_BAGS") {
      res.status(409).json({
        message: "มีถุงเลือดที่ไม่อยู่ในเอกสารนี้หรือถูกนำออกไปแล้ว — กรุณาโหลดหน้าใหม่แล้วเลือกอีกครั้ง",
      });
      return;
    }

    const doc = await prisma.extDocument.findUnique({
      where: { id },
      include: extDocInclude,
    });
    res.json(formatExtDoc(doc));
  } catch (e) {
    fail(res, e, "POST /ext/documents/:id/export");
  }
});

// ═════════════════════════════════════════════
//  Attachments
// ═════════════════════════════════════════════

// GET /attachments/:id/file — เปิดไฟล์แนบ (เฉพาะผู้เกี่ยวข้อง)
const UPLOAD_ROOT = path.resolve(__dirname, "../../uploads/ext");
const INLINE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

router.get("/attachments/:id/file", async (req, res) => {
  try {
    const att = await prisma.extAttachment.findUnique({
      where: { id: req.params.id },
      include: {
        document: {
          select: {
            id: true,
            createdById: true,
            verifierId: true,
            storerId: true,
            approverId: true,
          },
        },
      },
    });
    if (!att) {
      res.status(404).json({ message: "ไม่พบไฟล์แนบ" });
      return;
    }
    const uid = req.user!.id;
    const d = att.document;
    const related =
      req.user!.role === "ADMIN" ||
      [d.createdById, d.verifierId, d.storerId, d.approverId].includes(uid) ||
      (await prisma.extCommittee.count({
        where: { documentId: d.id, userId: uid },
      })) > 0;
    if (!related) {
      res
        .status(403)
        .json({
          message:
            "คุณไม่มีสิทธิ์เปิดไฟล์นี้ — เปิดได้เฉพาะผู้บันทึก คณะกรรมการ และผู้ดูแลระบบ",
        });
      return;
    }
    const abs = path.resolve(UPLOAD_ROOT, path.basename(att.filePath));
    if (!abs.startsWith(UPLOAD_ROOT + path.sep) || !fs.existsSync(abs)) {
      res.status(404).json({ message: "ไม่พบไฟล์ในระบบ" });
      return;
    }

    const detail = `เปิดไฟล์ ${att.fileName}`;
    const seen = await prisma.extTimeline.findFirst({
      where: {
        documentId: d.id,
        userId: uid,
        action: "เปิดไฟล์",
        detail,
        createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
      },
      select: { id: true },
    });
    if (!seen)
      await prisma.extTimeline.create({
        data: { documentId: d.id, userId: uid, action: "เปิดไฟล์", detail },
      });

    const inline = INLINE_TYPES.has(att.fileType);
    res.setHeader(
      "Content-Type",
      inline ? att.fileType : "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(att.fileName)}`,
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");
    fs.createReadStream(abs)
      .on("error", (e) => fail(res, e, "GET /ext/attachments/:id/file stream"))
      .pipe(res);
  } catch (e) {
    fail(res, e, "GET /ext/attachments/:id/file");
  }
});

// ── POST /documents/:id/attachments — เพิ่มรูปหลังอนุมัติ (เฉพาะสถานะ APPROVED) ──
// ลำดับ: ตรวจสิทธิ์/สถานะ → รับไฟล์ → ตรวจไฟล์ → บันทึก (ไม่แตะ status และฟิลด์อื่นของเอกสาร)
const guardPostApprovalUpload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const doc = await prisma.extDocument.findUnique({
      where: { id: String(req.params.id) },
      select: {
        id: true,
        status: true,
        createdById: true,
        verifierId: true,
        storerId: true,
        approverId: true,
      },
    });
    if (!doc) {
      res.status(404).json({ message: "ไม่พบเอกสาร" });
      return;
    }
    if (doc.status !== "APPROVED") {
      res.status(409).json({
        message: "เพิ่มรูปได้เฉพาะเอกสารที่อนุมัติแล้ว",
      });
      return;
    }
    if (!(await canAddPostApprovalImage(doc, req.user!))) {
      res.status(403).json({
        message:
          "คุณไม่มีสิทธิ์เพิ่มรูปในเอกสารนี้ — เพิ่มได้เฉพาะผู้บันทึก คณะกรรมการ และผู้ดูแลระบบ",
      });
      return;
    }
    next();
  } catch (e) {
    fail(res, e, "POST /ext/documents/:id/attachments guard");
  }
};

const receivePostApprovalImages = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  extImageUpload.array("files", EXT_MAX_FILES)(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    discardUploadedFiles(req.files as Express.Multer.File[] | undefined);
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "ไฟล์ใหญ่เกิน 10 MB"
          : err.code === "LIMIT_FILE_COUNT" ||
              err.code === "LIMIT_UNEXPECTED_FILE"
            ? `อัปโหลดได้สูงสุด ${EXT_MAX_FILES} รูปต่อครั้ง`
            : "อัปโหลดไฟล์ไม่สำเร็จ";
      res.status(400).json({ message });
      return;
    }
    if (err instanceof Error && err.message === EXT_IMAGE_ONLY_MESSAGE) {
      res.status(400).json({ message: EXT_IMAGE_ONLY_MESSAGE });
      return;
    }
    fail(res, err, "POST /ext/documents/:id/attachments upload");
  });
};

router.post(
  "/documents/:id/attachments",
  guardPostApprovalUpload,
  receivePostApprovalImages,
  async (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    try {
      const id = String(req.params.id);
      if (files.length === 0) {
        res.status(400).json({ message: "กรุณาเลือกรูปอย่างน้อย 1 รูป" });
        return;
      }
      if (!files.every((f) => isRealImageFile(f.path))) {
        discardUploadedFiles(files);
        res.status(400).json({ message: EXT_IMAGE_ONLY_MESSAGE });
        return;
      }

      const names = files.map((f) =>
        Buffer.from(f.originalname, "latin1").toString("utf8"),
      );
      const saved = await prisma.$transaction(async (tx) => {
        // ตรวจสถานะซ้ำใน transaction — กันกรณีเอกสารถูกนำออกครบระหว่างอัปโหลด
        const current = await tx.extDocument.findUnique({
          where: { id },
          select: { status: true },
        });
        if (!current || current.status !== "APPROVED") return false;
        await tx.extAttachment.createMany({
          data: files.map((f, i) => ({
            documentId: id,
            fileName: names[i],
            fileType: f.mimetype,
            fileSize: f.size,
            filePath: `uploads/ext/${f.filename}`,
            isPostApproval: true,
            uploadedById: req.user!.id,
          })),
        });
        await tx.extTimeline.create({
          data: {
            documentId: id,
            userId: req.user!.id,
            action: "เพิ่มรูปหลังอนุมัติ",
            detail: `เพิ่มรูป ${files.length} ไฟล์: ${names.join(", ")}`,
          },
        });
        return true;
      });
      if (!saved) {
        discardUploadedFiles(files);
        res.status(409).json({
          message: "เพิ่มรูปได้เฉพาะเอกสารที่อนุมัติแล้ว",
        });
        return;
      }

      const doc = await prisma.extDocument.findUnique({
        where: { id },
        include: extDocInclude,
      });
      res.status(201).json(formatExtDoc(doc));
    } catch (e) {
      discardUploadedFiles(files);
      fail(res, e, "POST /ext/documents/:id/attachments");
    }
  },
);

router.delete("/attachments/:id", async (req, res) => {
  try {
    // ── authorization: ต้องเป็นผู้เกี่ยวข้องกับเอกสาร หรือ ADMIN ──
    const att = await prisma.extAttachment.findUnique({
      where: { id: req.params.id },
      include: {
        document: {
          select: { id: true, status: true, createdById: true, verifierId: true, storerId: true, approverId: true },
        },
      },
    });
    if (!att) {
      res.status(404).json({ message: "ไม่พบไฟล์แนบ" });
      return;
    }
    const uid = req.user!.id;
    const d = att.document;
    const isAdmin = req.user!.role === "ADMIN";
    // ── ล็อก: หลังส่งอนุมัติแล้วผู้ใช้ทั่วไปลบไฟล์แนบไม่ได้ (รวมรูปที่เพิ่มหลังอนุมัติ)
    //    ข้อยกเว้น: ADMIN ลบได้เมื่อเอกสารเป็น APPROVED เพื่อจัดการรูปที่อัปโหลดผิด ──
    const adminOverride = isAdmin && d.status === "APPROVED";
    if (!isExtEditable(d.status) && !adminOverride) {
      res.status(409).json({
        message: isAdmin
          ? "ผู้ดูแลระบบลบไฟล์แนบได้เฉพาะเอกสารร่าง ที่ถูกส่งกลับแก้ไข หรืออนุมัติแล้ว"
          : "ลบไฟล์แนบได้เฉพาะเอกสารร่างหรือที่ถูกส่งกลับแก้ไข",
      });
      return;
    }
    const isRelated =
      isAdmin ||
      [d.createdById, d.verifierId, d.storerId, d.approverId].includes(uid);
    if (!isRelated) {
      res.status(403).json({ message: "ไม่มีสิทธิ์ลบไฟล์แนบนี้" });
      return;
    }

    // ลบ record + บันทึก timeline ใน transaction เดียว (ไม่แตะ status ของเอกสาร)
    await prisma.$transaction([
      prisma.extAttachment.delete({ where: { id: att.id } }),
      prisma.extTimeline.create({
        data: {
          documentId: d.id,
          userId: uid,
          action: "ลบไฟล์แนบ",
          detail: `ลบ${att.isPostApproval ? "รูปที่เพิ่มหลังอนุมัติ" : "ไฟล์แนบ"} ${att.fileName}${adminOverride ? " (ผู้ดูแลระบบ ลบหลังอนุมัติ)" : ""}`,
        },
      }),
    ]);
    // ลบไฟล์จริงออกจากดิสก์หลัง record ถูกลบแล้ว (ลบไฟล์ไม่ได้ → log ไว้ ไม่ทำให้คำขอล้มเหลว)
    await removeAttachmentFiles([att.filePath]);
    res.json({ message: "ลบไฟล์แนบสำเร็จ" });
  } catch (e) {
    fail(res, e, "DELETE /ext/attachments/:id");
  }
});

// ═════════════════════════════════════════════
//  Summary
// ═════════════════════════════════════════════

router.get("/summary", async (_req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [receivedThisMonth, remaining, pendingApproval, exportedThisMonth] =
      await Promise.all([
        prisma.extDocument.count({
          where: { receivedDate: { gte: monthStart, lte: monthEnd } },
        }),
        prisma.extBag.count({ where: { status: "IN_STOCK" } }),
        prisma.extDocument.count({ where: { status: "PENDING" } }),
        prisma.extBag.count({
          where: {
            status: "EXPORTED",
            exportedAt: { gte: monthStart, lte: monthEnd },
          },
        }),
      ]);

    res.json({
      receivedThisMonth,
      remaining,
      pendingApproval,
      exportedThisMonth,
    });
  } catch (e) {
    fail(res, e, "GET /ext/summary");
  }
});

// ═════════════════════════════════════════════
//  Report
// ═════════════════════════════════════════════

router.get("/report", async (req, res) => {
  try {
    const dateFrom = req.query.dateFrom
      ? new Date(String(req.query.dateFrom))
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const dateTo = req.query.dateTo
      ? new Date(String(req.query.dateTo))
      : new Date();
    const where: any = { receivedDate: { gte: dateFrom, lte: dateTo } };
    if (req.query.sourceId) where.sourceId = String(req.query.sourceId);

    const docs = await prisma.extDocument.findMany({
      where,
      include: { bags: true, bloodProduct: true },
    });

    const totalReceived = docs.length;
    const allBags = docs.flatMap((d) => d.bags);
    const totalExported = allBags.filter((b) => b.status === "EXPORTED").length;
    const remaining = allBags.filter((b) => b.status === "IN_STOCK").length;

    // Avg days to export
    const exportedBags = allBags.filter((b) => b.exportedAt);
    const avgDays =
      exportedBags.length > 0
        ? exportedBags.reduce((sum, b) => {
            const doc = docs.find((d) => d.id === b.documentId)!;
            return (
              sum +
              (b.exportedAt!.getTime() - doc.receivedDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );
          }, 0) / exportedBags.length
        : 0;

    // Matrix: product × blood group
    const matrixMap = new Map<
      string,
      { groups: Record<string, number>; total: number; name?: string }
    >();
    for (const doc of docs) {
      const key = doc.bloodProduct.code;
      if (!matrixMap.has(key))
        matrixMap.set(key, {
          groups: {},
          total: 0,
          name: doc.bloodProduct.name || undefined,
        });
      const entry = matrixMap.get(key)!;
      const bagCount = doc.bags.length;
      entry.groups[doc.bloodGroup] =
        (entry.groups[doc.bloodGroup] || 0) + bagCount;
      entry.total += bagCount;
    }

    res.json({
      kpi: {
        totalReceived,
        totalExported,
        remaining,
        avgDaysToExport: Math.round(avgDays * 10) / 10,
      },
      chart: [], // TODO: monthly chart data
      matrix: Array.from(matrixMap.entries()).map(([code, v]) => ({
        productCode: code,
        productName: v.name,
        groups: v.groups,
        total: v.total,
      })),
    });
  } catch (e) {
    fail(res, e, "GET /ext/report");
  }
});

// ═════════════════════════════════════════════
//  Master data CRUD
// ═════════════════════════════════════════════

function masterCrud(
  path: string,
  model: "extSource" | "extStorage" | "extExportReason",
  nameField = "name",
) {
  const db = (prisma as any)[model];

  router.get(path, async (_req, res) => {
    try {
      res.json(
        await db.findMany({
          orderBy: [{ sort: "asc" }, { [nameField]: "asc" }],
        }),
      );
    } catch (e) {
      fail(res, e, `GET /ext${path}`);
    }
  });

  router.post(path, adminOnly, async (req: any, res: any) => {
    try {
      const name = req.body[nameField]?.toString().trim();
      if (!name) {
        res.status(400).json({ message: "กรุณากรอกชื่อ" });
        return;
      }
      const max = await db.aggregate({ _max: { sort: true } });
      const created = await db.create({
        data: { [nameField]: name, sort: (max._max.sort ?? -1) + 1 },
      });
      res.status(201).json(created);
    } catch (e: any) {
      if (e?.code === "P2002") {
        res.status(409).json({ message: "ชื่อนี้มีอยู่แล้ว" });
        return;
      }
      fail(res, e, `POST /ext${path}`);
    }
  });

  router.put(`${path}/:id`, adminOnly, async (req: any, res: any) => {
    try {
      const data: any = {};
      if (req.body[nameField] !== undefined)
        data[nameField] = req.body[nameField].toString().trim();
      if (req.body.active !== undefined) data.active = Boolean(req.body.active);
      const updated = await db.update({ where: { id: req.params.id }, data });
      res.json(updated);
    } catch (e) {
      fail(res, e, `PUT /ext${path}/:id`);
    }
  });

  router.delete(`${path}/:id`, adminOnly, async (req: any, res: any) => {
    try {
      await db.delete({ where: { id: req.params.id } });
      res.json({ message: "ลบสำเร็จ" });
    } catch (e) {
      fail(res, e, `DELETE /ext${path}/:id`);
    }
  });

  router.patch(`${path}/reorder`, adminOnly, async (req: any, res: any) => {
    try {
      const ids: string[] = req.body.ids;
      for (let i = 0; i < ids.length; i++) {
        await db.update({ where: { id: ids[i] }, data: { sort: i } });
      }
      res.json({ message: "เรียงลำดับสำเร็จ" });
    } catch (e) {
      fail(res, e, `PATCH /ext${path}/reorder`);
    }
  });
}

masterCrud("/sources", "extSource");
masterCrud("/storages", "extStorage");
masterCrud("/export-reasons", "extExportReason");

// ═════════════════════════════════════════════
//  PIN setup / verify
// ═════════════════════════════════════════════

router.get("/pin/status", async (req, res) => {
  try {
    const u = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { pinHash: true, pinLockedUntil: true },
    });
    res.json({ hasPin: !!u?.pinHash, lockedUntil: u?.pinLockedUntil ?? null });
  } catch (e) {
    fail(res, e, "GET /ext/pin/status");
  }
});

router.post("/pin/setup", async (req, res) => {
  try {
    const { password, pin } = req.body;
    if (!password || !pin || pin.length !== 6) {
      res.status(400).json({ message: "กรุณากรอกรหัสผ่านและ PIN 6 หลัก" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ message: "ไม่พบผู้ใช้" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
      return;
    }

    const pinHash = await hashPin(pin);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { pinHash, pinFailCount: 0, pinLockedUntil: null },
    });

    res.json({ message: "ตั้ง PIN สำเร็จ" });
  } catch (e) {
    fail(res, e, "POST /ext/pin/setup");
  }
});

router.post("/pin/verify", async (req, res) => {
  try {
    const result = await verifyPin(req.user!.id, req.body.pin);
    res.json(result);
  } catch (e) {
    fail(res, e, "POST /ext/pin/verify");
  }
});

// ═════════════════════════════════════════════
//  Users list (สำหรับ dropdown ลงนาม — ทุก role เข้าถึงได้)
// ═════════════════════════════════════════════

router.get("/users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true, username: true },
      orderBy: { name: "asc" },
    });
    res.json(users);
  } catch (e) {
    fail(res, e, "GET /ext/users");
  }
});
export default router;
