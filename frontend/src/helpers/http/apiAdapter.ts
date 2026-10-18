// frontend/src/helpers/http/apiAdapter.ts
//
// Type-safe HTTP methods: GET, POST, PUT, PATCH, DELETE

import axiosInstance from './axiosInstance'
import type { AxiosRequestConfig } from 'axios'
import type { GetParams, BlobRequestOptions, UploadProgressCallback } from './types'

/* ----------------------------------------------------------
   Helper: build query string
---------------------------------------------------------- */
const buildQueryString = (params: GetParams): string => {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
  return parts.length ? `?${parts.join('&')}` : ''
}

/* ----------------------------------------------------------
   Helper: trigger browser file download
---------------------------------------------------------- */
const downloadBlob = (blob: Blob, filename: string, mimeType?: string): void => {
  const objectUrl = URL.createObjectURL(
    mimeType ? new Blob([blob], { type: mimeType }) : blob,
  )
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}

/* ==========================================================
   ApiAdapter Class
========================================================== */
class ApiAdapter {
  // GET
  async get<T>(url: string, params?: GetParams, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.get<T>(url, { ...config, params })
    return response.data
  }

  // GET by ID
  async getById<T>(url: string, id: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.get<T>(`${url}/${id}`, config)
    return response.data
  }

  // POST
  async post<TBody = unknown, TResponse = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> {
    const response = await axiosInstance.post<TResponse>(url, data, config)
    return response.data
  }

  // PUT
  async put<TBody = unknown, TResponse = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> {
    const response = await axiosInstance.put<TResponse>(url, data, config)
    return response.data
  }

  // PATCH
  async patch<TBody = unknown, TResponse = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> {
    const response = await axiosInstance.patch<TResponse>(url, data, config)
    return response.data
  }

  // DELETE
  async delete<TResponse = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> {
    const response = await axiosInstance.delete<TResponse>(url, config)
    return response.data
  }

  // UPLOAD — multipart/form-data
  async upload<TResponse = unknown>(
    url: string,
    formData: FormData,
    onProgress?: UploadProgressCallback,
  ): Promise<TResponse> {
    const response = await axiosInstance.post<TResponse>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total))
        }
      },
    })
    return response.data
  }

  // BLOB GET — download file
  async downloadFile(
    url: string,
    params?: GetParams,
    options?: BlobRequestOptions,
  ): Promise<Blob> {
    const qs = params ? buildQueryString(params) : ''
    const response = await axiosInstance.get<Blob>(`${url}${qs}`, {
      responseType: 'blob',
    })
    const blob = response.data
    if (options?.filename) {
      downloadBlob(blob, options.filename, options.mimeType)
    }
    return blob
  }
}

/* ----------------------------------------------------------
   Export singleton
---------------------------------------------------------- */
const apiAdapter = new ApiAdapter()
export default apiAdapter
export { ApiAdapter }
