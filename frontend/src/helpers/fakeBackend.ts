// frontend/src/helpers/fakeBackend.ts
//
// Fake Backend — ดัก axios request แล้วคืน mock data
// วิธีใช้: เรียก fakeBackend() ใน main.tsx ก่อน render app
// วิธีปิด: ลบบรรทัด fakeBackend() ใน main.tsx แล้ว backend จะเรียก API จริงแทน

import MockAdapter from 'axios-mock-adapter'
import { axiosApi } from './api_helper'
import * as data from '../common/data'

export default function fakeBackend() {
  const mock = new MockAdapter(axiosApi, { delayResponse: 300 })

  // ===== Auth =====
  mock.onPost('/auth/login').reply((config) => {
    const { username, password } = JSON.parse(config.data)
    if (username === 'admin' && password === 'admin123') {
      return [200, {
        token: 'fake-jwt-token-plasm',
        user: { id: '1', name: 'ผู้ดูแลระบบ', role: 'ADMIN' },
      }]
    }
    return [401, { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }]
  })

  // ===== Boxes =====
  mock.onGet('/boxes').reply(200, data.boxes)
  mock.onGet(/\/boxes\/\w+/).reply((config) => {
    const id = config.url?.split('/').pop()
    const item = data.boxes.find((b) => b.id === id)
    return item ? [200, item] : [404, { message: 'ไม่พบกล่อง' }]
  })

  // ===== Stock Summary =====
  mock.onGet('/stock/summary').reply(() => {
    const stocks = { A: 0, B: 0, O: 0, AB: 0 }
    data.boxes
      .filter((b) => b.status === 'stored')
      .forEach((b) => {
        stocks[b.blood] += b.units.length
      })
    return [200, {
      stocks,
      minimum: data.minimumStock,
    }]
  })

  // ===== Log =====
  mock.onGet('/log').reply(200, data.logEntries)

  // ===== Settings =====
  mock.onGet('/settings').reply(200, {
    minimumStock: data.minimumStock,
    shelfPositions: data.shelfPositions,
  })
}
