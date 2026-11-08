// src/lib/extPin.ts — PIN hash, verify, lock logic

import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const MAX_FAILS = 5
const LOCK_MINUTES = 15

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10)
}

export async function verifyPin(userId: string, pin: string): Promise<{ ok: boolean; remaining?: number; locked?: boolean; lockedUntil?: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { pinHash: true, pinFailCount: true, pinLockedUntil: true } })
  if (!user || !user.pinHash) return { ok: false, remaining: 0 }

  // Check lock
  if (user.pinLockedUntil && user.pinLockedUntil > new Date()) {
    return { ok: false, locked: true, lockedUntil: user.pinLockedUntil.toISOString() }
  }

  const match = await bcrypt.compare(pin, user.pinHash)

  if (match) {
    // Reset fail count
    if (user.pinFailCount > 0) {
      await prisma.user.update({ where: { id: userId }, data: { pinFailCount: 0, pinLockedUntil: null } })
    }
    return { ok: true }
  }

  // Increment fail
  const newCount = user.pinFailCount + 1
  const data: any = { pinFailCount: newCount }

  if (newCount >= MAX_FAILS) {
    data.pinLockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
    data.pinFailCount = 0
  }

  await prisma.user.update({ where: { id: userId }, data })

  if (newCount >= MAX_FAILS) {
    return { ok: false, locked: true, lockedUntil: data.pinLockedUntil.toISOString() }
  }

  return { ok: false, remaining: MAX_FAILS - newCount }
}
