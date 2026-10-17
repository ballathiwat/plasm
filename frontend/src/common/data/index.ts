// frontend/src/common/data/index.ts
//
// Mock data สำหรับ fakeBackend
// เหมือน dormitory-management-system — ใช้ตอนยังไม่เชื่อม API จริง

import type { Box, LogEntry } from '../../types/models'

export const boxes: Box[] = [
  {
    id: '1',
    boxLabel: 'FFP-A-0001',
    type: 'FFP',
    blood: 'A',
    location: 'room',
    shelf: 'M1',
    collectionDate: '2024-10-01',
    units: ['A001', 'A002', 'A003', 'A004', 'A005', 'A006', 'A007', 'A008'],
    status: 'stored',
    storedAt: '2024-10-01T09:00:00Z',
  },
  {
    id: '2',
    boxLabel: 'FFP-B-0002',
    type: 'FFP',
    blood: 'B',
    location: 'room',
    shelf: 'R1',
    collectionDate: '2024-10-02',
    units: ['B001', 'B002', 'B003', 'B004', 'B005', 'B006', 'B007', 'B008', 'B009', 'B010'],
    status: 'stored',
    storedAt: '2024-10-02T10:00:00Z',
  },
  {
    id: '3',
    boxLabel: 'FFP-O-0003',
    type: 'FFP',
    blood: 'O',
    location: 'room',
    shelf: 'L1',
    collectionDate: '2024-10-03',
    units: ['O001', 'O002', 'O003', 'O004', 'O005', 'O006', 'O007', 'O008'],
    status: 'stored',
    storedAt: '2024-10-03T08:30:00Z',
  },
  {
    id: '4',
    boxLabel: 'FFP-AB-0004',
    type: 'FFP',
    blood: 'AB',
    location: 'cabinet',
    shelf: 'C1',
    collectionDate: '2024-10-04',
    units: ['AB001', 'AB002', 'AB003', 'AB004', 'AB005'],
    status: 'stored',
    storedAt: '2024-10-04T11:00:00Z',
  },
]

export const logEntries: LogEntry[] = [
  {
    id: '1',
    action: 'store',
    boxLabel: 'FFP-A-0001',
    type: 'FFP',
    blood: 'A',
    units: ['A001', 'A002', 'A003', 'A004', 'A005', 'A006', 'A007', 'A008'],
    location: 'room',
    shelf: 'M1',
    timestamp: '2024-10-01T09:00:00Z',
    detail: 'จัดเก็บกล่อง FFP-A-0001 จำนวน 8 units',
  },
  {
    id: '2',
    action: 'store',
    boxLabel: 'FFP-B-0002',
    type: 'FFP',
    blood: 'B',
    units: ['B001', 'B002', 'B003', 'B004', 'B005', 'B006', 'B007', 'B008', 'B009', 'B010'],
    location: 'room',
    shelf: 'R1',
    timestamp: '2024-10-02T10:00:00Z',
    detail: 'จัดเก็บกล่อง FFP-B-0002 จำนวน 10 units',
  },
]

// ===== Minimum Stock Settings =====
export const minimumStock = {
  A: 150,
  B: 300,
  O: 300,
  AB: 100,
}

// ===== Shelf Positions =====
export const shelfPositions = {
  room: ['M1', 'R1', 'R2', 'R3', 'L1', 'L2', 'L3'],
  cabinet: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
}
