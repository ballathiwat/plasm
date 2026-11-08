// ============================================================
//  frontend/src/helpers/url_helper.ts
//
//  รวม API URL ทั้งหมดไว้ที่เดียว
//  Pattern: url_helper → apiAdapter → services / backend_helper
// ============================================================

const API = '/api/v1'

// ===== Auth =====
export const POST_LOGIN = `${API}/auth/login`
export const POST_LOGOUT = `${API}/auth/logout`
export const PATCH_CHANGE_PASSWORD = `${API}/auth/change-password`

// ===== Boxes =====
export const GET_BOXES = `${API}/boxes`
export const GET_BOX_DETAIL = `${API}/boxes`       // + /:id
export const POST_BOX = `${API}/boxes`
export const PATCH_BOX_WITHDRAW = `${API}/boxes`    // + /:id/withdraw
export const GET_BOX_SEARCH = `${API}/boxes/search` // ?q= (กล่อง + unit ที่จัดเก็บอยู่)
export const POST_BOX_WITHDRAW_UNITS = `${API}/boxes` // + /:id/withdraw  { units: string[] }

// ===== Units =====
export const GET_UNIT_SEARCH = `${API}/units/search` // ?q=
export const GET_UNIT_CHECK = `${API}/units/check`   // ?unit=
export const PATCH_UNIT_WITHDRAW = `${API}/units`    // + /:id/withdraw

// ===== Stock =====
export const GET_STOCK_SUMMARY = `${API}/stock/summary`
export const GET_STOCK_DAILY = `${API}/stock/daily`
export const GET_STOCK_REPORT = `${API}/stock/report`

// ===== Reports =====
export const GET_REPORTS_MOVEMENTS = `${API}/reports/movements`
// ===== Log =====
export const GET_LOG = `${API}/log`

// ===== Users =====
export const GET_USERS = `${API}/users`
export const POST_USER = `${API}/users`
export const PATCH_USER = `${API}/users`    // + /:id

// ===== Settings =====
export const GET_SETTINGS = `${API}/settings`
export const PUT_SETTINGS = `${API}/settings`

// ===== Master data =====
export const MASTER_PLASMA_TYPES = `${API}/master/plasma-types`
export const MASTER_BLOOD_TYPES = `${API}/master/blood-types`
export const MASTER_ZONES = `${API}/master/zones`
export const MASTER_SHELVES = `${API}/master/shelves`
export const MASTER_REMOVAL_REASONS = `${API}/master/removal-reasons`

// ===== Rack (ห้อง -30°C) =====
export const GET_RACK = `${API}/master/zones`       // + /:zoneId/racks/:shelf
export const SLOT_LOCKS = `${API}/locks`            // POST · PUT /:id (heartbeat) · DELETE /:id

// ===== External Blood Receiving (รอรับเลือดจากภายนอก) =====
export const EXT_BASE = `${API}/ext`
export const EXT_DOCUMENTS = `${EXT_BASE}/documents`
export const EXT_SUMMARY = `${EXT_BASE}/summary`
export const EXT_REPORT = `${EXT_BASE}/report`
export const EXT_SOURCES = `${EXT_BASE}/sources`
export const EXT_STORAGES = `${EXT_BASE}/storages`
export const EXT_BLOOD_PRODUCTS = `${EXT_BASE}/blood-products`
export const EXT_EXPORT_REASONS = `${EXT_BASE}/export-reasons`
export const EXT_ATTACHMENTS = `${EXT_BASE}/attachments`
export const EXT_PIN_SETUP = `${EXT_BASE}/pin/setup`
export const EXT_PIN_VERIFY = `${EXT_BASE}/pin/verify`
