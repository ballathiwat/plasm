// frontend/src/helpers/backend_helper.ts
//
// Function เรียก API แต่ละตัว
// Pattern: url_helper → api_helper → backend_helper

import { apiClient } from './api_helper'
import * as url from './url_helper'

// ===== Auth =====
export const postLogin = (data: { username: string; password: string }) =>
  apiClient.post(url.POST_LOGIN, data)

export const postLogout = () =>
  apiClient.post(url.POST_LOGOUT)

// ===== Boxes =====
export const getBoxes = (params?: Record<string, string>) =>
  apiClient.get(url.GET_BOXES, { params })

export const getBoxById = (id: string) =>
  apiClient.getById(url.GET_BOX_DETAIL, id)

export const postBox = (data: unknown) =>
  apiClient.post(url.POST_BOX, data)

export const withdrawBox = (id: string) =>
  apiClient.patch(`${url.PATCH_BOX_WITHDRAW}/${id}/withdraw`)

// ===== Units =====
export const searchUnits = (query: string) =>
  apiClient.get(url.GET_UNIT_SEARCH, { params: { q: query } })

export const withdrawUnit = (unitId: string) =>
  apiClient.patch(`${url.PATCH_UNIT_WITHDRAW}/${unitId}/withdraw`)

// ===== Stock =====
export const getStockSummary = () =>
  apiClient.get(url.GET_STOCK_SUMMARY)

// ===== Log =====
export const getLog = (params?: Record<string, string>) =>
  apiClient.get(url.GET_LOG, { params })

// ===== Settings =====
export const getSettings = () =>
  apiClient.get(url.GET_SETTINGS)

export const putSettings = (data: unknown) =>
  apiClient.put(url.PUT_SETTINGS, data)
