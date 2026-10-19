// ============================================================
//  src/pages/settings/services/SettingsService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import {
  GET_SETTINGS, PUT_SETTINGS,
  GET_USERS, POST_USER, PATCH_USER,
} from '../../../helpers/url_helper'
import type { MinimumStock, UserItem, UserFormData } from './SettingsType'

const settingsService = {
  /** GET /settings */
  getSettings: async (): Promise<Record<string, unknown>> => {
    return await apiAdapter.get(GET_SETTINGS)
  },

  /** PUT /settings */
  updateMinimumStock: async (minimumStock: MinimumStock): Promise<{ message: string }> => {
    return await apiAdapter.put(PUT_SETTINGS, { minimumStock })
  },

  /** GET /users */
  getUsers: async (): Promise<UserItem[]> => {
    return await apiAdapter.get<UserItem[]>(GET_USERS)
  },

  /** POST /users */
  createUser: async (data: UserFormData): Promise<UserItem> => {
    return await apiAdapter.post<UserFormData, UserItem>(POST_USER, data)
  },

  /** PATCH /users/:id */
  updateUser: async (id: string, data: Partial<UserItem & { password?: string }>): Promise<UserItem> => {
    return await apiAdapter.patch<typeof data, UserItem>(`${PATCH_USER}/${id}`, data)
  },
}

export default settingsService
