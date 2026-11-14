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
} from "../lib/extHelpers";
import { extUpload } from "../lib/extUpload";
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
      status,
      deferApproval,
      editReason,
    } = req.body as Record<string, string | undefined>;

    const resolvedProductId =
      bloodProductId ||
      (req.body.plasmaType
        ? (
            await prisma.extBloodProduct.findFirst({
              where: { code: req.body.plasmaType },
            })
          )?.id
        : undefined);
    // ── parse bags (รองรับทั้ง bags[] และ bags) ──
    const rawBags = req.body["bags[]"] ?? req.body.bags;
    const bags: string[] = rawBags
      ? Array.isArray(rawBags) ? rawBags : [rawBags]
      : [];

    // ── validate required fields (ข้ามเมื่อเป็น DRAFT) ──
    const isDraft = status !== "PENDING";
    if (!isDraft) {
      const missingFields: string[] = [];
      if (!receivedDate?.trim()) missingFields.push("วันที่รับ");
      if (!sourceId?.trim()) missingFields.push("สถานที่ส่งเลือด");
      if (!resolvedProductId?.trim()) missingFields.push("ชนิดเลือด");
      if (!bloodGroup?.trim()) missingFields.push("หมู่เลือด");
      if (!boxLabel?.trim()) missingFields.push("หมายเลขกล่อง");
      if (!storageId?.trim()) missingFields.push("ตำแหน่งจัดเก็บ");

      if (missingFields.length > 0) {
        res.status(400).json({
          message: `กรุณากรอกข้อมูลให้ครบ: ${missingFields.join(", ")}`,
          missingFields,
        });
        return;
      }
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
        sourceId: sourceId ?? "",
        bloodProductId: resolvedProductId ?? "",
        bloodGroup: bloodGroup ?? "",
        boxLabel: boxLabel ?? "",
        storageId: storageId ?? "",
        status: status === "PENDING" ? "PENDING" : "DRAFT",
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
      if (!existing) {
        res.status(404).json({ message: "ไม่พบเอกสาร" });
        return;
      }

      const {
        receivedDate,
        sourceId,
        bloodProductId,
        bloodGroup,
        storageId,
        status,
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
          status: status === "PENDING" ? "PENDING" : existing.status,
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
    });
    if (!doc) {
      res.status(404).json({ message: "ไม่พบเอกสาร" });
      return;
    }
    if (doc.status !== "DRAFT") {
      res.status(400).json({ message: "ลบได้เฉพาะเอกสารร่าง" });
      return;
    }
    await prisma.extDocument.delete({ where: { id: req.params.id } });
    res.json({ message: "ลบเอกสารสำเร็จ" });
  } catch (e) {
    fail(res, e, "DELETE /ext/documents/:id");
  }
});

// ═════════════════════════════════════════════
//  Signing
// ═════════════════════════════════════════════

