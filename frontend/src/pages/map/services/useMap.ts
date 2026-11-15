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
} from "./MapType";
import { EMPTY_MAP_FILTERS } from "./MapType";

const unitCount = (b: MapBoxRaw) =>
  Array.isArray(b.units) ? b.units.length : 0;

export default function useMap() {
  // boxes = กล่องที่จัดเก็บอยู่ทั้งหมด → ใช้กับแผนผัง + การ์ดสรุป (ไม่ขึ้นกับตัวกรอง)
  // ตัวกรองของแท็บ "เก่าสุด / ใหม่สุด" อยู่ที่ useMapAge
  const [boxes, setBoxes] = useState<MapBoxRaw[]>([]);
  const [zones, setZones] = useState<MapZoneRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const masterBlood = useBloodTypes();

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

  const totalBoxes = zoneSummaries.reduce((s, z) => s + z.totalBoxes, 0);
  const totalUnits = zoneSummaries.reduce((s, z) => s + z.totalUnits, 0);

  return {
    zones: zoneSummaries,
    /** ข้อมูลดิบ (ไม่กรอง) — ส่งต่อให้ useMapAge */
    rawBoxes: boxes,
    rawZones: zones,
    bloodOrder,
    totalBoxes,
    totalUnits,
    error,
    loading,
  };
}
