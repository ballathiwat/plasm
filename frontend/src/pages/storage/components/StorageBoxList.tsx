// ============================================================
//  src/pages/storage/components/StorageBoxList.tsx
// ============================================================

import { useState } from "react";
import { Pencil, Printer, Search, X, Plus, MapPin, Undo2 } from "lucide-react";
import type {
  StorageBoxItem,
  MasterZone,
  UnitRemovalInput,
  UnitRemovalRecord,
  RemovalReasonOption,
} from "../services/StorageType";
import storageService from "../services/StorageService";
import { groupSurface, groupInk } from "../../../helpers/blood";
import { Pagination } from "../../../components/shared";
import type { PaginationInfo } from "../../../components/shared";

interface Props {
  boxes: StorageBoxItem[];
  loading: boolean;
  onPrintBox: (box: StorageBoxItem) => void;
  /** คืน null = สำเร็จ, string = ข้อความ error */
  onEditUnits: (
    boxId: string,
    units: string[],
    removals: UnitRemovalInput[],
  ) => Promise<string | null>;
  onEditLocation: (boxId: string, zoneId: string, shelf: string) => void;
  zones: MasterZone[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function StorageBoxList({
  boxes,
  loading,
  onPrintBox,
  onEditUnits,
  onEditLocation,
  zones,
  pagination,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBox, setEditingBox] = useState<StorageBoxItem | null>(null);
  const [editUnits, setEditUnits] = useState<string[]>([]);
  const [unitInput, setUnitInput] = useState("");
  const [editError, setEditError] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  // unit เดิมที่ถูกลบในรอบแก้ไขนี้ → หมายเหตุที่เลือก
  const [removals, setRemovals] = useState<
    Record<string, { reasonId: string; reasonName: string; detail: string }>
  >({});
  // unit ที่กำลังเลือกหมายเหตุก่อนลบ
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [removeReasonId, setRemoveReasonId] = useState("");
  const [removeDetail, setRemoveDetail] = useState("");
  const [removeHistory, setRemoveHistory] = useState<UnitRemovalRecord[]>([]);
  // ตัวเลือกหมายเหตุ (กำหนดจาก ตั้งค่า > หมายเหตุการลบ)
  const [reasonOptions, setReasonOptions] = useState<RemovalReasonOption[]>([]);

  const openEditUnits = (box: StorageBoxItem) => {
    setEditingBox(box);
    setEditUnits([...box.units]);
    setUnitInput("");
    setEditError("");
    setRemovals({});
    setPendingRemove(null);
    setRemoveReasonId("");
    setRemoveDetail("");
    setRemoveHistory([]);
    storageService
      .listRemovalReasons()
      .then((rs) => setReasonOptions(rs.filter((r) => r.active)))
      .catch(() => setReasonOptions([]));
    storageService
      .getBoxRemovals(box.id)
      .then(setRemoveHistory)
      .catch(() => setRemoveHistory([]));
  };

  const isOriginalUnit = (u: string) => !!editingBox?.units.includes(u);

  // กด X: unit เดิมต้องกรอกหมายเหตุก่อน / unit ที่เพิ่งเพิ่มในรอบนี้ลบได้ทันที
  const requestRemove = (u: string) => {
    setEditError("");
    if (isOriginalUnit(u)) {
      setPendingRemove(u);
      setRemoveReasonId("");
      setRemoveDetail("");
    } else {
      setEditUnits((prev) => prev.filter((x) => x !== u));
    }
  };

  const confirmRemove = () => {
    if (!pendingRemove) return;
    const reason = reasonOptions.find((r) => r.id === removeReasonId);
    if (!reason) {
      setEditError(`กรุณาเลือกหมายเหตุการลบ unit ${pendingRemove}`);
      return;
    }
    const u = pendingRemove;
    setEditUnits((prev) => prev.filter((x) => x !== u));
    setRemovals((prev) => ({
      ...prev,
      [u]: {
        reasonId: reason.id,
        reasonName: reason.name,
        detail: removeDetail.trim(),
      },
    }));
    setPendingRemove(null);
    setRemoveReasonId("");
    setRemoveDetail("");
    setEditError("");
  };

  const undoRemove = (u: string) => {
    setRemovals((prev) => {
      const next = { ...prev };
      delete next[u];
      return next;
    });
    setEditUnits((prev) => (prev.includes(u) ? prev : [...prev, u]));
  };
  const [locBox, setLocBox] = useState<StorageBoxItem | null>(null);
  const [locZoneId, setLocZoneId] = useState("");
  const [locShelf, setLocShelf] = useState("");

  const filtered = boxes.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.boxLabel.toLowerCase().includes(q) ||
      b.blood.toLowerCase().includes(q) ||
      b.shelf.toLowerCase().includes(q) ||
      b.units.some((u) => u.toLowerCase().includes(q))
    );
  });

  // ── เพิ่ม unit ในหน้าแก้ไข: ตัวพิมพ์ใหญ่อัตโนมัติ + ตรวจซ้ำ ──
  const handleEditAdd = async () => {
    if (!editingBox || editBusy) return;
    const raw = unitInput.trim().toUpperCase();
    if (!raw) return;

    const inputs = raw
      .split(/[,\s\n]+/)
      .map((u) => u.trim())
      .filter(Boolean);
    const original = editingBox.units;
    const findOriginal = (u: string) =>
      original.find((o) => o.toUpperCase() === u);
    const added: string[] = [];
    const dupes: string[] = [];

    setEditBusy(true);
    try {
      for (const u of inputs) {
        // ซ้ำในรายการที่กำลังแก้ไข
        if (
          editUnits.some((x) => x.toUpperCase() === u) ||
          added.includes(u)
        ) {
          dupes.push(u);
          continue;
        }
        // เคยอยู่ในกล่องนี้แล้วถูกลบออกในหน้านี้ → เพิ่มกลับได้
        const orig = findOriginal(u);
        if (orig) {
          added.push(orig);
          continue;
        }
        // ตรวจกับฐานข้อมูล (รวม unit ที่นำออกแล้ว)
        const res = await storageService.checkUnit(u);
        if (res.exists) {
          dupes.push(
            res.status === "withdrawn"
              ? `${u} (นำออกแล้ว — กล่อง ${res.boxLabel})`
              : `${u} (อยู่ในกล่อง ${res.boxLabel})`,
          );
        } else {
          added.push(u);
        }
      }
    } catch (err: any) {
      setEditError(err?.message || "ตรวจสอบ unit ไม่สำเร็จ");
      setEditBusy(false);
      return;
    }
    setEditBusy(false);

    if (added.length > 0) {
      setEditUnits((prev) => [...prev, ...added]);
      // เพิ่ม unit เดิมกลับเข้ามา → ยกเลิกหมายเหตุการลบ
      setRemovals((prev) => {
        const next = { ...prev };
        added.forEach((u) => delete next[u]);
        return next;
      });
    }
    setEditError(dupes.length > 0 ? `Unit ซ้ำ: ${dupes.join(", ")}` : "");
    setUnitInput("");
  };

  const handleEditSave = async () => {
    if (!editingBox || editUnits.length === 0 || editBusy) return;
    if (pendingRemove) {
      setEditError("กรุณายืนยันหรือยกเลิกการลบ unit ที่ค้างอยู่ก่อนบันทึก");
      return;
    }
    setEditBusy(true);
    const removalList: UnitRemovalInput[] = Object.entries(removals).map(
      ([unitNumber, r]) => ({
        unitNumber,
        reasonId: r.reasonId,
        detail: r.detail || undefined,
      }),
    );
    const err = await onEditUnits(editingBox.id, editUnits, removalList);
    setEditBusy(false);
    if (err) {
      setEditError(err);
      return;
    }
    setEditingBox(null);
  };

  return (
    <div
      style={{
        background: "var(--surface, #fff)",
        border: "1px solid var(--border, #E4E4E7)",
        borderRadius: "var(--radius-lg, 10px)",
        padding: "24px 28px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header + Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h3
          style={{
            fontSize: 17,
            fontWeight: 700,
            margin: 0,
            color: "var(--text-primary)",
          }}
        >
          กล่องที่จัดเก็บแล้ว
          <span
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: "var(--text-secondary)",
              marginLeft: 8,
            }}
          >
            {filtered.length}/{pagination.total}
          </span>
        </h3>

        <div style={{ position: "relative", flex: "0 1 260px" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-secondary)",
            }}
          />
          <input
            type="text"
            placeholder="ค้นหากล่อง, หมู่เลือด, unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 32px",
              border: "1px solid var(--border, #E4E4E7)",
              borderRadius: "var(--radius-sm, 6px)",
              fontSize: 13,
              background: "var(--surface, #fff)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      {loading ? (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          กำลังโหลด...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          {searchQuery
            ? `ไม่พบกล่องที่ตรงกับ "${searchQuery}"`
            : "ยังไม่มีกล่องที่จัดเก็บ"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filtered.map((box, idx) => (
            <div
              key={box.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom:
                  idx < filtered.length - 1
                    ? "1px solid var(--border, #E4E4E7)"
                    : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background:
                      groupSurface(box.blood) ||
                      "var(--surface-raised, #F4F4F5)",
                    color: groupInk(box.blood) || "var(--text-secondary)",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {box.blood}
                </span>
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {box.boxLabel}
                    {box.boxName && (
                      <span
                        style={{
                          fontSize: 13,
                          color: "var(--text-secondary)",
                          marginLeft: 10,
                        }}
                      >
                        · {box.boxName}
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      marginLeft: 10,
                    }}
                  >
                    {box.units.length} units
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* ปุ่มแก้ไข units */}
                <button
                  onClick={() => openEditUnits(box)}
                  title="แก้ไข units"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "var(--radius-sm, 6px)",
                    border: "1px solid var(--border, #E4E4E7)",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Pencil size={14} />
                </button>

                                {/* ปุ่มแก้ไขตำแหน่ง */}
                <button
                  onClick={() => {
                    setLocBox(box);
                    setLocZoneId(box.zoneId || "");
                    setLocShelf(box.shelf);
                  }}
                  title="แก้ไขตำแหน่งจัดเก็บ"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "var(--radius-sm, 6px)",
                    border: "1px solid var(--border, #E4E4E7)",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                  }}
                >
                  <MapPin size={14} />
                </button>

                {/* ปุ่มพิมพ์บาร์โค้ด */}
                <button
                  onClick={() => onPrintBox(box)}
                  title="พิมพ์บาร์โค้ด"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "var(--radius-sm, 6px)",
                    border: "1px solid var(--border, #E4E4E7)",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Printer size={14} />
                </button>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 14px",
                    borderRadius: "var(--radius-sm, 6px)",
                    border: "1px solid var(--border, #E4E4E7)",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {box.zoneName ||
                    (box.location === "room" ? "ห้อง -30°C" : "ตู้ -30°C")}{" "}
                  · {box.shelf}{" "}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && boxes.length > 0 && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}

      {/* ── Edit Units Modal ── */}
      {editingBox && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1001,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 24,
              width: 440,
              maxWidth: "95vw",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                แก้ไข Units — {editingBox.boxLabel}
              </h3>
              <button
                onClick={() => setEditingBox(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Add unit input */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                autoFocus
                value={unitInput}
                onChange={(e) => {
                  setUnitInput(e.target.value.toUpperCase());
                  if (editError) setEditError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleEditAdd();
                  }
                }}
                placeholder="สแกนหรือพิมพ์ unit number"
                style={{
                  textTransform: "uppercase",
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  fontSize: 13,
                }}
              />
              <button
                onClick={handleEditAdd}
                disabled={editBusy}
                style={{
                  opacity: editBusy ? 0.6 : 1,
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: "var(--primary, #2563EB)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Plus size={14} /> เพิ่ม
              </button>
            </div>

            {editError && (
              <div
                role="alert"
                style={{
                  marginBottom: 12,
                  padding: "8px 12px",
                  borderRadius: 6,
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#B91C1C",
                  fontSize: 13,
                }}
              >
                {editError}
              </div>
            )}

            {/* Unit list */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                marginBottom: 16,
              }}
            >
              {editUnits.map((u) => (
                <div
                  key={u}
                  style={{
                    padding: "6px 10px",
                    background:
                      pendingRemove === u
                        ? "#FEF2F2"
                        : "var(--surface-raised, #F4F4F5)",
                    border:
                      pendingRemove === u
                        ? "1px solid #FECACA"
                        : "1px solid transparent",
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <span>
                      {u}
                      {!isOriginalUnit(u) && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 11,
                            color: "var(--primary, #2563EB)",
                            fontFamily: "var(--font-family)",
                          }}
                        >
                          ใหม่
                        </span>
                      )}
                    </span>
                    {pendingRemove !== u && (
                      <button
                        onClick={() => requestRemove(u)}
                        title="ลบ unit"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 2,
                        }}
                      >
                        <X size={13} color="var(--text-secondary)" />
                      </button>
                    )}
                  </div>

                  {/* กรอกหมายเหตุก่อนลบ */}
                  {pendingRemove === u && (
                    <div style={{ marginTop: 8 }}>
                      {reasonOptions.length === 0 ? (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#B91C1C",
                            marginBottom: 6,
                          }}
                        >
                          ยังไม่มีตัวเลือกหมายเหตุที่เปิดใช้งาน — ให้ผู้ดูแลเพิ่มที่
                          เมนู ตั้งค่า › หมายเหตุการลบ
                        </div>
                      ) : (
                        <>
                          <select
                            autoFocus
                            value={removeReasonId}
                            onChange={(e) => {
                              setRemoveReasonId(e.target.value);
                              if (editError) setEditError("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") setPendingRemove(null);
                            }}
                            style={{
                              width: "100%",
                              boxSizing: "border-box",
                              padding: "6px 10px",
                              border: "1px solid #FCA5A5",
                              borderRadius: 6,
                              fontSize: 13,
                              marginBottom: 6,
                              background: "#fff",
                              fontFamily: "var(--font-family)",
                            }}
                          >
                            <option value="">— เลือกหมายเหตุการลบ —</option>
                            {reasonOptions.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                          <input
                            value={removeDetail}
                            maxLength={300}
                            onChange={(e) => setRemoveDetail(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                confirmRemove();
                              } else if (e.key === "Escape") {
                                setPendingRemove(null);
                              }
                            }}
                            placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                            style={{
                              width: "100%",
                              boxSizing: "border-box",
                              padding: "6px 10px",
                              border: "1px solid var(--border)",
                              borderRadius: 6,
                              fontSize: 13,
                              marginBottom: 6,
                            }}
                          />
                        </>
                      )}
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={confirmRemove}
                          disabled={!removeReasonId}
                          style={{
                            flex: 1,
                            padding: "6px 0",
                            borderRadius: 6,
                            border: "none",
                            background: "#DC2626",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: removeReasonId ? "pointer" : "not-allowed",
                            opacity: removeReasonId ? 1 : 0.5,
                          }}
                        >
                          ยืนยันลบ
                        </button>
                        <button
                          onClick={() => {
                            setPendingRemove(null);
                            setRemoveReasonId("");
                            setRemoveDetail("");
                          }}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                            background: "#fff",
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {editUnits.length === 0 && (
                <div
                  style={{
                    padding: 16,
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    fontSize: 13,
                  }}
                >
                  ไม่มี unit
                </div>
              )}
            </div>

            {/* รายการที่จะลบในรอบนี้ */}
            {Object.keys(removals).length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#B91C1C",
                    marginBottom: 6,
                  }}
                >
                  จะลบเมื่อกดบันทึก ({Object.keys(removals).length})
                </div>
                {Object.entries(removals).map(([u, r]) => (
                  <div
                    key={u}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 8,
                      padding: "6px 10px",
                      marginBottom: 4,
                      background: "#FEF2F2",
                      borderRadius: 6,
                      fontSize: 13,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          textDecoration: "line-through",
                        }}
                      >
                        {u}
                      </div>
                      <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                        หมายเหตุ: {r.reasonName}
                        {r.detail ? ` — ${r.detail}` : ""}
                      </div>
                    </div>
                    <button
                      onClick={() => undoRemove(u)}
                      title="ยกเลิกการลบ"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--primary, #2563EB)",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Undo2 size={13} /> คืน
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ประวัติการลบ unit ของกล่องนี้ */}
            {removeHistory.length > 0 && (
              <details style={{ marginBottom: 16, fontSize: 13 }}>
                <summary
                  style={{
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    marginBottom: 6,
                  }}
                >
                  ประวัติการลบ unit ({removeHistory.length})
                </summary>
                {removeHistory.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "6px 10px",
                      marginBottom: 4,
                      background: "var(--surface-raised, #F4F4F5)",
                      borderRadius: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontFamily: "var(--font-mono)" }}>
                        {r.unitNumber}
                      </span>
                      <span
                        style={{ fontSize: 12, color: "var(--text-secondary)" }}
                      >
                        {new Date(r.removedAt).toLocaleString("th-TH", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                        {r.userName ? ` · ${r.userName}` : ""}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      หมายเหตุ: {r.note}
                    </div>
                  </div>
                ))}
              </details>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleEditSave}
                disabled={editUnits.length === 0 || editBusy}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 6,
                  border: "none",
                  background: "var(--primary, #2563EB)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  opacity: editUnits.length === 0 || editBusy ? 0.5 : 1,
                }}
              >
                บันทึก ({editUnits.length} units)
              </button>
              <button
                onClick={() => setEditingBox(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
            {/* ── Edit Location Modal ── */}
      {locBox && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1001,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 24,
              width: 400,
              maxWidth: "95vw",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                แก้ไขตำแหน่ง — {locBox.boxLabel}
              </h3>
              <button
                onClick={() => setLocBox(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* สถานที่ */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 4,
                  color: "var(--text-secondary)",
                }}
              >
                สถานที่
              </label>
              <select
                value={locZoneId}
                onChange={(e) => {
                  const zId = e.target.value;
                  setLocZoneId(zId);
                  const z = zones.find((z) => z.id === zId);
                  setLocShelf(z?.shelves[0]?.code || "");
                }}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border, #E4E4E7)",
                  fontSize: 14,
                }}
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ชั้นวาง */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 4,
                  color: "var(--text-secondary)",
                }}
              >
                ชั้นวาง
              </label>
              <select
                value={locShelf}
                onChange={(e) => setLocShelf(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border, #E4E4E7)",
                  fontSize: 14,
                }}
              >
                {(zones.find((z) => z.id === locZoneId)?.shelves || []).map(
                  (s) => (
                    <option key={s.id} value={s.code}>
                      {s.code}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  onEditLocation(locBox.id, locZoneId, locShelf);
                  setLocBox(null);
                }}
                disabled={!locZoneId || !locShelf}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 6,
                  border: "none",
                  background: "var(--primary, #2563EB)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  opacity: !locZoneId || !locShelf ? 0.5 : 1,
                }}
              >
                บันทึกตำแหน่ง
              </button>
              <button
                onClick={() => setLocBox(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
