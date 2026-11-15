// ============================================================
//  src/pages/map/services/useMap.ts
// ============================================================

import { useState, useEffect, useMemo } from "react";
import mapService from "./MapService";
import useBloodTypes from "../../../helpers/useBloodTypes";
import usePlasmaTypes from "../../../helpers/usePlasmaTypes";
import type {
  MapBoxRaw,
  MapZoneRaw,
  ShelfSummary,
  ZoneSummary,
  BloodGroupAgeInfo,
  MapFilters,
} from "./MapType";
import { EMPTY_MAP_FILTERS } from "./MapType";

const unitCount = (b: MapBoxRaw) =>
  Array.isArray(b.units) ? b.units.length : 0;

export default function useMap() {
  // boxes = กล่องที่จัดเก็บอยู่ทั้งหมด → ใช้กับแผนผัง + การ์ดสรุป (ไม่ขึ้นกับตัวกรอง)
  const [boxes, setBoxes] = useState<MapBoxRaw[]>([]);
  const [zones, setZones] = useState<MapZoneRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // filteredBoxes = ผลจาก API ตามตัวกรอง → ใช้เฉพาะแท็บ "เก่าสุด / ใหม่สุด"
  const [filters, setFilters] = useState<MapFilters>(EMPTY_MAP_FILTERS);
  const [filteredBoxes, setFilteredBoxes] = useState<MapBoxRaw[]>([]);
  const [filtering, setFiltering] = useState(false);
  const [filterError, setFilterError] = useState("");
  const masterBlood = useBloodTypes();
  const masterTypes = usePlasmaTypes();
  const hasFilter = filters.blood !== "" || filters.type !== "";

  useEffect(() => {
    let alive = true;
    Promise.all([
      mapService.getStoredBoxes(EMPTY_MAP_FILTERS),
      mapService.getZones(),
    ])
      .then(([b, z]) => {
        if (!alive) return;
        setBoxes(b);
        setZones(z);
      })
      .catch(() => {
        if (!alive) return;
        setBoxes([]);
        setZones([]);
        setError("โหลดข้อมูลแผนผังไม่สำเร็จ กรุณาลองใหม่");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // ดึงใหม่จาก API เมื่อตัวกรองเปลี่ยน — ไม่มีตัวกรองใช้ boxes ชุดเดิม ไม่ต้องยิงซ้ำ
  // alive กันผลลัพธ์ของคำขอเก่าเขียนทับคำขอล่าสุด (เปลี่ยนตัวกรองเร็ว ๆ)
  useEffect(() => {
    if (!hasFilter) {
      setFiltering(false);
      setFilterError("");
      return;
    }
    let alive = true;
    setFiltering(true);
    mapService
      .getStoredBoxes(filters)
      .then((b) => {
        if (!alive) return;
        setFilteredBoxes(b);
        setFilterError("");
      })
      .catch(() => {
        if (!alive) return;
        setFilteredBoxes([]);
        setFilterError("โหลดข้อมูลตามตัวกรองไม่สำเร็จ กรุณาลองใหม่");
      })
      .finally(() => {
        if (alive) setFiltering(false);
      });
    return () => {
      alive = false;
    };
  }, [filters, hasFilter]);

  const setBlood = (blood: string) => setFilters((f) => ({ ...f, blood }));
  const setType = (type: string) => setFilters((f) => ({ ...f, type }));
  const clearFilters = () => setFilters(EMPTY_MAP_FILTERS);

  const zoneSummaries = useMemo<ZoneSummary[]>(() => {
    const summaries: ZoneSummary[] = [];

    for (const zone of zones) {
      const zoneBoxes = boxes.filter((b) => b.zoneId === zone.id);
      if (!zone.active && zoneBoxes.length === 0) continue;

      const codes: string[] = [];
      for (const s of zone.shelves) {
        const hasBoxes = zoneBoxes.some((b) => b.shelf === s.code);
        if (s.active || hasBoxes) codes.push(s.code);
      }
      for (const b of zoneBoxes) {
        if (!codes.includes(b.shelf)) codes.push(b.shelf);
      }

      const shelves: ShelfSummary[] = codes.map((shelf) => {
        const shelfBoxes = zoneBoxes.filter((b) => b.shelf === shelf);
        const byBlood: Record<string, number> = {};
        let totalUnits = 0;
        for (const b of shelfBoxes) {
          const count = unitCount(b);
          byBlood[b.blood] = (byBlood[b.blood] || 0) + count;
          totalUnits += count;
        }
        return { shelf, totalBoxes: shelfBoxes.length, totalUnits, byBlood };
      });

      summaries.push({
        id: zone.id,
        name: zone.name,
        legacyKey: zone.legacyKey,
        active: zone.active,
        shelves,
        totalBoxes: zoneBoxes.length,
        totalUnits: zoneBoxes.reduce((s, b) => s + unitCount(b), 0),
      });
    }

    return summaries;
  }, [boxes, zones]);

  // ลำดับหมู่เลือดตาม master + หมู่ที่พบในกล่องแต่ไม่อยู่ใน master
  const bloodOrder = useMemo(() => {
    const list = [...masterBlood];
    for (const b of boxes) if (!list.includes(b.blood)) list.push(b.blood);
    return list;
  }, [masterBlood, boxes]);

  // กล่องเก่าสุด / ใหม่สุด แยกตาม "ชนิดเลือด + หมู่เลือด"
  // (เดิมแยกตามหมู่เลือดอย่างเดียว ทำให้เก่าสุดเป็น FFP แต่ใหม่สุดเป็น IFFP ได้)
  const bloodAgeMap = useMemo<BloodGroupAgeInfo[]>(() => {
    const source = hasFilter ? filteredBoxes : boxes;
    const map = new Map<
      string,
      { type: string; blood: string; oldest: MapBoxRaw; newest: MapBoxRaw }
    >();

    for (const b of source) {
      const key = `${b.type}|${b.blood}`;
      const entry = map.get(key);
      if (!entry) {
        map.set(key, { type: b.type, blood: b.blood, oldest: b, newest: b });
        continue;
      }

      // เก่าสุด: วันที่น้อยกว่า หรือ วันที่เท่ากันแต่เลขลำดับน้อยกว่า
      if (
        b.collectionDate < entry.oldest.collectionDate ||
        (b.collectionDate === entry.oldest.collectionDate &&
          b.boxLabel < entry.oldest.boxLabel)
      )
        entry.oldest = b;

      // ใหม่สุด: วันที่มากกว่า หรือ วันที่เท่ากันแต่เลขลำดับมากกว่า
      if (
        b.collectionDate > entry.newest.collectionDate ||
        (b.collectionDate === entry.newest.collectionDate &&
          b.boxLabel > entry.newest.boxLabel)
      )
        entry.newest = b;
    }

    const zoneNames: Record<string, string> = {};
    for (const z of zones) zoneNames[z.id] = z.name;

    // เรียงตามลำดับ master (ชนิดเลือด → หมู่เลือด) · ค่าที่ไม่อยู่ใน master ต่อท้าย
    const rank = (list: string[], v: string) => {
      const i = list.indexOf(v);
      return i === -1 ? list.length : i;
    };
    const fmt = (b: MapBoxRaw) => ({
      boxLabel: b.boxLabel,
      zoneName: b.zoneName || zoneNames[b.zoneId] || "",
      shelf: b.shelf,
      collectionDate: b.collectionDate,
    });

    return [...map.values()]
      .sort(
        (x, y) =>
          rank(masterTypes, x.type) - rank(masterTypes, y.type) ||
          x.type.localeCompare(y.type) ||
          rank(bloodOrder, x.blood) - rank(bloodOrder, y.blood) ||
          x.blood.localeCompare(y.blood),
      )
      .map((e) => ({
        type: e.type,
        blood: e.blood,
        oldest: fmt(e.oldest),
        newest: fmt(e.newest),
      }));
  }, [boxes, filteredBoxes, hasFilter, zones, bloodOrder, masterTypes]);

  const totalBoxes = zoneSummaries.reduce((s, z) => s + z.totalBoxes, 0);
  const totalUnits = zoneSummaries.reduce((s, z) => s + z.totalUnits, 0);

  return {
    zones: zoneSummaries,
    bloodOrder,
    bloodAgeMap,
    totalBoxes,
    totalUnits,
    filters,
    hasFilter,
    setBlood,
    setType,
    clearFilters,
    error,
    filterError,
    loading,
    /** กำลังดึงข้อมูลตามตัวกรองของแท็บ "เก่าสุด / ใหม่สุด" */
    filtering,
  };
}
