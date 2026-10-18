// src/routes/auth.ts

import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { generateToken } from '../middleware/auth'

const router = Router()

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).json({ message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' })
      return
    }

    const user = await prisma.user.findUnique({ where: { username } })

    if (!user || !user.active) {
      res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
      return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
      return
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    })

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// POST /api/v1/auth/logout
router.post('/logout', (_req, res) => {
  // JWT stateless — client ลบ token เอง
  res.json({ message: 'ออกจากระบบสำเร็จ' })
})

export default router
