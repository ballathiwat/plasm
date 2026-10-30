// src/middleware/auth.ts
// JWT authentication middleware (httpOnly cookie)

import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthPayload {
  id: string
  username: string
  role: 'ADMIN' | 'STAFF'
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET is required')

export const AUTH_COOKIE = 'plasm_token'
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000 // 8 ชม. ให้ตรงกับ expiresIn

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'strict' as const,
  path: '/',
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '8h' })
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE, token, { ...authCookieOptions, maxAge: TOKEN_TTL_MS })
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE, authCookieOptions)
}

export function authGuard(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE]
  if (!token) {
    res.status(401).json({ message: 'ไม่ได้เข้าสู่ระบบ' })
    return
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET!) as AuthPayload
    next()
  } catch {
    clearAuthCookie(res)
    res.status(401).json({ message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่' })
  }
}

export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ message: 'สิทธิ์ไม่เพียงพอ' })
    return
  }
  next()
}