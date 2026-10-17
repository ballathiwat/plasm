// frontend/src/helpers/url_helper.ts
//
// รวม API URL ทั้งหมดไว้ที่เดียว
// Pattern เหมือน dormitory-management-system:
//   url_helper.ts  →  กำหนด URL
//   api_helper.ts  →  axios wrapper (get/post/put/delete)
//   backend_helper.ts  →  function เรียก API แต่ละตัว

// ===== Auth =====
export const POST_LOGIN = '/auth/login'
export const POST_LOGOUT = '/auth/logout'

// ===== Boxes =====
export const GET_BOXES = '/boxes'
export const GET_BOX_DETAIL = '/boxes' // + /:id
export const POST_BOX = '/boxes'
export const PATCH_BOX_WITHDRAW = '/boxes' // + /:id/withdraw

// ===== Units =====
export const GET_UNITS = '/units'
export const GET_UNIT_SEARCH = '/units/search' // ?q=
export const PATCH_UNIT_WITHDRAW = '/units' // + /:id/withdraw

// ===== Stock =====
export const GET_STOCK_SUMMARY = '/stock/summary'

// ===== Log =====
export const GET_LOG = '/log'

// ===== Settings =====
export const GET_SETTINGS = '/settings'
export const PUT_SETTINGS = '/settings'
