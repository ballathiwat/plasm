// frontend/src/helpers/services/minStockService.ts
// API สต็อกขั้นต่ำ ราย ชนิด × หมู่ — ใช้ร่วมกันหลายหน้า (ตั้งค่า, แดชบอร์ด, กระดิ่ง)

import apiAdapter from '../http/apiAdapter'
import { STOCK_MIN_STOCK, STOCK_MIN_STOCK_STATUS, NOTIFICATIONS_ACK } from '../url_helper'
import type { MinStockStatus, MinStockType } from '../minStock'

export interface MinStockCell { type: string; group: string; minUnits: number | null }
export interface MinStockMeta { updatedBy: string | null; updatedAt: string | null }
export interface MinStockResponse {
  types: MinStockType[]
  groups: string[]
  items: MinStockCell[]
  meta: MinStockMeta
}

const minStockService = {
  /** GET /stock/min-stock */
  getMinStock: () => apiAdapter.get<MinStockResponse>(STOCK_MIN_STOCK),

  /** PUT /stock/min-stock — ส่งเฉพาะช่องที่แก้ (ADMIN) */
  saveMinStock: (items: MinStockCell[]) =>
    apiAdapter.put<{ items: MinStockCell[] }, MinStockResponse>(STOCK_MIN_STOCK, { items }),

  /** GET /stock/min-stock/status */
  getStatus: () => apiAdapter.get<MinStockStatus>(STOCK_MIN_STOCK_STATUS),

  /** POST /notifications/:id/ack */
  acknowledge: (notificationId: string) =>
    apiAdapter.post<Record<string, never>, { ok: boolean }>(
      `${NOTIFICATIONS_ACK}/${encodeURIComponent(notificationId)}/ack`, {},
    ),
}

export default minStockService
