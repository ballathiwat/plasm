// frontend/src/helpers/api_helper.ts
//
// Axios wrapper — เหมือน dormitory-management-system

import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

// Base URL — เปลี่ยนเป็น env variable ตอน production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// ===== สร้าง Axios instance =====
const axiosApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ===== Request Interceptor — แนบ token ทุก request =====
axiosApi.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ===== Response Interceptor — จัดการ error กลาง =====
axiosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// ===== APIClient class =====
class APIClient {
  get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return axiosApi.get(url, config)
  }

  getById(url: string, id: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return axiosApi.get(`${url}/${id}`, config)
  }

  post(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return axiosApi.post(url, data, config)
  }

  put(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return axiosApi.put(url, data, config)
  }

  patch(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return axiosApi.patch(url, data, config)
  }

  delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return axiosApi.delete(url, config)
  }
}

const apiClient = new APIClient()
export { apiClient, axiosApi }
export default APIClient