router.post("/documents/:id/sign", async (req, res) => {
  try {
    const { role, userId, pin } = req.body;
    if (!["verifier", "storer", "approver"].includes(role)) {
      res.status(400).json({ message: "role ไม่ถูกต้อง" });
      return;
    }

    const result = await verifyPin(userId, pin);
    if (!result.ok) {
      res.status(401).json({ message: "PIN ไม่ถูกต้อง", ...result });
      return;
    }

    const data: any = {};
    if (role === "verifier") {
      data.verifierId = userId;
      data.verifiedAt = new Date();
      data.verifierPin = true;
    }
    if (role === "storer") {
      data.storerId = userId;
      data.storedAt = new Date();
      data.storerPin = true;
    }
    if (role === "approver") {
      data.approverId = userId;
      data.approvedAt = new Date();
      data.approverPin = true;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const doc = await prisma.extDocument.update({
      where: { id: req.params.id },
      data: {
        ...data,
        timeline: {
          create: {
            action: "ลงนาม",
            detail: `${role === "verifier" ? "ผู้ตรวจ" : role === "storer" ? "ผู้จัดเก็บ" : "ผู้อนุมัติ"}: ${user?.name}`,
            userId,
          },
        },
      },
      include: extDocInclude,
    });

    res.json(formatExtDoc(doc));
  } catch (e) {
    fail(res, e, "POST /ext/documents/:id/sign");
  }
});

router.post("/documents/:id/unsign", async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user!.id;

    // ── authorization: ต้องเป็นเจ้าของลายเซ็นนั้น หรือ ADMIN ──
    const existing = await prisma.extDocument.findUnique({
      where: { id: req.params.id },
      select: { verifierId: true, storerId: true, approverId: true },
    });
    if (!existing) {
      res.status(404).json({ message: "ไม่พบเอกสาร" });
      return;
    }
    const signerMap: Record<string, string | null> = {
      verifier: existing.verifierId,
      storer: existing.storerId,
      approver: existing.approverId,
    };
    if (req.user!.role !== "ADMIN" && signerMap[role] !== userId) {
      res.status(403).json({ message: "ไม่มีสิทธิ์ยกเลิกลายเซ็นนี้" });
      return;
    }

    const data: any = {};
    if (role === "verifier") {
      data.verifierId = null;
      data.verifiedAt = null;
      data.verifierPin = false;
    }
    if (role === "storer") {
      data.storerId = null;
      data.storedAt = null;
      data.storerPin = false;
    }
    if (role === "approver") {
      data.approverId = null;
      data.approvedAt = null;
      data.approverPin = false;
    }

    const doc = await prisma.extDocument.update({
      where: { id: req.params.id },
      data,
      include: extDocInclude,
    });
    res.json(formatExtDoc(doc));
  } catch (e) {
    fail(res, e, "POST /ext/documents/:id/unsign");
  }
});

// ═════════════════════════════════════════════
//  Approve / Reject
// ═════════════════════════════════════════════

router.post("/documents/:id/approve", async (req, res) => {
  try {
    const result = await verifyPin(req.user!.id, req.body.pin);
    if (!result.ok) {
      res.status(401).json({ message: "PIN ไม่ถูกต้อง", ...result });
      return;
    }

    const doc = await prisma.extDocument.update({
      where: { id: req.params.id },
      data: {
        status: "APPROVED",
        approverId: req.user!.id,
        approvedAt: new Date(),
        approverPin: true,
        timeline: {
          create: {
            action: "อนุมัติ",
            detail: "อนุมัติเอกสาร",
            userId: req.user!.id,
          },
        },
      },
      include: extDocInclude,
    });
    res.json(formatExtDoc(doc));
  } catch (e) {
    fail(res, e, "POST /ext/documents/:id/approve");
  }
});

router.post("/documents/:id/reject", async (req, res) => {
  try {
    const { reason, pin } = req.body;
    const result = await verifyPin(req.user!.id, pin);
    if (!result.ok) {
      res.status(401).json({ message: "PIN ไม่ถูกต้อง", ...result });
      return;
    }

    const doc = await prisma.extDocument.update({
      where: { id: req.params.id },
      data: {
        status: "REJECTED",
        rejectReason: reason,
        timeline: {
          create: {
            action: "ไม่อนุมัติ",
            detail: `ไม่อนุมัติ: ${reason}`,
            userId: req.user!.id,
          },
        },
      },
      include: extDocInclude,
    });
    res.json(formatExtDoc(doc));
  } catch (e) {
    fail(res, e, "POST /ext/documents/:id/reject");
  }
});

// Batch approve / reject
router.post("/documents/batch-approve", async (req, res) => {
  try {
    const { ids, pin } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: "กรุณาเลือกเอกสารอย่างน้อย 1 รายการ" });
      return;
    }
    if (ids.length > 50) {
      res.status(400).json({ message: "เลือกได้สูงสุด 50 รายการต่อครั้ง" });
      return;
    }
    const result = await verifyPin(req.user!.id, pin);
    if (!result.ok) {
      res.status(401).json({ message: "PIN ไม่ถูกต้อง", ...result });
      return;
    }

    const count = await prisma.$transaction(async (tx) => {
      let n = 0;
      for (const id of ids) {
        const updated = await tx.extDocument.updateMany({
          where: { id, status: "PENDING" },
          data: {
            status: "APPROVED",
            approverId: req.user!.id,
            approvedAt: new Date(),
            approverPin: true,
          },
        });
        if (updated.count > 0) {
          await tx.extTimeline.create({
            data: {
              documentId: id,
              action: "อนุมัติ",
              detail: "อนุมัติเอกสาร (batch)",
              userId: req.user!.id,
            },
          });
          n++;
        }
      }
      return n;
    });
    res.json({ count });
  } catch (e) {
    fail(res, e, "POST /ext/documents/batch-approve");
  }
});

