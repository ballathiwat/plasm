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

// ===== Units =====
export const GET_UNITS = `${API}/units`
export const GET_UNIT_SEARCH = `${API}/units/search` // ?q=
export const GET_UNIT_CHECK = `${API}/units/check`   // ?unit=
export const PATCH_UNIT_WITHDRAW = `${API}/units`    // + /:id/withdraw

// ===== Stock =====
export const GET_STOCK_SUMMARY = `${API}/stock/summary`
export const GET_STOCK_DAILY = `${API}/stock/daily`
export const GET_STOCK_REPORT = `${API}/stock/report`

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