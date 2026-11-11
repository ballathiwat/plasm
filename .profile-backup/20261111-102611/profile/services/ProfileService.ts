// ============================================================
//  src/pages/profile/services/ProfileService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { PATCH_CHANGE_PASSWORD } from '../../../helpers/url_helper'
import type { ChangePasswordPayload } from './ProfileType'

const profileService = {
  changePassword: async (data: ChangePasswordPayload): Promise<{ message: string }> => {
    return await apiAdapter.patch<ChangePasswordPayload, { message: string }>(
      PATCH_CHANGE_PASSWORD,
      data,
    )
  },
}

export default profileService