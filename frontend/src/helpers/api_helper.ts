// frontend/src/helpers/api_helper.ts
//
// Backward-compatible wrapper + re-export layer ใหม่
// ไฟล์เก่า import { apiClient, axiosApi } ยังใช้ได้

import axiosInstance from './http/axiosInstance'
import apiAdapter from './http/apiAdapter'

// ===== Backward-compatible exports =====
export const axiosApi = axiosInstance
export const apiClient = apiAdapter

// ===== Re-export layer ใหม่ =====
export { default as apiAdapter } from './http/apiAdapter'
export { default as axiosInstance } from './http/axiosInstance'
export { setInstanceToken, clearInstanceToken } from './http/axiosInstance'
export type { ApiResponse, ApiError, GetParams, BlobRequestOptions } from './http/types'
