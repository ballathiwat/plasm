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
} from "./MapType";

const unitCount = (b: MapBoxRaw) =>
  Array.isArray(b.units) ? b.units.length : 0;

export default function useMap() {
  const [boxes, setBoxes] = useState<MapBoxRaw[]>([]);
  const [zones, setZones] = useState<MapZoneRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const masterBlood = useBloodTypes();

  useEffect(() => {
    Promise.all([mapService.getStoredBoxes(), mapService.getZones()])
      .then(([b, z]) => {
        setBoxes(b);
        setZones(z);
      })
      .catch(() => {
        setBoxes([]);
        setZones([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const zoneSummaries = useMemo<ZoneSummary[]>(() => {
    const summaries: ZoneSummary[] = [];

    for (const zone of zones) {
      const zoneBoxes = boxes.filter((b) => b.zoneId === zone.id);
      // ซ่อนสถานที่ที่ปิดใช้งานและไม่มีกล่องเหลืออยู่
      if (!zone.active && zoneBoxes.length === 0) continue;

      // ชั้นตาม master (ชั้นที่ปิดใช้งานแสดงเฉพาะเมื่อยังมีกล่อง) ตามด้วยชั้นที่มีกล่องแต่ไม่อยู่ใน master
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
    const bloodAgeMap = useMemo<BloodGroupAgeInfo[]>(() => {
      const map: Record<
        string,
        { oldest: MapBoxRaw | null; newest: MapBoxRaw | null }
      > = {};

      for (const b of boxes) {
        if (!map[b.blood]) map[b.blood] = { oldest: null, newest: null };
        const entry = map[b.blood];
        if (!entry.oldest || b.collectionDate < entry.oldest.collectionDate)
          entry.oldest = b;
        if (!entry.newest || b.collectionDate > entry.newest.collectionDate)
          entry.newest = b;
      }

      // zone name lookup
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

    const list = [...masterBlood];
    for (const b of boxes) if (!list.includes(b.blood)) list.push(b.blood);
    return list;
  }, [masterBlood, boxes]);

  const totalBoxes = zoneSummaries.reduce((s, z) => s + z.totalBoxes, 0);
  const totalUnits = zoneSummaries.reduce((s, z) => s + z.totalUnits, 0);

  return { zones: zoneSummaries, bloodOrder, bloodAgeMap, totalBoxes, totalUnits, loading };
}