router.post("/documents/batch-reject", async (req, res) => {
  try {
    const { ids, reason, pin } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: "กรุณาเลือกเอกสารอย่างน้อย 1 รายการ" });
      return;
    }
    if (ids.length > 50) {
      res.status(400).json({ message: "เลือกได้สูงสุด 50 รายการต่อครั้ง" });
      return;
    }
    const result = await verifyPin(req.user!.id, pin);
    if (!result.ok) {
      res.status(401).json({ message: "PIN ไม่ถูกต้อง", ...result });
      return;
    }

    const count = await prisma.$transaction(async (tx) => {
      let n = 0;
      for (const id of ids) {
        const updated = await tx.extDocument.updateMany({
          where: { id, status: "PENDING" },
          data: { status: "REJECTED", rejectReason: reason },
        });
        if (updated.count > 0) {
          await tx.extTimeline.create({
            data: {
              documentId: id,
              action: "ไม่อนุมัติ",
              detail: `ไม่อนุมัติ (batch): ${reason}`,
              userId: req.user!.id,
            },
          });
          n++;
        }
      }
      return n;
    });
    res.json({ count });
  } catch (e) {
    fail(res, e, "POST /ext/documents/batch-reject");
  }
});

// ═════════════════════════════════════════════
//  Export bags
// ═════════════════════════════════════════════

router.post("/documents/:id/export", async (req, res) => {
  try {
    const { bagIds, reasonId, date, note, pin } = req.body;
    const result = await verifyPin(req.user!.id, pin);
    if (!result.ok) {
      res.status(401).json({ message: "PIN ไม่ถูกต้อง", ...result });
      return;
    }

    await prisma.$transaction(async (tx) => {
      const exp = await tx.extExport.create({
        data: {
          documentId: req.params.id,
          reasonId,
          exportDate: date ? new Date(date) : new Date(),
          note: note || null,
          userId: req.user!.id,
        },
      });

      await tx.extBag.updateMany({
        where: { id: { in: bagIds }, documentId: req.params.id },
        data: { status: "EXPORTED", exportedAt: new Date(), exportId: exp.id },
      });

      // Check if all bags exported → mark document EXPORTED
      const remaining = await tx.extBag.count({
        where: { documentId: req.params.id, status: "IN_STOCK" },
      });
      if (remaining === 0) {
        await tx.extDocument.update({
          where: { id: req.params.id },
          data: { status: "EXPORTED" },
        });
      }

      await tx.extTimeline.create({
        data: {
          documentId: req.params.id,
          action: "นำออก",
          detail: `นำออก ${bagIds.length} ถุง`,
          userId: req.user!.id,
        },
      });
    });

    const doc = await prisma.extDocument.findUnique({
      where: { id: req.params.id },
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

router.delete("/attachments/:id", async (req, res) => {
  try {
    // ── authorization: ต้องเป็นผู้เกี่ยวข้องกับเอกสาร หรือ ADMIN ──
    const att = await prisma.extAttachment.findUnique({
      where: { id: req.params.id },
      include: {
        document: {
          select: { id: true, createdById: true, verifierId: true, storerId: true, approverId: true },
        },
      },
    });
    if (!att) {
      res.status(404).json({ message: "ไม่พบไฟล์แนบ" });
      return;
    }
    const uid = req.user!.id;
    const d = att.document;
    const isRelated =
      req.user!.role === "ADMIN" ||
      [d.createdById, d.verifierId, d.storerId, d.approverId].includes(uid);
    if (!isRelated) {
      res.status(403).json({ message: "ไม่มีสิทธิ์ลบไฟล์แนบนี้" });
      return;
    }

    await prisma.extAttachment.delete({ where: { id: req.params.id } });
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
  model: "extSource" | "extStorage" | "extBloodProduct" | "extExportReason",
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
masterCrud("/blood-products", "extBloodProduct", "code");
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
