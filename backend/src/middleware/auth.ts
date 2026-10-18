// src/middleware/auth.ts
// JWT authentication middleware

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

const JWT_SECRET = process.env.JWT_SECRET || 'plasm-secret-change-me'

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
}

export function authGuard(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'ไม่ได้เข้าสู่ระบบ' })
    return
  }

  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' })
  }
}

export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ message: 'สิทธิ์ไม่เพียงพอ' })
    return
  }
  next()
}
