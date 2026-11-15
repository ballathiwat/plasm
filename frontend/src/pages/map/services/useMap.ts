// ============================================================
//  src/pages/map/services/useMap.ts
// ============================================================

import { useState, useEffect, useMemo } from "react";
import mapService from "./MapService";
import useBloodTypes from "../../../helpers/useBloodTypes";
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
  const [boxes, setBoxes] = useState<MapBoxRaw[]>([]);
  const [zones, setZones] = useState<MapZoneRaw[]>([]);
  const [filters, setFilters] = useState<MapFilters>(EMPTY_MAP_FILTERS);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [boxesLoading, setBoxesLoading] = useState(true);
  const [boxesReady, setBoxesReady] = useState(false);
  const [error, setError] = useState("");
  const masterBlood = useBloodTypes();

  // สถานที่ + ชั้นวาง — โหลดครั้งเดียว ไม่ขึ้นกับตัวกรอง
  useEffect(() => {
    let alive = true;
    mapService
      .getZones()
      .then((z) => {
        if (alive) setZones(z);
      })
      .catch(() => {
        if (alive) setError("โหลดข้อมูลสถานที่จัดเก็บไม่สำเร็จ");
      })
      .finally(() => {
        if (alive) setZonesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // กล่องที่จัดเก็บอยู่ — ดึงใหม่จาก API ทุกครั้งที่ตัวกรองเปลี่ยน
  // alive กันผลลัพธ์ของคำขอเก่าเขียนทับคำขอล่าสุด (เปลี่ยนตัวกรองเร็ว ๆ)
  useEffect(() => {
    let alive = true;
    setBoxesLoading(true);
    mapService
      .getStoredBoxes(filters)
      .then((b) => {
        if (!alive) return;
        setBoxes(b);
        setError("");
      })
      .catch(() => {
        if (!alive) return;
        setBoxes([]);
        setError("โหลดข้อมูลกล่องไม่สำเร็จ กรุณาลองใหม่");
      })
      .finally(() => {
        if (!alive) return;
        setBoxesLoading(false);
        setBoxesReady(true);
      });
    return () => {
      alive = false;
    };
  }, [filters]);

  const setBlood = (blood: string) => setFilters((f) => ({ ...f, blood }));
  const setType = (type: string) => setFilters((f) => ({ ...f, type }));
  const clearFilters = () => setFilters(EMPTY_MAP_FILTERS);
  const hasFilter = filters.blood !== "" || filters.type !== "";

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

  // กล่องเก่าสุด / ใหม่สุดแยกตามกรุ๊ปเลือด
  const bloodAgeMap = useMemo<BloodGroupAgeInfo[]>(() => {
    const map: Record<
      string,
      { oldest: MapBoxRaw | null; newest: MapBoxRaw | null }
    > = {};

    for (const b of boxes) {
      if (!map[b.blood]) map[b.blood] = { oldest: null, newest: null };
      const entry = map[b.blood];

      // เก่าสุด: วันที่น้อยกว่า หรือ วันที่เท่ากันแต่เลขลำดับน้อยกว่า
      if (
        !entry.oldest ||
        b.collectionDate < entry.oldest.collectionDate ||
        (b.collectionDate === entry.oldest.collectionDate &&
          b.boxLabel < entry.oldest.boxLabel)
      )
        entry.oldest = b;

      // ใหม่สุด: วันที่มากกว่า หรือ วันที่เท่ากันแต่เลขลำดับมากกว่า
      if (
        !entry.newest ||
        b.collectionDate > entry.newest.collectionDate ||
        (b.collectionDate === entry.newest.collectionDate &&
          b.boxLabel > entry.newest.boxLabel)
      )
        entry.newest = b;
    }

    const zoneNames: Record<string, string> = {};
    for (const z of zones) zoneNames[z.id] = z.name;

    return bloodOrder
      .filter((g) => map[g])
      .map((g) => {
        const { oldest, newest } = map[g];
        const fmt = (b: MapBoxRaw | null) =>
          b
            ? {
                boxLabel: b.boxLabel,
                zoneName: b.zoneName || zoneNames[b.zoneId] || "",
                shelf: b.shelf,
                collectionDate: b.collectionDate,
              }
            : null;
        return { blood: g, oldest: fmt(oldest), newest: fmt(newest) };
      });
  }, [boxes, zones, bloodOrder]);

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
    /** โหลดครั้งแรก (ทั้งหน้า) */
    loading: zonesLoading || !boxesReady,
    /** กำลังดึงข้อมูลใหม่หลังเปลี่ยนตัวกรอง */
    filtering: boxesReady && boxesLoading,
  };
}
