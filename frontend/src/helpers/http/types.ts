// frontend/src/helpers/http/types.ts

/** Standard API response (ถ้า backend ห่อ envelope ในอนาคต) */
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
}

/** Standard error shape */
export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

/** GET query params */
export interface GetParams {
  [key: string]: string | number | boolean | undefined | null
}

/** Blob download options */
export interface BlobRequestOptions {
  filename?: string
  mimeType?: string
}

/** Upload progress callback */
export type UploadProgressCallback = (percent: number) => void
