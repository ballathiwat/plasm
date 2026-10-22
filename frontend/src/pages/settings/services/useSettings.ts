// ============================================================
//  src/pages/settings/services/useSettings.ts
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import settingsService from './SettingsService'
import type { MinimumStock, UserItem, UserFormData, ToastState } from './SettingsType'

const DEFAULT_MIN: MinimumStock = { A: 150, B: 300, O: 300, AB: 100 }
const DEFAULT_USER_FORM: UserFormData = { username: '', name: '', password: '', role: 'staff' }

export default function useSettings() {
  // ── Settings ──
  const [minimumStock, setMinimumStock] = useState<MinimumStock>(DEFAULT_MIN)
  const [savingSettings, setSavingSettings] = useState(false)

  // ── Users ──
  const [users, setUsers] = useState<UserItem[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [showUserForm, setShowUserForm] = useState(false)
  const [userForm, setUserForm] = useState<UserFormData>(DEFAULT_USER_FORM)
  const [savingUser, setSavingUser] = useState(false)

  // ── UI ──
  const [toast, setToast] = useState<ToastState | null>(null)
  const [activeTab, setActiveTab] =
  useState<'stock' | 'users' | 'plasma' | 'blood' | 'zones'>('stock')

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  // ── Load settings ──
  useEffect(() => {
    settingsService.getSettings().then((data: any) => {
      if (data?.minimumStock) setMinimumStock(data.minimumStock as MinimumStock)
    }).catch(() => {})
  }, [])

  // ── Load users ──
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const data = await settingsService.getUsers()
      setUsers(data)
    } catch { setUsers([]) }
    finally { setLoadingUsers(false) }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  // ── Save minimum stock ──
  const handleSaveMinimumStock = async () => {
    setSavingSettings(true)
    try {
      await settingsService.updateMinimumStock(minimumStock)
      setToast({ type: 'success', msg: 'บันทึกค่าขั้นต่ำสำเร็จ' })
    } catch (err: any) {
      setToast({ type: 'error', msg: err?.message || 'เกิดข้อผิดพลาด' })
    } finally { setSavingSettings(false) }
  }

  const handleMinStockChange = (group: keyof MinimumStock, value: string) => {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 0) return
    setMinimumStock((prev) => ({ ...prev, [group]: num }))
  }

  // ── Create user ──
  const handleCreateUser = async () => {
    if (!userForm.username.trim() || !userForm.name.trim() || !userForm.password) {
      setToast({ type: 'error', msg: 'กรุณากรอกข้อมูลให้ครบ' })
      return
    }
    setSavingUser(true)
    try {
      await settingsService.createUser(userForm)
      setToast({ type: 'success', msg: `เพิ่มผู้ใช้ "${userForm.username}" สำเร็จ` })
      setUserForm(DEFAULT_USER_FORM)
      setShowUserForm(false)
      loadUsers()
    } catch (err: any) {
      setToast({ type: 'error', msg: err?.message || 'เกิดข้อผิดพลาด' })
    } finally { setSavingUser(false) }
  }

  // ── Toggle user active ──
  const handleToggleActive = async (user: UserItem) => {
    try {
      await settingsService.updateUser(user.id, { active: !user.active })
      setToast({ type: 'success', msg: `${user.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'} "${user.name}" สำเร็จ` })
      loadUsers()
    } catch (err: any) {
      setToast({ type: 'error', msg: err?.message || 'เกิดข้อผิดพลาด' })
    }
  }

  const handleUserFormChange = (field: keyof UserFormData, value: string) => {
    setUserForm((f) => ({ ...f, [field]: value }))
  }

  const dismissToast = () => setToast(null)

  return {
    activeTab, setActiveTab,
    minimumStock, savingSettings,
    handleMinStockChange, handleSaveMinimumStock,
    users, loadingUsers,
    showUserForm, setShowUserForm,
    userForm, savingUser,
    handleUserFormChange, handleCreateUser, handleToggleActive,
    toast, dismissToast,
    notify: setToast,            // เพิ่ม

  }
}
