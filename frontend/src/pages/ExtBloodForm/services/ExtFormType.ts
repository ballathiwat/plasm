// frontend/src/pages/ExtBloodForm/services/ExtFormType.ts
import type { ExtCommitteeRole } from '../../ExtBlood/services/ExtBloodType'

export interface ExtFormData {
  receivedDate: string; sourceId: string; bloodProductId: string
  plasmaType: string; bloodGroup: string; boxLabel: string; storageId: string
  bags: string[]; deferApproval: boolean; editReason?: string
}

/** แถวคณะกรรมการในฟอร์ม (ยังไม่บันทึก) */
export interface CommitteeDraft { userId: string; userName: string; role: ExtCommitteeRole }

export type FormStep = 1 | 2

export interface AttachmentFile {
  file?: File; id?: string; fileName: string; fileSize: number; fileType: string; preview?: string
}
