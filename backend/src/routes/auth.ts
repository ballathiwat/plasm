// ============================================================
//  src/routes/auth.ts
// ============================================================

import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import {
  generateToken,
  authGuard,
  setAuthCookie,
  clearAuthCookie,
} from "../middleware/auth";
import { validatePassword } from "../lib/passwordValidation";

const router = Router();

// ===== POST /api/v1/auth/login =====
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !user.active) {
      res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      return;
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    setAuthCookie(res, token);
    res.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ===== POST /api/v1/auth/logout =====
router.post('/logout', (_req, res) => {
  clearAuthCookie(res)
  res.json({ message: 'ออกจากระบบสำเร็จ' })
})
// ===== PATCH /api/v1/auth/change-password =====
// User เปลี่ยน password ของตัวเอง (ต้อง login แล้ว)
router.patch("/change-password", authGuard, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: "กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่" });
      return;
    }

    // Validate new password
    const pwError = validatePassword(newPassword);
    if (pwError) {
      res.status(400).json({ message: pwError });
      return;
    }

    // Check current password
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: "ไม่พบผู้ใช้" });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      res.status(401).json({ message: "รหัสผ่านเดิมไม่ถูกต้อง" });
      return;
    }

    // Update password
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

export default router;
