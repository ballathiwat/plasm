// src/lib/extUpload.ts — multer config for ext attachments

import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import fs from 'fs'

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads/ext'))
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = crypto.randomBytes(16).toString('hex')
    cb(null, `${name}${ext}`)
  },
})

export const extUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    cb(null, allowed.includes(file.mimetype))
  },
})

// ── รูปที่เพิ่มหลังอนุมัติ: รับเฉพาะรูป jpg / jpeg / png / webp ──
export const EXT_MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB (ค่าเดียวกับ extUpload)
export const EXT_MAX_FILES = 10
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp']
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp']
export const EXT_IMAGE_ONLY_MESSAGE = 'รับเฉพาะไฟล์รูป jpg, jpeg, png, webp'

export const extImageUpload = multer({
  storage,
  limits: { fileSize: EXT_MAX_FILE_SIZE, files: EXT_MAX_FILES },
  fileFilter: (_req, file, cb) => {
    const ok = IMAGE_MIMES.includes(file.mimetype) &&
      IMAGE_EXTS.includes(path.extname(file.originalname).toLowerCase())
    if (ok) cb(null, true)
    else cb(new Error(EXT_IMAGE_ONLY_MESSAGE))
  },
})

/** ตรวจ signature ของไฟล์จริง (กันการปลอม mimetype/นามสกุล) */
export function isRealImageFile(absPath: string): boolean {
  let fd: number | null = null
  try {
    fd = fs.openSync(absPath, 'r')
    const b = Buffer.alloc(12)
    if (fs.readSync(fd, b, 0, 12, 0) < 12) return false
    const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
    const png = b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    const webp = b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP'
    return jpeg || png || webp
  } catch (e) {
    console.error('isRealImageFile', e)
    return false
  } finally {
    if (fd !== null) fs.closeSync(fd)
  }
}

/** ลบไฟล์ที่ multer เขียนลงดิสก์ไปแล้ว เมื่อคำขอถูกปฏิเสธ */
export function discardUploadedFiles(files: Express.Multer.File[] | undefined): void {
  for (const f of files ?? []) {
    fs.unlink(f.path, (err) => {
      if (err && err.code !== 'ENOENT') console.error('discardUploadedFiles', f.path, err)
    })
  }
}
