// ============================================================
//  src/routes/users.ts
// ============================================================

import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { adminOnly } from '../middleware/auth'
import { validatePassword } from '../lib/passwordValidation'

const router = Router()

// ===== GET /api/v1/users =====
router.get('/', adminOnly, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(users.map((u) => ({
      ...u,
      role: u.role.toLowerCase(),
      createdAt: u.createdAt.toISOString(),
    })))
  } catch (error) {
    console.error('GET /users error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== POST /api/v1/users =====
router.post('/', adminOnly, async (req, res) => {
  try {
    const { username, password, name, role } = req.body

    if (!username || !password || !name) {
      res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' })
      return
    }

    // Validate password
    const pwError = validatePassword(password)
    if (pwError) {
      res.status(400).json({ message: pwError })
      return
    }

    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      res.status(409).json({ message: `ชื่อผู้ใช้ "${username}" มีอยู่แล้ว` })
      return
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        username,
        password: hashed,
        name,
        role: (role || 'STAFF').toUpperCase(),
      },
    })

    res.status(201).json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role.toLowerCase(),
      active: user.active,
    })
  } catch (error) {
    console.error('POST /users error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== PATCH /api/v1/users/:id =====
router.patch('/:id', adminOnly, async (req, res) => {
  try {
    const id = req.params.id as string
    const { name, role, active, password } = req.body

    // Validate password if provided
    if (password) {
      const pwError = validatePassword(password)
      if (pwError) {
        res.status(400).json({ message: pwError })
        return
      }
    }

    const data: any = {}
    if (name !== undefined) data.name = name
    if (role !== undefined) data.role = role.toUpperCase()
    if (active !== undefined) data.active = active
    if (password) data.password = await bcrypt.hash(password, 10)

    const user = await prisma.user.update({
      where: { id },
      data,
    })

    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role.toLowerCase(),
      active: user.active,
    })
  } catch (error) {
    console.error('PATCH /users/:id error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router