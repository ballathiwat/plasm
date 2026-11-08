// frontend/src/pages/ExtBloodForm/services/ExtFormType.ts

export interface ExtFormData {
  receivedDate: string; sourceId: string; bloodProductId: string
  bloodGroup: string; boxLabel: string; storageId: string
  bags: string[]; deferApproval: boolean; editReason?: string
}

export interface SignState {
  role: 'verifier' | 'storer' | 'approver'
  userId: string; userName: string
  status: 'unsigned' | 'verifying' | 'signed' | 'error' | 'locked'
  signedAt?: string; errorMsg?: string; remaining?: number; lockedUntil?: string
}

export type FormStep = 1 | 2 | 3 | 4

export interface AttachmentFile {
  file?: File; id?: string; fileName: string; fileSize: number; fileType: string; preview?: string
}
