// ============================================================
//  src/pages/settings/services/SettingsService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_USERS, POST_USER, PATCH_USER } from '../../../helpers/url_helper'
import type { UserItem, UserFormData } from './SettingsType'

const settingsService = {
  // สต็อกขั้นต่ำ → helpers/services/minStockService.ts

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
