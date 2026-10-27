// frontend/src/types/navigation.ts

import {
  LayoutDashboard,
  Package,
  PackageOpen,
  Search,
  Map,
  ClipboardList,
  Settings,
  MoreHorizontal,
  BarChart3,
  FileText,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react'

export type UserRole = 'ADMIN' | 'STAFF'

export interface MenuItem {
  key: string
  label: string
  icon: LucideIcon
  roles: UserRole[]
  children?: MenuItem[]
}

export interface MobileNavItem {
  key: string
  label: string
  icon: LucideIcon
}

export const MENU_ITEMS: MenuItem[] = [
  { key: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard, roles: ['ADMIN', 'STAFF'] },
  { key: 'storage', label: 'จัดเก็บ', icon: Package, roles: ['ADMIN', 'STAFF'] },
  { key: 'withdraw', label: 'นำออก', icon: PackageOpen, roles: ['ADMIN', 'STAFF'] },
  { key: 'search', label: 'ค้นหา', icon: Search, roles: ['ADMIN', 'STAFF'] },
  { key: 'map', label: 'แผนผัง', icon: Map, roles: ['ADMIN', 'STAFF'] },
  { key: 'log', label: 'ประวัติ', icon: ClipboardList, roles: ['ADMIN', 'STAFF'] },
  {
    key: 'report',
    label: 'รายงาน',
    icon: BarChart3,
    roles: ['ADMIN', 'STAFF'],
    children: [
      { key: 'report-summary', label: 'รายงานสรุป', icon: FileText, roles: ['ADMIN', 'STAFF'] },
      { key: 'report-daily', label: 'นำเข้า/นำออก รายวัน', icon: CalendarDays, roles: ['ADMIN', 'STAFF'] },
    ],
  },
  { key: 'settings', label: 'ตั้งค่า', icon: Settings, roles: ['ADMIN'] },
]

export const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { key: 'dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
  { key: 'storage', label: 'จัดเก็บ', icon: Package },
  { key: 'withdraw', label: 'นำออก', icon: PackageOpen },
  { key: 'search', label: 'ค้นหา', icon: Search },
  { key: 'more', label: 'เพิ่มเติม', icon: MoreHorizontal },
]

export const PAGE_TITLES: Record<string, string> = {
  dashboard: 'แดชบอร์ด',
  storage: 'จัดเก็บพลาสมา',
  withdraw: 'นำออกพลาสมา',
  search: 'ค้นหา Unit',
  map: 'แผนผังจัดเก็บ',
  log: 'ประวัติการจัดเก็บ/นำออก',
  'report-summary': 'รายงานสรุป',
  'report-daily': 'รายงาน นำเข้า/นำออก รายวัน',
  settings: 'ตั้งค่า',
}