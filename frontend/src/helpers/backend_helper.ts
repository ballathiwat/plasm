// frontend/src/helpers/backend_helper.ts
//
// Domain API functions
// Pattern: url_helper → apiAdapter → backend_helper
// Page components เรียกผ่านนี้

import apiAdapter from './http/apiAdapter'
import * as url from './url_helper'

// ===== Auth (ใช้ authService แทนได้) =====
export const postLogin = (data: { username: string; password: string }) =>
  apiAdapter.post(url.POST_LOGIN, data)

export const postLogout = () =>
  apiAdapter.post(url.POST_LOGOUT)

// ===== Boxes =====
export const getBoxes = (params?: Record<string, string>) =>
  apiAdapter.get(url.GET_BOXES, params)

export const getBoxById = (id: string) =>
  apiAdapter.getById(url.GET_BOX_DETAIL, id)

export const postBox = (data: unknown) =>
  apiAdapter.post(url.POST_BOX, data)

export const withdrawBox = (id: string) =>
  apiAdapter.patch(`${url.PATCH_BOX_WITHDRAW}/${id}/withdraw`)

// ===== Units =====
export const searchUnits = (query: string) =>
  apiAdapter.get(url.GET_UNIT_SEARCH, { q: query })

export const withdrawUnit = (unitId: string) =>
  apiAdapter.patch(`${url.PATCH_UNIT_WITHDRAW}/${unitId}/withdraw`)

// ===== Stock =====
export const getStockSummary = () =>
  apiAdapter.get(url.GET_STOCK_SUMMARY)

// ===== Log =====
export const getLog = (params?: Record<string, string>) =>
  apiAdapter.get(url.GET_LOG, params)

// ===== Settings =====
export const getSettings = () =>
  apiAdapter.get(url.GET_SETTINGS)

export const putSettings = (data: unknown) =>
  apiAdapter.put(url.PUT_SETTINGS, data)
