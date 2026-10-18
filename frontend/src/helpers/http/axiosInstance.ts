// frontend/src/helpers/http/axiosInstance.ts
//
// Single Axios instance — config, token injection, interceptors

import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.117:3000'

/* ----------------------------------------------------------
   Create dedicated instance
---------------------------------------------------------- */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* ----------------------------------------------------------
   Request Interceptor — inject Bearer token
---------------------------------------------------------- */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = sessionStorage.getItem('authToken')
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
    return config
  },
  (error) => Promise.reject(error),
)

/* ----------------------------------------------------------
   Response Interceptor — handle errors
   ไม่ redirect เอง — ให้ AuthProtected จัดการ
---------------------------------------------------------- */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        message: error.message ?? 'Network Error',
        statusCode: 0,
      })
    }

    const { status, data } = error.response

    // 401 → ลบ token อย่างเดียว (AuthProtected จัดการ redirect)
    if (status === 401) {
      sessionStorage.removeItem('authToken')
      sessionStorage.removeItem('authUser')
    }

    const errorMessages: Record<number, string> = {
      400: data?.message ?? 'Bad Request',
      401: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      403: 'ไม่มีสิทธิ์เข้าถึง',
      404: 'ไม่พบข้อมูลที่ร้องขอ',
      409: data?.message ?? 'ข้อมูลซ้ำ',
      500: 'Internal Server Error',
    }

    return Promise.reject({
      message: errorMessages[status] ?? data?.message ?? 'Unexpected Error',
      statusCode: status,
      errors: data?.errors,
    })
  },
)

/* ----------------------------------------------------------
   Helper: update/clear token
---------------------------------------------------------- */
export const setInstanceToken = (token: string): void => {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export const clearInstanceToken = (): void => {
  delete axiosInstance.defaults.headers.common['Authorization']
}

export default axiosInstance