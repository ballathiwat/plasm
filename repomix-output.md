This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
````
.github/
  workflows/
    deploy.yml
backend/
  prisma/
    schema.prisma
    seed.ts
  src/
    lib/
      prisma.ts
    middleware/
      auth.ts
    routes/
      auth.ts
      boxes.ts
      log.ts
      settings.ts
      stock.ts
      units.ts
      users.ts
    index.ts
  env.example
  gitignore
  package.json
  tsconfig.json
frontend/
  assets/
    images/
      logo/
        plasm-dark.svg
        plasm-light.svg
        plasm-sm.svg
      sidebar/
        img-1.jpg
      users/
        user-dummy-img.jpg
      auth-bg.jpg
      error.svg
      error500.png
      maintenance.png
      notfound.png
    plasm/
      login/
        login_cover.png
      sidebar/
        icon-plasm.svg
    styles/
      dashboard.css
      design-system.css
    index.ts
  public/
    fonts/
      ibm-plex-sans-thai-latin-400-normal.woff2
      ibm-plex-sans-thai-latin-500-normal.woff2
      ibm-plex-sans-thai-latin-600-normal.woff2
      ibm-plex-sans-thai-latin-700-normal.woff2
      ibm-plex-sans-thai-latin-ext-400-normal.woff2
      ibm-plex-sans-thai-latin-ext-500-normal.woff2
      ibm-plex-sans-thai-latin-ext-600-normal.woff2
      ibm-plex-sans-thai-latin-ext-700-normal.woff2
      ibm-plex-sans-thai-thai-400-normal.woff2
      ibm-plex-sans-thai-thai-500-normal.woff2
      ibm-plex-sans-thai-thai-600-normal.woff2
      ibm-plex-sans-thai-thai-700-normal.woff2
      ibm-plex-sans-thai.css
    favicon.svg
    sidebar-bg.png
  src/
    assets/
      styles/
        dashboard.css
    components/
      layout/
        BottomNav.tsx
        index.ts
        MainLayout.tsx
        Sidebar.tsx
        TopBar.tsx
      shared/
        ContentCard.tsx
        index.ts
        PageHeader.tsx
        StatusBadge.tsx
        SummaryCards.tsx
    helpers/
      http/
        apiAdapter.ts
        axiosInstance.ts
        types.ts
      services/
        authService.ts
      api_helper.ts
      backend_helper.ts
      url_helper.ts
    pages/
      auth/
        LoginPage.tsx
      dashboard/
        components/
          DashboardAlerts.tsx
          DashboardCharts.tsx
          DashboardHero.tsx
          DashboardRecentActivity.tsx
          DashboardStockCards.tsx
        services/
          DashboardService.ts
          DashboardType.ts
          useDashboard.ts
        index.tsx
      log/
        components/
          LogFiltersBar.tsx
          LogTable.tsx
        services/
          LogService.ts
          LogType.ts
          useLog.ts
        index.tsx
      map/
        components/
          MapCabinetGrid.tsx
          MapRoomGrid.tsx
        services/
          MapService.ts
          MapType.ts
          useMap.ts
        index.tsx
      search/
        components/
          SearchBar.tsx
          SearchResults.tsx
        services/
          SearchService.ts
          SearchType.ts
          useSearch.ts
        index.tsx
        SearchPage.tsx
      settings/
        components/
          SettingsMinStock.tsx
          SettingsUsers.tsx
        services/
          SettingsService.ts
          SettingsType.ts
          useSettings.ts
        index.tsx
      storage/
        components/
          BarcodeLabel.tsx
          StorageBoxList.tsx
          StorageNewBoxForm.tsx
          StorageToast.tsx
        services/
          StorageService.ts
          StorageType.ts
          useStorage.ts
        index.tsx
      withdraw/
        components/
          WithdrawBoxDetail.tsx
          WithdrawBoxList.tsx
          WithdrawConfirmModal.tsx
        services/
          useWithdraw.ts
          WithdrawService.ts
          WithdrawType.ts
        index.tsx
        WithdrawPage.tsx
    Routes/
      allRoutes.tsx
      AuthProtected.tsx
      index.tsx
    types/
      models.ts
      navigation.ts
    App.tsx
    globals.css
    index.css
    main.tsx
  .gitignore
  index.html
  package.json
  README.md
  tailwind.config.ts
  tsconfig.app.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
.gitignore
README.md
````

# Files

## File: backend/prisma/schema.prisma
````prisma
// prisma/schema.prisma
// Plasm — ระบบจัดการคลังพลาสมา

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===== ผู้ใช้ระบบ =====
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String
  name      String
  role      Role     @default(STAFF)
  active    Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  logs LogEntry[]

  @@map("users")
}

enum Role {
  ADMIN
  STAFF
}

// ===== กล่องพลาสมา =====
model Box {
  id             String          @id @default(cuid())
  boxLabel       String          @unique @map("box_label")
  type           PlasmaType      @default(FFP)
  blood          BloodGroup
  location       StorageLocation
  shelf          String
  collectionDate DateTime        @map("collection_date") @db.Date
  status         BoxStatus       @default(STORED)
  storedAt       DateTime        @default(now()) @map("stored_at")
  withdrawnAt    DateTime?       @map("withdrawn_at")
  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at")

  units Unit[]
  logs  LogEntry[]

  @@index([blood, status])
  @@index([location, shelf])
  @@map("boxes")
}

enum PlasmaType {
  FFP
  Cryo
}

enum BloodGroup {
  A
  B
  O
  AB
}

enum StorageLocation {
  ROOM
  CABINET
}

enum BoxStatus {
  STORED
  WITHDRAWN
}

// ===== หน่วยพลาสมา (Unit) ในกล่อง =====
model Unit {
  id         String     @id @default(cuid())
  unitNumber String     @unique @map("unit_number")
  boxId      String     @map("box_id")
  status     UnitStatus @default(STORED)
  createdAt  DateTime   @default(now()) @map("created_at")

  box Box @relation(fields: [boxId], references: [id])

  @@index([unitNumber])
  @@map("units")
}

enum UnitStatus {
  STORED
  WITHDRAWN
}

// ===== ประวัติการทำงาน =====
model LogEntry {
  id        String    @id @default(cuid())
  action    LogAction
  boxId     String?   @map("box_id")
  detail    String
  userId    String?   @map("user_id")
  timestamp DateTime  @default(now())
  createdAt DateTime  @default(now()) @map("created_at")

  box  Box?  @relation(fields: [boxId], references: [id])
  user User? @relation(fields: [userId], references: [id])

  @@index([timestamp(sort: Desc)])
  @@map("log_entries")
}

enum LogAction {
  STORE
  WITHDRAW
}

// ===== ตั้งค่าระบบ =====
model Setting {
  id    String @id @default(cuid())
  key   String @unique
  value Json

  @@map("settings")
}
````

## File: backend/prisma/seed.ts
````typescript
// prisma/seed.ts
// Seed ข้อมูลเริ่มต้น: admin user, settings, sample boxes

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ===== 1. สร้าง Admin user =====
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      name: 'ผู้ดูแลระบบ',
      role: 'ADMIN',
    },
  })
  console.log(`✅ Admin user: ${admin.username}`)

  // ===== 2. สร้าง Staff user =====
  const staffPassword = await bcrypt.hash('staff123', 10)
  const staff = await prisma.user.upsert({
    where: { username: 'staff' },
    update: {},
    create: {
      username: 'staff',
      password: staffPassword,
      name: 'เจ้าหน้าที่',
      role: 'STAFF',
    },
  })
  console.log(`✅ Staff user: ${staff.username}`)

  // ===== 3. ตั้งค่า Minimum Stock =====
  await prisma.setting.upsert({
    where: { key: 'minimumStock' },
    update: {},
    create: {
      key: 'minimumStock',
      value: { A: 150, B: 300, O: 300, AB: 100 },
    },
  })
  console.log('✅ Minimum stock settings')

  // ===== 4. ตั้งค่า Shelf Positions =====
  await prisma.setting.upsert({
    where: { key: 'shelfPositions' },
    update: {},
    create: {
      key: 'shelfPositions',
      value: {
        room: ['M1', 'R1', 'R2', 'R3', 'L1', 'L2', 'L3'],
        cabinet: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
      },
    },
  })
  console.log('✅ Shelf positions settings')

  // ===== 5. Sample Boxes + Units =====
  const sampleBoxes = [
    {
      boxLabel: 'FFP-A-0001',
      type: 'FFP' as const,
      blood: 'A' as const,
      location: 'ROOM' as const,
      shelf: 'M1',
      collectionDate: new Date('2024-10-01'),
      units: ['A001', 'A002', 'A003', 'A004', 'A005', 'A006', 'A007', 'A008'],
    },
    {
      boxLabel: 'FFP-B-0002',
      type: 'FFP' as const,
      blood: 'B' as const,
      location: 'ROOM' as const,
      shelf: 'R1',
      collectionDate: new Date('2024-10-02'),
      units: ['B001', 'B002', 'B003', 'B004', 'B005', 'B006', 'B007', 'B008', 'B009', 'B010'],
    },
    {
      boxLabel: 'FFP-O-0003',
      type: 'FFP' as const,
      blood: 'O' as const,
      location: 'ROOM' as const,
      shelf: 'L1',
      collectionDate: new Date('2024-10-03'),
      units: ['O001', 'O002', 'O003', 'O004', 'O005', 'O006', 'O007', 'O008'],
    },
    {
      boxLabel: 'FFP-AB-0004',
      type: 'FFP' as const,
      blood: 'AB' as const,
      location: 'CABINET' as const,
      shelf: 'C1',
      collectionDate: new Date('2024-10-04'),
      units: ['AB001', 'AB002', 'AB003', 'AB004', 'AB005'],
    },
  ]

  for (const box of sampleBoxes) {
    const existing = await prisma.box.findUnique({ where: { boxLabel: box.boxLabel } })
    if (existing) continue

    await prisma.box.create({
      data: {
        boxLabel: box.boxLabel,
        type: box.type,
        blood: box.blood,
        location: box.location,
        shelf: box.shelf,
        collectionDate: box.collectionDate,
        status: 'STORED',
        units: {
          create: box.units.map((u) => ({ unitNumber: u })),
        },
        logs: {
          create: {
            action: 'STORE',
            detail: `จัดเก็บกล่อง ${box.boxLabel} จำนวน ${box.units.length} units`,
            userId: admin.id,
          },
        },
      },
    })
    console.log(`✅ Box: ${box.boxLabel} (${box.units.length} units)`)
  }

  console.log('\n🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
````

## File: backend/src/lib/prisma.ts
````typescript
// src/lib/prisma.ts
// Prisma Client singleton — ป้องกันสร้างหลาย instance ตอน dev

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
````

## File: backend/src/middleware/auth.ts
````typescript
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
````

## File: backend/src/routes/auth.ts
````typescript
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
````

## File: backend/src/routes/log.ts
````typescript
// src/routes/log.ts

import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// ===== GET /api/v1/log =====
router.get('/', async (req, res) => {
  try {
    const { action, blood, limit = '50', offset = '0' } = req.query

    const where: Record<string, unknown> = {}
    if (action) where.action = (action as string).toUpperCase()
    if (blood) {
      where.box = { blood: (blood as string).toUpperCase() }
    }

    const entries = await prisma.logEntry.findMany({
      where,
      include: {
        box: { select: { boxLabel: true, type: true, blood: true, location: true, shelf: true } },
        user: { select: { name: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    })

    const result = entries.map((e) => ({
      id: e.id,
      action: e.action.toLowerCase(),
      boxLabel: e.box?.boxLabel || '-',
      type: e.box?.type || 'FFP',
      blood: e.box?.blood || '-',
      units: [],
      location: e.box?.location?.toLowerCase(),
      shelf: e.box?.shelf,
      timestamp: e.timestamp.toISOString(),
      detail: e.detail,
      performedBy: e.user?.name,
    }))

    res.json(result)
  } catch (error) {
    console.error('GET /log error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router
````

## File: backend/src/routes/settings.ts
````typescript
// src/routes/settings.ts

import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { adminOnly } from '../middleware/auth'

const router = Router()

// ===== GET /api/v1/settings =====
router.get('/', async (_req, res) => {
  try {
    const settings = await prisma.setting.findMany()

    const result: Record<string, unknown> = {}
    for (const s of settings) {
      result[s.key] = s.value
    }

    res.json(result)
  } catch (error) {
    console.error('GET /settings error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== PUT /api/v1/settings =====
router.put('/', adminOnly, async (req, res) => {
  try {
    const { minimumStock, shelfPositions } = req.body

    if (minimumStock) {
      await prisma.setting.upsert({
        where: { key: 'minimumStock' },
        update: { value: minimumStock },
        create: { key: 'minimumStock', value: minimumStock },
      })
    }

    if (shelfPositions) {
      await prisma.setting.upsert({
        where: { key: 'shelfPositions' },
        update: { value: shelfPositions },
        create: { key: 'shelfPositions', value: shelfPositions },
      })
    }

    res.json({ message: 'บันทึกการตั้งค่าสำเร็จ' })
  } catch (error) {
    console.error('PUT /settings error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router
````

## File: backend/env.example
````
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/plasm?schema=public"

# JWT
JWT_SECRET="plasm-secret-change-this-in-production"

# Server
PORT=3000
CORS_ORIGIN="http://localhost:5173"
````

## File: backend/gitignore
````
node_modules/
dist/
.env
*.log
````

## File: backend/tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "prisma"]
}
````

## File: frontend/assets/images/logo/plasm-dark.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 36">
  <rect width="36" height="36" rx="8" fill="#2563eb"/>
  <text x="18" y="25" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="22" fill="#fff">P</text>
  <text x="48" y="26" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="22" fill="#1e293b">Plasm</text>
</svg>
````

## File: frontend/assets/images/logo/plasm-light.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 36">
  <rect width="36" height="36" rx="8" fill="rgba(255,255,255,0.15)"/>
  <text x="18" y="25" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="22" fill="#fff">P</text>
  <text x="48" y="26" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="22" fill="#fff">Plasm</text>
</svg>
````

## File: frontend/assets/images/logo/plasm-sm.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
  <rect width="36" height="36" rx="8" fill="#2563eb"/>
  <text x="18" y="25" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="22" fill="#fff">P</text>
</svg>
````

## File: frontend/assets/images/error.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 1080"><defs><style>.cls-1,.cls-4,.cls-6{fill:#e1ecff;}.cls-2{isolation:isolate;}.cls-3{fill:#c7dcf9;}.cls-11,.cls-14,.cls-4,.cls-6{mix-blend-mode:multiply;}.cls-5{clip-path:url(#clip-path);}.cls-6{opacity:0.51;}.cls-7{fill:#1c3177;}.cls-11,.cls-8{fill:#ff97c9;}.cls-9{fill:#fec272;}.cls-10{fill:#fff;opacity:0.48;mix-blend-mode:soft-light;}.cls-11{opacity:0.5;}.cls-12,.cls-13,.cls-14{fill:#99adf9;}.cls-13{opacity:0.44;}.cls-14{opacity:0.64;}</style><clipPath id="clip-path"><path class="cls-1" d="M555.73,633.88s69.93.45,89.58,5.47,71.66,122.73,93.18,134S778.29,765.9,802,752s45.44-30.72,46.12-37.74-9.39-35.07-18.1-40.73-34-6.06-47.49,2.58c-19.82-54-48-132.75-73.84-143.59s-104.15-16-104.15-16Z"/></clipPath></defs><g class="cls-2"><g id="Layer_3" data-name="Layer 3"><path class="cls-3" d="M289.08,381.9s-34,13.45-39,46.12,72.26,128.37,72.26,128.37L560.6,428,485.27,295.8Z"/><path class="cls-1" d="M341.76,412.78S316.69,438.52,309,467s-8.68,79.34-7.4,98.39C339,600,486.83,571,486.83,571L629.29,403.42S605.14,357.57,592.88,345s-52-28.2-97.85-9.75C468.12,373.44,341.76,412.78,341.76,412.78Z"/><path class="cls-4" d="M330.57,426.09s55.31,17.75,117.57-6.3S521.68,328,521.68,328L495,335.26,341.76,412.78Z"/><path class="cls-1" d="M555.73,633.88s69.93.45,89.58,5.47,71.66,122.73,93.18,134S778.29,765.9,802,752s45.44-30.72,46.12-37.74-9.39-35.07-18.1-40.73-34-6.06-47.49,2.58c-19.82-54-48-132.75-73.84-143.59s-104.15-16-104.15-16Z"/><g class="cls-5"><path class="cls-6" d="M629.29,582.34s56.94,6.23,72.67,27.42,46.9,150.85,81.79,153.92c.56,42-71.7,57.17-71.7,57.17L538.84,628.39Z"/></g><path class="cls-1" d="M367.85,623.26s43,90.19,82,114.79S559.51,760.66,579,776.77s15.37,93.5,34.85,114,46.89,33.06,72.51,30.75,46.12-14.6,46.38-26.13-.77-21.53-12.81-27.68-29-11.27-29.73-18.44-14.35-116.33-20-146-49.53-70.94-106.08-91.73c-53.55-44.84-135.8-25.63-135.8-25.63Z"/><path class="cls-4" d="M380.36,647.39s49.35,2.52,93.67-16.95c-8.47-45.1-34.6-58.42-34.6-58.42l-71.58,51.24Z"/><path class="cls-1" d="M448.65,176.4C410,155.71,329,148.73,279,210.74S253.92,337.06,274.93,367c22,31.42,97.62,79.44,178.33,34.34S542.43,226.62,448.65,176.4Z"/><path class="cls-7" d="M442,214.32c34.33,8.2,56.63,56.37,45.1,102.49s-51.25,77.13-95.83,77.38S302.36,364,302.6,307.08C302.84,252.38,367.45,196.52,442,214.32Z"/><path class="cls-4" d="M343.09,574.58c44.73-20.76,11.27-68.16,55.86-78.94C457.74,504,474,501,474,501S361.53,599.78,343.09,574.58Z"/><polygon class="cls-8" points="380.36 447.8 454.8 639.35 560.11 636.84 656.45 575.86 685.15 488.74 615.46 279.66 581.63 377.54 494 447.23 380.36 447.8"/><path class="cls-1" d="M343.09,574.58c24.68-2,37.25-18.07,44.73-25.2,3.81-3.64,3.05-6.83,1.13-17.33s4.74-21.27,13.84-25.88c5,13.45,11.14,16,15.88,15.37s9.61-28.95,25.11-28.7,27.93,20.76,30,31-7.94,39.45-20.5,59.95S423,629.67,383.11,637.61s-62.57-12.43-75.64-38.18c-4.41-8.69-6-20.7-5.86-34.08C301.61,565.35,310.54,577.14,343.09,574.58Z"/><path class="cls-1" d="M639.46,351.67s4.75,15.45,1.55,21.47-7.56,11-10.76,18.71,1.54,36.77,15.63,41.76,25.75-8.07,29.47-15.63,1.66-27.41-3.85-41.25S655.63,350.59,639.46,351.67Z"/><path class="cls-9" d="M655.66,159.71l3.16,6.4a2.65,2.65,0,0,0,2,1.46l7.07,1a2.67,2.67,0,0,1,1.48,4.56l-5.11,5a2.66,2.66,0,0,0-.77,2.36l1.2,7a2.67,2.67,0,0,1-3.87,2.82l-6.33-3.32a2.65,2.65,0,0,0-2.48,0l-6.33,3.32a2.67,2.67,0,0,1-3.88-2.82l1.21-7a2.66,2.66,0,0,0-.77-2.36l-5.11-5a2.67,2.67,0,0,1,1.48-4.56l7.07-1a2.65,2.65,0,0,0,2-1.46l3.16-6.4A2.68,2.68,0,0,1,655.66,159.71Z"/><path class="cls-9" d="M317.34,837l2.65,5.37a2.2,2.2,0,0,0,1.68,1.22l5.93.86a2.24,2.24,0,0,1,1.24,3.82l-4.29,4.18a2.22,2.22,0,0,0-.64,2l1,5.9a2.25,2.25,0,0,1-3.25,2.37l-5.3-2.79a2.25,2.25,0,0,0-2.08,0L309,862.7a2.24,2.24,0,0,1-3.25-2.37l1-5.9a2.26,2.26,0,0,0-.65-2l-4.28-4.18a2.24,2.24,0,0,1,1.24-3.82l5.92-.86a2.23,2.23,0,0,0,1.69-1.22l2.65-5.37A2.24,2.24,0,0,1,317.34,837Z"/><ellipse class="cls-10" cx="408.56" cy="256.06" rx="45.63" ry="16.14" transform="translate(-45.54 93.94) rotate(-12.43)"/><path class="cls-4" d="M468.08,552.56s-28.31-25.3-33.44-25.3-18.79,20-15.71,25.3,18.9,22.66,36.27,28C460.83,569.82,468.08,552.56,468.08,552.56Z"/><polygon class="cls-11" points="494 447.23 560.11 636.84 656.45 575.86 581.63 377.54 494 447.23"/><path class="cls-4" d="M675.87,739.49a123,123,0,0,1-33,19.57c-11.21,4.32-15,13.16-11.61,29.38s5.29,41.51,12.29,48.17,31.08,3.12,43.56-12.36C683.2,793.75,675.87,739.49,675.87,739.49Z"/><path class="cls-4" d="M741.12,574.12s-14,6.1-12.67,15.83,15.63,56.76,21.27,61,22.33-3.28,22.33-3.28C754.91,599.11,741.12,574.12,741.12,574.12Z"/><path class="cls-12" d="M150.32,686.66c-11.13-23.08,25.14-47.78,56-46s43.83,30.27,54.76,40.9c22.83,22.18,22.11,43.88,6.3,53.21S165.05,717.19,150.32,686.66Z"/><path class="cls-12" d="M772.88,329.11c-9-7.88.26-44.92,21.52-53.59s47.66.81,53.3,15.67S791.33,345.25,772.88,329.11Z"/><path class="cls-12" d="M877.06,348.93c-4.61,6.57-7.68,25.28,2.05,28.61s17.09-15.92,13.67-25.94S880.14,344.54,877.06,348.93Z"/><path class="cls-13" d="M884.06,197.1c-7.26,3.42-19.23,18.12-12.43,25.85s22.73-5.33,24.74-15.72S888.91,194.82,884.06,197.1Z"/><path class="cls-13" d="M201.38,783.77c-6.28-5-24.75-9.25-28.69.26s14.82,18,25,15.26S205.56,787.11,201.38,783.77Z"/><path class="cls-14" d="M255.61,675.23c-11.17,2.1-9.37,12.09-5.79,21.14S266,708,274.89,699.73C269.12,686,255.61,675.23,255.61,675.23Z"/><path class="cls-14" d="M191.4,660.16c-8,.89-14.52,12.47-8.88,21.86s16.39,16.23,22.54,13.67,7.18-16.4,2.74-25.28S199.09,659.3,191.4,660.16Z"/><path class="cls-14" d="M822.74,283.5c-4.39,1.4-8.84,6.15-8.45,11.28s4.87,9.61,9.73,9,9-8.46,8-14.1S826.09,282.44,822.74,283.5Z"/><path class="cls-14" d="M776.25,293.5s6,6,5,12.81-11.34,6.18-11.34,6.18S771.45,300.88,776.25,293.5Z"/></g></g></svg>
````

## File: frontend/assets/plasm/sidebar/icon-plasm.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
  <rect width="36" height="36" rx="8" fill="rgba(255,255,255,0.15)"/>
  <text x="18" y="25" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="22" fill="#fff">P</text>
</svg>
````

## File: frontend/assets/styles/dashboard.css
````css
/* frontend/assets/styles/dashboard.css */

/* ── Animations ── */
@keyframes plasm-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes plasm-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes plasm-rise {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

.dashboard {
  animation: plasm-fade-in 0.2s ease;
}

/* ═══ Hero Banner ═══ */
.hero {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg, 10px);
  background: var(--primary, #2563EB);
  color: #fff;
  padding: 28px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.hero__circle-1 {
  position: absolute;
  right: -40px;
  top: -60px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}
.hero__circle-2 {
  position: absolute;
  right: 120px;
  bottom: -80px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}
.hero__content {
  position: relative;
  flex: 1 1 320px;
}
.hero__greeting {
  font-size: 14px;
  opacity: 0.85;
}
.hero__title {
  font-weight: 700;
  font-size: 28px;
  line-height: 1.3;
  margin-top: 6px;
}
.hero__updated {
  font-size: 13px;
  margin-top: 8px;
  opacity: 0.8;
}
.hero__actions {
  position: relative;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.hero__btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: var(--radius-sm, 6px);
  border: none;
  background: #fff;
  color: var(--primary, #2563EB);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}
.hero__btn-outline {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: var(--radius-sm, 6px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: transparent;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

/* ═══ Alert Banners ═══ */
.alerts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--radius-md, 8px);
}
.alert--danger {
  background: #FEF2F2;
  border: 1px solid #FECACA;
}
.alert--danger .alert__text {
  font-size: 13px;
  font-weight: 500;
  color: #991B1B;
}
.alert--warning {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
}
.alert--warning .alert__text {
  font-size: 13px;
  font-weight: 500;
  color: #92400E;
}

/* ═══ Stock Cards Grid ═══ */
.stock-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.stock-card {
  background: var(--surface, #fff);
  border: 1px solid var(--border, #E4E4E7);
  border-radius: var(--radius-lg, 10px);
  padding: 16px 20px;
  box-shadow: var(--shadow-sm);
}
.stock-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.stock-card__group-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.stock-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
}
.stock-card__group-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #18181B);
}
.stock-card__trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
}
.stock-card__trend--up { color: #10B981; }
.stock-card__trend--down { color: #EF4444; }
.stock-card__count {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--text-primary, #18181B);
  margin-bottom: 6px;
}
.stock-card__status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.stock-card__status-text {
  font-size: 12px;
  font-weight: 500;
}
.stock-card__min-text {
  font-size: 12px;
  color: var(--text-secondary, #71717A);
}
.stock-card__progress {
  height: 6px;
  border-radius: 99px;
  background: var(--surface-raised, #F4F4F5);
}
.stock-card__progress-bar {
  height: 100%;
  border-radius: 99px;
  transform-origin: left;
  animation: plasm-grow 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* ═══ Charts Row ═══ */
.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

/* ── Card (shared) ── */
.card {
  background: var(--surface, #fff);
  border: 1px solid var(--border, #E4E4E7);
  border-radius: var(--radius-lg, 10px);
  box-shadow: var(--shadow-sm);
  padding: 20px;
}
.card__title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 20px;
}

/* ── Stock vs Min chart ── */
.stock-bar-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.stock-bar-row {
  display: grid;
  grid-template-columns: 40px 1fr 50px 80px;
  align-items: center;
  gap: 10px;
}
.stock-bar-row__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
}
.stock-bar-row__track {
  position: relative;
  height: 14px;
  border-radius: 99px;
  background: var(--surface-raised, #F4F4F5);
}
.stock-bar-row__fill {
  height: 100%;
  border-radius: 99px;
  transform-origin: left;
  animation: plasm-grow 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.stock-bar-row__min-line {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 2px;
  background: var(--text-primary, #18181B);
  border-radius: 1px;
}
.stock-bar-row__value {
  font-size: 14px;
  font-weight: 600;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.stock-bar-row__level {
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  padding: 3px 8px;
  border-radius: 99px;
}
.stock-bar-row__level--danger { background: #FEF2F2; color: #DC2626; }
.stock-bar-row__level--warning { background: #FFFBEB; color: #D97706; }
.stock-bar-row__level--normal { background: #F0FDF4; color: #16A34A; }
.stock-bar-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  font-size: 12px;
  color: var(--text-secondary, #71717A);
}
.stock-bar-legend__line {
  width: 2px;
  height: 12px;
  background: var(--text-primary, #18181B);
}

/* ── 7-Day Bar Chart ── */
.week-chart {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 160px;
}
.week-chart__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  height: 100%;
  justify-content: flex-end;
}
.week-chart__value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}
.week-chart__bar {
  width: 100%;
  max-width: 48px;
  border-radius: 6px 6px 2px 2px;
  background: var(--group-a-surface, #DBEAFE);
  transform-origin: bottom;
}
.week-chart__bar--active {
  background: var(--primary, #2563EB);
}
.week-chart__label {
  font-size: 11px;
  color: var(--text-secondary);
}

/* ═══ Recent Activity ═══ */
.activity__title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 14px;
}
.activity__header,
.activity__row {
  display: grid;
  grid-template-columns: 120px 100px 140px 70px 60px 1fr;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border, #E4E4E7);
}
.activity__header {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #71717A);
}
.activity__row {
  font-size: 13px;
  align-items: center;
  padding: 10px 0;
}
.activity__time {
  color: var(--text-secondary);
}
.activity__action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}
.activity__action--store { color: #16A34A; }
.activity__action--withdraw { color: #DC2626; }
.activity__box-label {
  font-family: var(--font-mono);
  font-weight: 600;
}
.activity__blood-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 22px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
}
.activity__units {
  font-variant-numeric: tabular-nums;
}
.activity__detail {
  color: var(--text-secondary);
  font-size: 13px;
}
.activity__empty {
  padding: 24px;
  text-align: center;
  color: var(--text-secondary);
}
````

## File: frontend/assets/styles/design-system.css
````css
/* frontend/src/assets/styles/design-system.css */
/* Plasm Design System — CSS Custom Properties */

:root {
  /* ── Primary ── */
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --primary-light: #eff6ff;

  /* ── Blood-type Identity Colours ── */
  --blood-a: #dc2626;
  --blood-b: #2563eb;
  --blood-o: #16a34a;
  --blood-ab: #7c3aed;

  /* ── Surfaces ── */
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-hover: #f1f5f9;
  --color-border: #e2e8f0;

  /* ── Text ── */
  --color-text: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;

  /* ── Semantic ── */
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-danger: #dc2626;
  --color-info: #0284c7;

  /* ── Radius ── */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* ── Shadow ── */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* ── Typography ── */
  --font-family: 'IBM Plex Sans Thai', system-ui, -apple-system, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-size-2xl: 22px;
  --font-size-3xl: 28px;

  /* ── Sidebar ── */
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 68px;
  --topbar-height: 56px;
}
````

## File: frontend/assets/index.ts
````typescript
// frontend/src/assets/index.ts

// ── Logo ──
import logoDark from './images/logo/plasm-dark.svg'
import logoLight from './images/logo/plasm-light.svg'
import logoSm from './images/logo/plasm-sm.svg'

// ── Auth & Error pages ──
import authBg from './images/auth-bg.jpg'
import errorSvg from './images/error.svg'
import notfound from './images/notfound.png'
import maintenance from './images/maintenance.png'
import error500 from './images/error500.png'

// ── Users ──
import userDummy from './images/users/user-dummy-img.jpg'

// ── Sidebar ──
import sidebarBg from './images/sidebar/img-1.jpg'

// ── Plasm-specific ──
import loginCover from './plasm/login/login_cover.png'
import sidebarIcon from './plasm/sidebar/icon-plasm.svg'

export {
  // Logo
  logoDark,
  logoLight,
  logoSm,
  // Auth & Error
  authBg,
  errorSvg,
  notfound,
  maintenance,
  error500,
  // Users
  userDummy,
  // Sidebar
  sidebarBg,
  // Plasm-specific
  loginCover,
  sidebarIcon,
}
````

## File: frontend/public/fonts/ibm-plex-sans-thai.css
````css
/* IBM Plex Sans Thai — self-hosted, thai + latin subsets */

/* 400 */
@font-face {
  font-family: 'IBM Plex Sans Thai';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/ibm-plex-sans-thai-thai-400-normal.woff2') format('woff2');
  unicode-range: U+02D7, U+0303, U+0331, U+0E01-0E5B, U+200C-200D, U+25CC;
}
@font-face {
  font-family: 'IBM Plex Sans Thai';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/ibm-plex-sans-thai-latin-ext-400-normal.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'IBM Plex Sans Thai';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/ibm-plex-sans-thai-latin-400-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* 500 */
@font-face {
  font-family: 'IBM Plex Sans Thai';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/ibm-plex-sans-thai-thai-500-normal.woff2') format('woff2');
  unicode-range: U+02D7, U+0303, U+0331, U+0E01-0E5B, U+200C-200D, U+25CC;
}
@font-face {
  font-family: 'IBM Plex Sans Thai';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/ibm-plex-sans-thai-latin-ext-500-normal.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'IBM Plex Sans Thai';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/ibm-plex-sans-thai-latin-500-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* 600 */
@font-face {
  font-family: 'IBM Plex Sans Thai';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/ibm-plex-sans-thai-thai-600-normal.woff2') format('woff2');
  unicode-range: U+02D7, U+0303, U+0331, U+0E01-0E5B, U+200C-200D, U+25CC;
}
@font-face {
  font-family: 'IBM Plex Sans Thai';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/ibm-plex-sans-thai-latin-ext-600-normal.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'IBM Plex Sans Thai';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/ibm-plex-sans-thai-latin-600-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* 700 */
@font-face {
  font-family: 'IBM Plex Sans Thai';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/ibm-plex-sans-thai-thai-700-normal.woff2') format('woff2');
  unicode-range: U+02D7, U+0303, U+0331, U+0E01-0E5B, U+200C-200D, U+25CC;
}
@font-face {
  font-family: 'IBM Plex Sans Thai';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/ibm-plex-sans-thai-latin-ext-700-normal.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'IBM Plex Sans Thai';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/ibm-plex-sans-thai-latin-700-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
````

## File: frontend/public/favicon.svg
````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#C62828"/>
  <text x="16" y="22" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="18" fill="white">P</text>
</svg>
````

## File: frontend/src/assets/styles/dashboard.css
````css
/* frontend/src/assets/styles/dashboard.css */

/* ── Animations ── */
@keyframes plasm-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes plasm-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes plasm-rise {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

.dashboard {
  animation: plasm-fade-in 0.2s ease;
}

/* ═══ Hero Banner ═══ */
.hero {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg, 10px);
  background: var(--primary, #2563EB);
  color: #fff;
  padding: 28px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.hero__circle-1 {
  position: absolute;
  right: -40px;
  top: -60px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}
.hero__circle-2 {
  position: absolute;
  right: 120px;
  bottom: -80px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}
.hero__content {
  position: relative;
  flex: 1 1 320px;
}
.hero__greeting {
  font-size: 14px;
  opacity: 0.85;
}
.hero__title {
  font-weight: 700;
  font-size: 28px;
  line-height: 1.3;
  margin-top: 6px;
}
.hero__updated {
  font-size: 13px;
  margin-top: 8px;
  opacity: 0.8;
}
.hero__actions {
  position: relative;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.hero__btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: var(--radius-sm, 6px);
  border: none;
  background: #fff;
  color: var(--primary, #2563EB);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}
.hero__btn-outline {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: var(--radius-sm, 6px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: transparent;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

/* ═══ Alert Banners ═══ */
.alerts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--radius-md, 8px);
}
.alert--danger {
  background: #FEF2F2;
  border: 1px solid #FECACA;
}
.alert--danger .alert__text {
  font-size: 13px;
  font-weight: 500;
  color: #991B1B;
}
.alert--warning {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
}
.alert--warning .alert__text {
  font-size: 13px;
  font-weight: 500;
  color: #92400E;
}

/* ═══ Stock Cards Grid ═══ */
.stock-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.stock-card {
  background: var(--surface, #fff);
  border: 1px solid var(--border, #E4E4E7);
  border-radius: var(--radius-lg, 10px);
  padding: 16px 20px;
  box-shadow: var(--shadow-sm);
}
.stock-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.stock-card__group-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.stock-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
}
.stock-card__group-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #18181B);
}
.stock-card__trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
}
.stock-card__trend--up { color: #10B981; }
.stock-card__trend--down { color: #EF4444; }
.stock-card__count {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--text-primary, #18181B);
  margin-bottom: 6px;
}
.stock-card__status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.stock-card__status-text {
  font-size: 12px;
  font-weight: 500;
}
.stock-card__min-text {
  font-size: 12px;
  color: var(--text-secondary, #71717A);
}
.stock-card__progress {
  height: 6px;
  border-radius: 99px;
  background: var(--surface-raised, #F4F4F5);
}
.stock-card__progress-bar {
  height: 100%;
  border-radius: 99px;
  transform-origin: left;
  animation: plasm-grow 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* ═══ Charts Row ═══ */
.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

/* ── Card (shared) ── */
.card {
  background: var(--surface, #fff);
  border: 1px solid var(--border, #E4E4E7);
  border-radius: var(--radius-lg, 10px);
  box-shadow: var(--shadow-sm);
  padding: 20px;
}
.card__title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 20px;
}

/* ── Stock vs Min chart ── */
.stock-bar-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.stock-bar-row {
  display: grid;
  grid-template-columns: 40px 1fr 50px 80px;
  align-items: center;
  gap: 10px;
}
.stock-bar-row__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
}
.stock-bar-row__track {
  position: relative;
  height: 14px;
  border-radius: 99px;
  background: var(--surface-raised, #F4F4F5);
}
.stock-bar-row__fill {
  height: 100%;
  border-radius: 99px;
  transform-origin: left;
  animation: plasm-grow 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.stock-bar-row__min-line {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 2px;
  background: var(--text-primary, #18181B);
  border-radius: 1px;
}
.stock-bar-row__value {
  font-size: 14px;
  font-weight: 600;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.stock-bar-row__level {
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  padding: 3px 8px;
  border-radius: 99px;
}
.stock-bar-row__level--danger { background: #FEF2F2; color: #DC2626; }
.stock-bar-row__level--warning { background: #FFFBEB; color: #D97706; }
.stock-bar-row__level--normal { background: #F0FDF4; color: #16A34A; }
.stock-bar-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  font-size: 12px;
  color: var(--text-secondary, #71717A);
}
.stock-bar-legend__line {
  width: 2px;
  height: 12px;
  background: var(--text-primary, #18181B);
}

/* ── 7-Day Bar Chart ── */
.week-chart {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 160px;
}
.week-chart__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  height: 100%;
  justify-content: flex-end;
}
.week-chart__value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}
.week-chart__bar {
  width: 100%;
  max-width: 48px;
  border-radius: 6px 6px 2px 2px;
  background: var(--group-a-surface, #DBEAFE);
  transform-origin: bottom;
}
.week-chart__bar--active {
  background: var(--primary, #2563EB);
}
.week-chart__label {
  font-size: 11px;
  color: var(--text-secondary);
}

/* ═══ Recent Activity ═══ */
.activity__title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 14px;
}
.activity__header,
.activity__row {
  display: grid;
  grid-template-columns: 120px 100px 140px 70px 60px 1fr;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border, #E4E4E7);
}
.activity__header {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #71717A);
}
.activity__row {
  font-size: 13px;
  align-items: center;
  padding: 10px 0;
}
.activity__time {
  color: var(--text-secondary);
}
.activity__action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}
.activity__action--store { color: #16A34A; }
.activity__action--withdraw { color: #DC2626; }
.activity__box-label {
  font-family: var(--font-mono);
  font-weight: 600;
}
.activity__blood-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 22px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
}
.activity__units {
  font-variant-numeric: tabular-nums;
}
.activity__detail {
  color: var(--text-secondary);
  font-size: 13px;
}
.activity__empty {
  padding: 24px;
  text-align: center;
  color: var(--text-secondary);
}
````

## File: frontend/src/components/layout/BottomNav.tsx
````typescript
// frontend/src/components/layout/BottomNav.tsx

import { MOBILE_NAV_ITEMS } from '../../types/navigation'

interface BottomNavProps {
  activeModule: string
  onNavigate: (key: string) => void
}

export default function BottomNav({ activeModule, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="md:hidden flex items-center justify-around flex-none"
      style={{
        height: 56,
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive = activeModule === item.key
        const Icon = item.icon
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: 11,
              fontWeight: isActive ? 600 : 400,
              fontFamily: 'inherit',
            }}
          >
            <Icon size={20} />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
````

## File: frontend/src/components/layout/index.ts
````typescript
export { default as MainLayout } from './MainLayout'
export { default as Sidebar } from './Sidebar'
export { default as TopBar } from './TopBar'
export { default as BottomNav } from './BottomNav'
````

## File: frontend/src/components/shared/ContentCard.tsx
````typescript
// frontend/src/components/shared/ContentCard.tsx

interface ContentCardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export default function ContentCard({ title, children, className = '' }: ContentCardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--space-5)',
      }}
    >
      {title && (
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
````

## File: frontend/src/components/shared/index.ts
````typescript
export { default as PageHeader } from './PageHeader'
export { default as ContentCard } from './ContentCard'
export { default as StatusBadge } from './StatusBadge'
export { default as SummaryCards } from './SummaryCards'
````

## File: frontend/src/components/shared/PageHeader.tsx
````typescript
// frontend/src/components/shared/PageHeader.tsx

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
      <div>
        <h2 style={{ font: "600 26px 'IBM Plex Sans Thai',sans-serif", lineHeight: 1.3 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 14, color: '#5A6A7E', marginTop: 4 }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
````

## File: frontend/src/components/shared/StatusBadge.tsx
````typescript
// frontend/src/components/shared/StatusBadge.tsx

import type { BloodGroup } from '../../types/models'

const BLOOD_STYLES: Record<BloodGroup, { bg: string; color: string }> = {
  A:  { bg: '#fde8e8', color: 'var(--color-blood-a)' },
  B:  { bg: '#dbeafe', color: 'var(--color-blood-b)' },
  O:  { bg: '#d1fae5', color: '#059669' },
  AB: { bg: '#ede9fe', color: 'var(--color-blood-ab)' },
}

interface StatusBadgeProps {
  blood: BloodGroup
  label?: string
}

export default function StatusBadge({ blood, label }: StatusBadgeProps) {
  const s = BLOOD_STYLES[blood]
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: 12,
        fontWeight: 600,
        background: s.bg,
        color: s.color,
      }}
    >
      {label || blood}
    </span>
  )
}
````

## File: frontend/src/components/shared/SummaryCards.tsx
````typescript
// frontend/src/components/shared/SummaryCards.tsx

import type { SummaryCardData } from '../../types/models'

interface SummaryCardsProps {
  cards: SummaryCardData[]
}

export default function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            style={{
              background: '#fff',
              border: '1px solid #DDE3EA',
              borderRadius: 8,
              padding: 20,
              boxShadow: '0 1px 3px rgba(26,35,50,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                }}
              >
                <Icon size={18} />
              </div>
              <span style={{ fontSize: 13, color: '#5A6A7E' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1 }}>{card.value}</div>
            {card.sub && (
              <div style={{ fontSize: 12, color: '#5A6A7E', marginTop: 4 }}>{card.sub}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
````

## File: frontend/src/helpers/http/apiAdapter.ts
````typescript
// frontend/src/helpers/http/apiAdapter.ts
//
// Type-safe HTTP methods: GET, POST, PUT, PATCH, DELETE

import axiosInstance from './axiosInstance'
import type { AxiosRequestConfig } from 'axios'
import type { GetParams, BlobRequestOptions, UploadProgressCallback } from './types'

/* ----------------------------------------------------------
   Helper: build query string
---------------------------------------------------------- */
const buildQueryString = (params: GetParams): string => {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
  return parts.length ? `?${parts.join('&')}` : ''
}

/* ----------------------------------------------------------
   Helper: trigger browser file download
---------------------------------------------------------- */
const downloadBlob = (blob: Blob, filename: string, mimeType?: string): void => {
  const objectUrl = URL.createObjectURL(
    mimeType ? new Blob([blob], { type: mimeType }) : blob,
  )
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}

/* ==========================================================
   ApiAdapter Class
========================================================== */
class ApiAdapter {
  // GET
  async get<T>(url: string, params?: GetParams, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.get<T>(url, { ...config, params })
    return response.data
  }

  // GET by ID
  async getById<T>(url: string, id: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.get<T>(`${url}/${id}`, config)
    return response.data
  }

  // POST
  async post<TBody = unknown, TResponse = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> {
    const response = await axiosInstance.post<TResponse>(url, data, config)
    return response.data
  }

  // PUT
  async put<TBody = unknown, TResponse = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> {
    const response = await axiosInstance.put<TResponse>(url, data, config)
    return response.data
  }

  // PATCH
  async patch<TBody = unknown, TResponse = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> {
    const response = await axiosInstance.patch<TResponse>(url, data, config)
    return response.data
  }

  // DELETE
  async delete<TResponse = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> {
    const response = await axiosInstance.delete<TResponse>(url, config)
    return response.data
  }

  // UPLOAD — multipart/form-data
  async upload<TResponse = unknown>(
    url: string,
    formData: FormData,
    onProgress?: UploadProgressCallback,
  ): Promise<TResponse> {
    const response = await axiosInstance.post<TResponse>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total))
        }
      },
    })
    return response.data
  }

  // BLOB GET — download file
  async downloadFile(
    url: string,
    params?: GetParams,
    options?: BlobRequestOptions,
  ): Promise<Blob> {
    const qs = params ? buildQueryString(params) : ''
    const response = await axiosInstance.get<Blob>(`${url}${qs}`, {
      responseType: 'blob',
    })
    const blob = response.data
    if (options?.filename) {
      downloadBlob(blob, options.filename, options.mimeType)
    }
    return blob
  }
}

/* ----------------------------------------------------------
   Export singleton
---------------------------------------------------------- */
const apiAdapter = new ApiAdapter()
export default apiAdapter
export { ApiAdapter }
````

## File: frontend/src/helpers/http/axiosInstance.ts
````typescript
// frontend/src/helpers/http/axiosInstance.ts
//
// Single Axios instance — config, token injection, interceptors

import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.117:3000'

/* ----------------------------------------------------------
   Create dedicated instance
---------------------------------------------------------- */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* ----------------------------------------------------------
   Request Interceptor — inject Bearer token
---------------------------------------------------------- */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = sessionStorage.getItem('authToken')
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
    return config
  },
  (error) => Promise.reject(error),
)

/* ----------------------------------------------------------
   Response Interceptor — handle errors
   ไม่ redirect เอง — ให้ AuthProtected จัดการ
---------------------------------------------------------- */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        message: error.message ?? 'Network Error',
        statusCode: 0,
      })
    }

    const { status, data } = error.response

    // 401 → ลบ token อย่างเดียว (AuthProtected จัดการ redirect)
    if (status === 401) {
      sessionStorage.removeItem('authToken')
      sessionStorage.removeItem('authUser')
    }

    const errorMessages: Record<number, string> = {
      400: data?.message ?? 'Bad Request',
      401: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      403: 'ไม่มีสิทธิ์เข้าถึง',
      404: 'ไม่พบข้อมูลที่ร้องขอ',
      409: data?.message ?? 'ข้อมูลซ้ำ',
      500: 'Internal Server Error',
    }

    return Promise.reject({
      message: errorMessages[status] ?? data?.message ?? 'Unexpected Error',
      statusCode: status,
      errors: data?.errors,
    })
  },
)

/* ----------------------------------------------------------
   Helper: update/clear token
---------------------------------------------------------- */
export const setInstanceToken = (token: string): void => {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export const clearInstanceToken = (): void => {
  delete axiosInstance.defaults.headers.common['Authorization']
}

export default axiosInstance
````

## File: frontend/src/helpers/http/types.ts
````typescript
// frontend/src/helpers/http/types.ts

/** Standard API response (ถ้า backend ห่อ envelope ในอนาคต) */
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
}

/** Standard error shape */
export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

/** GET query params */
export interface GetParams {
  [key: string]: string | number | boolean | undefined | null
}

/** Blob download options */
export interface BlobRequestOptions {
  filename?: string
  mimeType?: string
}

/** Upload progress callback */
export type UploadProgressCallback = (percent: number) => void
````

## File: frontend/src/helpers/services/authService.ts
````typescript
// frontend/src/helpers/services/authService.ts
//
// Business domain: Authentication
// Component เรียกผ่านนี้เท่านั้น ไม่แตะ apiAdapter โดยตรง

import apiAdapter from '../http/apiAdapter'
import { setInstanceToken, clearInstanceToken } from '../http/axiosInstance'
import { POST_LOGIN } from '../url_helper'

/* ----------------------------------------------------------
   Types
---------------------------------------------------------- */
export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    role: 'ADMIN' | 'STAFF'
  }
}

export interface AuthUser {
  id: string
  name: string
  role: 'ADMIN' | 'STAFF'
}

/* ----------------------------------------------------------
   Service
---------------------------------------------------------- */
const authService = {
  /**
   * Login — บันทึก token + user ลง sessionStorage
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await apiAdapter.post<LoginPayload, LoginResponse>(
      POST_LOGIN,
      payload,
    )

    sessionStorage.setItem('authToken', res.token)
    sessionStorage.setItem('authUser', JSON.stringify(res.user))
    setInstanceToken(res.token)

    return res
  },

  /**
   * Logout — ล้าง session และ token
   */
  logout: (): void => {
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('authUser')
    clearInstanceToken()
  },

  /**
   * Get current user จาก session
   */
  getCurrentUser: (): AuthUser | null => {
    const raw = sessionStorage.getItem('authUser')
    return raw ? (JSON.parse(raw) as AuthUser) : null
  },
}

export default authService
````

## File: frontend/src/pages/dashboard/components/DashboardAlerts.tsx
````typescript
// ============================================================
//  src/pages/dashboard/components/DashboardAlerts.tsx
// ============================================================

import { AlertTriangle } from 'lucide-react'
import type { BloodGroup } from '../../../types/models'

interface Props {
  lowGroups: BloodGroup[]
  warnGroups: BloodGroup[]
}

export default function DashboardAlerts({ lowGroups, warnGroups }: Props) {
  if (lowGroups.length === 0 && warnGroups.length === 0) return null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
      {lowGroups.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 'var(--radius-md, 8px)',
          background: '#FEF2F2', border: '1px solid #FECACA',
        }}>
          <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#991B1B' }}>
            <strong>ต่ำกว่าขั้นต่ำ:</strong> หมู่เลือด {lowGroups.join(', ')} — ควรเติมสต็อกโดยเร็ว
          </span>
        </div>
      )}
      {warnGroups.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 'var(--radius-md, 8px)',
          background: '#FFFBEB', border: '1px solid #FDE68A',
        }}>
          <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#92400E' }}>
            <strong>ใกล้ขั้นต่ำ:</strong> หมู่เลือด {warnGroups.join(', ')} — เหลือไม่ถึง 120% ของขั้นต่ำ
          </span>
        </div>
      )}
    </div>
  )
}
````

## File: frontend/src/pages/dashboard/components/DashboardCharts.tsx
````typescript
// ============================================================
//  src/pages/dashboard/components/DashboardCharts.tsx
// ============================================================

import type { StockSummary, DailyData } from '../services/DashboardType'
import { BLOOD_GROUPS, GROUP_COLOR, GROUP_SURFACE, levelOf, levelColor, levelText } from '../services/DashboardType'

interface Props {
  stockData: StockSummary
  dailyData: DailyData[]
  maxDailyValue: number
}

export default function DashboardCharts({ stockData, dailyData, maxDailyValue }: Props) {
  const { stocks, minimum } = stockData
  const scale = Math.max(...BLOOD_GROUPS.map((x) => Math.max(stocks[x], minimum[x]))) * 1.2

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 16, marginBottom: 16,
    }}>
      {/* Stock vs Minimum */}
      <div style={{
        background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
        borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)', padding: 20,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>สต็อกเทียบขั้นต่ำ</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {BLOOD_GROUPS.map((g) => {
            const c = stocks[g]
            const m = minimum[g]
            const lv = levelOf(c, m)

            return (
              <div key={g} style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 50px 80px',
                alignItems: 'center', gap: 10,
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: '50%',
                  background: GROUP_SURFACE[g], color: GROUP_COLOR[g],
                  fontSize: 13, fontWeight: 700,
                }}>{g}</span>

                <div style={{ position: 'relative', height: 14, borderRadius: 99, background: 'var(--surface-raised, #F4F4F5)' }}>
                  <div style={{
                    height: '100%',
                    width: `${(c / scale) * 100}%`,
                    borderRadius: 99,
                    background: levelColor(lv),
                    transformOrigin: 'left',
                    animation: 'plasm-grow 0.9s cubic-bezier(.2,.8,.2,1)',
                  }} />
                  <div style={{
                    position: 'absolute', top: -3, bottom: -3,
                    left: `${(m / scale) * 100}%`, width: 2,
                    background: 'var(--text-primary, #18181B)', borderRadius: 1,
                  }} />
                </div>

                <span style={{ fontSize: 14, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c}</span>

                <span style={{
                  fontSize: 11, fontWeight: 600, textAlign: 'center',
                  padding: '3px 8px', borderRadius: 99,
                  background: lv === 'danger' ? '#FEF2F2' : lv === 'warning' ? '#FFFBEB' : '#F0FDF4',
                  color: lv === 'danger' ? '#DC2626' : lv === 'warning' ? '#D97706' : '#16A34A',
                }}>
                  {levelText(lv)}
                </span>
              </div>
            )
          })}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 16,
          fontSize: 12, color: 'var(--text-secondary, #71717A)',
        }}>
          <span style={{ width: 2, height: 12, background: 'var(--text-primary, #18181B)' }} />
          เส้นขั้นต่ำ (Minimum stock)
        </div>
      </div>

      {/* 7-Day Storage */}
      <div style={{
        background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
        borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)', padding: 20,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>การจัดเก็บ 7 วันล่าสุด</h3>
        {dailyData.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
            {dailyData.map((d, i) => {
              const isLast = i === dailyData.length - 1
              return (
                <div key={i} style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{d.value}</span>
                  <div style={{
                    width: '100%', maxWidth: 48,
                    height: `${(d.value / maxDailyValue) * 100}%`,
                    minHeight: d.value > 0 ? 4 : 0,
                    borderRadius: '6px 6px 2px 2px',
                    background: isLast ? 'var(--primary, #2563EB)' : 'var(--group-a-surface, #DBEAFE)',
                    transformOrigin: 'bottom',
                    animation: `plasm-rise 0.7s cubic-bezier(.2,.8,.2,1) ${i * 0.05}s both`,
                  }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.label}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
            ยังไม่มีข้อมูล
          </div>
        )}
      </div>
    </div>
  )
}
````

## File: frontend/src/pages/dashboard/components/DashboardRecentActivity.tsx
````typescript
// ============================================================
//  src/pages/dashboard/components/DashboardRecentActivity.tsx
// ============================================================

import { Package, PackageOpen } from 'lucide-react'
import type { BloodGroup } from '../../../types/models'
import type { LogEntryItem } from '../services/DashboardType'
import { GROUP_COLOR, GROUP_SURFACE } from '../services/DashboardType'

interface Props {
  entries: LogEntryItem[]
}

export default function DashboardRecentActivity({ entries }: Props) {
  return (
    <div style={{
      background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)', padding: 20,
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>รายการล่าสุด</h3>

      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '120px 100px 140px 70px 60px 1fr',
        gap: 8, padding: '8px 0',
        borderBottom: '1px solid var(--border, #E4E4E7)',
        fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #71717A)',
      }}>
        <span>เวลา</span>
        <span>การดำเนินการ</span>
        <span>กล่อง</span>
        <span>หมู่เลือด</span>
        <span>จำนวน</span>
        <span>รายละเอียด</span>
      </div>

      {entries.slice(0, 10).map((entry) => {
        const isStore = entry.action === 'store'
        const ts = new Date(entry.timestamp)
        const timeStr = ts.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
          + ' ' + ts.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

        return (
          <div key={entry.id} style={{
            display: 'grid',
            gridTemplateColumns: '120px 100px 140px 70px 60px 1fr',
            gap: 8, padding: '10px 0',
            borderBottom: '1px solid var(--border, #E4E4E7)',
            fontSize: 13, alignItems: 'center',
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>{timeStr}</span>

            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 12, fontWeight: 600,
              color: isStore ? '#16A34A' : '#DC2626',
            }}>
              {isStore ? <Package size={13} /> : <PackageOpen size={13} />}
              {isStore ? 'จัดเก็บ' : 'นำออก'}
            </span>

            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {entry.boxLabel}
            </span>

            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 22, borderRadius: 99,
              fontSize: 11, fontWeight: 600,
              background: GROUP_SURFACE[entry.blood as BloodGroup] || '#f0f0f0',
              color: GROUP_COLOR[entry.blood as BloodGroup] || '#666',
            }}>
              {entry.blood}
            </span>

            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {entry.units?.length || 0}
            </span>

            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              {entry.detail}
            </span>
          </div>
        )
      })}

      {entries.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
          ยังไม่มีรายการ
        </div>
      )}
    </div>
  )
}
````

## File: frontend/src/pages/dashboard/components/DashboardStockCards.tsx
````typescript
// ============================================================
//  src/pages/dashboard/components/DashboardStockCards.tsx
// ============================================================

import { TrendingUp, TrendingDown } from 'lucide-react'
import type { StockSummary } from '../services/DashboardType'
import { BLOOD_GROUPS, GROUP_COLOR, GROUP_SURFACE, levelOf, levelColor, levelText } from '../services/DashboardType'

interface Props {
  data: StockSummary
}

export default function DashboardStockCards({ data }: Props) {
  const { stocks, minimum, change } = data

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 12, marginBottom: 16,
    }}>
      {BLOOD_GROUPS.map((g) => {
        const count = stocks[g]
        const min = minimum[g]
        const lv = levelOf(count, min)
        const color = levelColor(lv)
        const pct = change[g] || 0
        const progress = Math.min(count / min, 1.5)

        return (
          <div key={g} style={{
            background: 'var(--surface, #fff)',
            border: '1px solid var(--border, #E4E4E7)',
            borderTop: `3px solid ${color}`,
            borderRadius: 'var(--radius-lg, 10px)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: '50%',
                  background: GROUP_SURFACE[g], color: GROUP_COLOR[g],
                  fontSize: 13, fontWeight: 700,
                }}>{g}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary, #18181B)' }}>
                  หมู่เลือด {g}
                </span>
              </div>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 2,
                fontSize: 12, fontWeight: 600,
                color: pct >= 0 ? '#10B981' : '#EF4444',
              }}>
                {pct >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {pct >= 0 ? '▲' : '▼'}{Math.abs(pct)}%
              </span>
            </div>

            <div style={{
              fontSize: 36, fontWeight: 700, lineHeight: 1.1,
              color: 'var(--text-primary, #18181B)', marginBottom: 6,
            }}>
              {count.toLocaleString()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color }}>
                {levelText(lv)}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary, #71717A)' }}>
                ขั้นต่ำ {min} units
              </span>
            </div>

            <div style={{ height: 6, borderRadius: 99, background: 'var(--surface-raised, #F4F4F5)' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(progress, 1) * 100}%`,
                borderRadius: 99, background: color,
                transformOrigin: 'left',
                animation: 'plasm-grow 0.9s cubic-bezier(.2,.8,.2,1)',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
````

## File: frontend/src/pages/dashboard/services/DashboardService.ts
````typescript
// ============================================================
//  src/pages/dashboard/services/DashboardService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_STOCK_SUMMARY, GET_STOCK_DAILY, GET_LOG } from '../../../helpers/url_helper'
import type { StockSummary, DailyData, LogEntryItem } from './DashboardType'

const dashboardService = {
  getStockSummary: async (): Promise<StockSummary> => {
    return await apiAdapter.get<StockSummary>(GET_STOCK_SUMMARY)
  },

  getStockDaily: async (days = 7): Promise<DailyData[]> => {
    return await apiAdapter.get<DailyData[]>(GET_STOCK_DAILY, { days: String(days) })
  },

  getRecentLog: async (): Promise<LogEntryItem[]> => {
    return await apiAdapter.get<LogEntryItem[]>(GET_LOG)
  },
}

export default dashboardService
````

## File: frontend/src/pages/dashboard/services/DashboardType.ts
````typescript
// ============================================================
//  src/pages/dashboard/services/DashboardType.ts
// ============================================================

import type { BloodGroup } from '../../../types/models'

export interface StockSummary {
  stocks: Record<BloodGroup, number>
  minimum: Record<BloodGroup, number>
  change: Record<BloodGroup, number>
}

export interface DailyData {
  label: string
  value: number
}

export interface LogEntryItem {
  id: string
  action: 'store' | 'withdraw'
  boxLabel: string
  type: string
  blood: string
  units: string[]
  timestamp: string
  detail: string
}

export type StockLevel = 'danger' | 'warning' | 'normal'

export const BLOOD_GROUPS: BloodGroup[] = ['A', 'B', 'O', 'AB']

export const GROUP_COLOR: Record<BloodGroup, string> = {
  A: 'var(--group-a, #3B82F6)',
  B: 'var(--group-b, #10B981)',
  O: 'var(--group-o, #F59E0B)',
  AB: 'var(--group-ab, #8B5CF6)',
}

export const GROUP_SURFACE: Record<BloodGroup, string> = {
  A: 'var(--group-a-surface, #DBEAFE)',
  B: 'var(--group-b-surface, #D1FAE5)',
  O: 'var(--group-o-surface, #FEF3C7)',
  AB: 'var(--group-ab-surface, #EDE9FE)',
}

export const levelOf = (current: number, min: number): StockLevel =>
  current < min ? 'danger' : current < min * 1.2 ? 'warning' : 'normal'

export const levelColor = (lv: StockLevel) =>
  lv === 'danger' ? '#EF4444' : lv === 'warning' ? '#F59E0B' : '#10B981'

export const levelText = (lv: StockLevel) =>
  lv === 'danger' ? 'ต่ำกว่าขั้นต่ำ' : lv === 'warning' ? 'ใกล้ขั้นต่ำ' : 'ปกติ'
````

## File: frontend/src/pages/dashboard/services/useDashboard.ts
````typescript
// ============================================================
//  src/pages/dashboard/services/useDashboard.ts
// ============================================================

import { useState, useEffect } from 'react'
import dashboardService from './DashboardService'
import type { StockSummary, DailyData, LogEntryItem } from './DashboardType'
import { BLOOD_GROUPS, levelOf } from './DashboardType'

export default function useDashboard() {
  const [stockData, setStockData] = useState<StockSummary | null>(null)
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [logEntries, setLogEntries] = useState<LogEntryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardService.getStockSummary(),
      dashboardService.getStockDaily(7),
      dashboardService.getRecentLog(),
    ])
      .then(([stock, daily, log]) => {
        setStockData(stock)
        setDailyData(daily)
        setLogEntries(log)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Derived data
  const total = stockData
    ? BLOOD_GROUPS.reduce((s, g) => s + stockData.stocks[g], 0)
    : 0

  const lowGroups = stockData
    ? BLOOD_GROUPS.filter((g) => levelOf(stockData.stocks[g], stockData.minimum[g]) === 'danger')
    : []

  const warnGroups = stockData
    ? BLOOD_GROUPS.filter((g) => levelOf(stockData.stocks[g], stockData.minimum[g]) === 'warning')
    : []

  const maxDailyValue = Math.max(...dailyData.map((d) => d.value), 1)

  return {
    stockData,
    dailyData,
    logEntries,
    loading,
    total,
    lowGroups,
    warnGroups,
    maxDailyValue,
  }
}
````

## File: frontend/src/pages/dashboard/index.tsx
````typescript
// ============================================================
//  src/pages/dashboard/index.tsx
// ============================================================

import useDashboard from './services/useDashboard'
import DashboardHero from './components/DashboardHero'
import DashboardAlerts from './components/DashboardAlerts'
import DashboardStockCards from './components/DashboardStockCards'
import DashboardCharts from './components/DashboardCharts'
import DashboardRecentActivity from './components/DashboardRecentActivity'

const DashboardPage = () => {
  const {
    stockData,
    dailyData,
    logEntries,
    loading,
    total,
    lowGroups,
    warnGroups,
    maxDailyValue,
  } = useDashboard()

  if (loading || !stockData) return null

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>
      <DashboardHero total={total} />
      <DashboardAlerts lowGroups={lowGroups} warnGroups={warnGroups} />
      <DashboardStockCards data={stockData} />
      <DashboardCharts stockData={stockData} dailyData={dailyData} maxDailyValue={maxDailyValue} />
      <DashboardRecentActivity entries={logEntries} />
    </div>
  )
}

export default DashboardPage
````

## File: frontend/src/pages/log/components/LogFiltersBar.tsx
````typescript
// ============================================================
//  src/pages/log/components/LogFiltersBar.tsx
// ============================================================

import { Filter, RotateCcw } from 'lucide-react'
import type { LogFilters } from '../services/LogType'

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid var(--border, #E4E4E7)',
  borderRadius: 'var(--radius-sm, 6px)',
  fontSize: 13,
  background: 'var(--surface, #fff)',
  color: 'var(--text-primary, #18181B)',
}

interface Props {
  filters: LogFilters
  onChange: (field: keyof LogFilters, value: string) => void
  onReset: () => void
}

export default function LogFiltersBar({ filters, onChange, onReset }: Props) {
  const hasFilter = filters.action || filters.blood || filters.dateFrom || filters.dateTo

  return (
    <div style={{
      display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center',
    }}>
      <Filter size={14} style={{ color: 'var(--text-secondary)' }} />

      <select value={filters.action} onChange={(e) => onChange('action', e.target.value)} style={inputStyle}>
        <option value="">ทุกการดำเนินการ</option>
        <option value="store">จัดเก็บ</option>
        <option value="withdraw">นำออก</option>
      </select>

      <select value={filters.blood} onChange={(e) => onChange('blood', e.target.value)} style={inputStyle}>
        <option value="">ทุกหมู่เลือด</option>
        {['A', 'B', 'O', 'AB'].map((g) => <option key={g} value={g}>{g}</option>)}
      </select>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>จาก</span>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange('dateFrom', e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ถึง</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange('dateTo', e.target.value)}
          style={inputStyle}
        />
      </div>

      {hasFilter && (
        <button onClick={onReset} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '7px 12px', borderRadius: 'var(--radius-sm, 6px)',
          border: '1px solid var(--border)', background: 'transparent',
          fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer',
        }}>
          <RotateCcw size={12} /> ล้าง
        </button>
      )}
    </div>
  )
}
````

## File: frontend/src/pages/log/components/LogTable.tsx
````typescript
// ============================================================
//  src/pages/log/components/LogTable.tsx
// ============================================================

import { Package, PackageOpen } from 'lucide-react'
import type { BloodGroup } from '../../../types/models'
import type { LogEntryItem } from '../services/LogType'

const GROUP_COLOR: Record<string, string> = {
  A: 'var(--group-a, #3B82F6)', B: 'var(--group-b, #10B981)',
  O: 'var(--group-o, #F59E0B)', AB: 'var(--group-ab, #8B5CF6)',
}
const GROUP_SURFACE: Record<string, string> = {
  A: 'var(--group-a-surface, #DBEAFE)', B: 'var(--group-b-surface, #D1FAE5)',
  O: 'var(--group-o-surface, #FEF3C7)', AB: 'var(--group-ab-surface, #EDE9FE)',
}

interface Props {
  entries: LogEntryItem[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
}

export default function LogTable({ entries, loading, hasMore, onLoadMore }: Props) {
  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '140px 90px 140px 70px 100px 1fr 100px',
        gap: 8, padding: '12px 20px',
        background: 'var(--surface-raised, #F4F4F5)',
        borderBottom: '1px solid var(--border)',
        fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #71717A)',
      }}>
        <span>เวลา</span>
        <span>การดำเนินการ</span>
        <span>กล่อง</span>
        <span>หมู่เลือด</span>
        <span>ตำแหน่ง</span>
        <span>รายละเอียด</span>
        <span>ผู้ดำเนินการ</span>
      </div>

      {/* Rows */}
      {loading && entries.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : entries.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>ไม่พบรายการ</div>
      ) : (
        <>
          {entries.map((entry) => {
            const isStore = entry.action === 'store'
            const ts = new Date(entry.timestamp)
            const timeStr = ts.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
              + ' ' + ts.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

            return (
              <div key={entry.id} style={{
                display: 'grid',
                gridTemplateColumns: '140px 90px 140px 70px 100px 1fr 100px',
                gap: 8, padding: '12px 20px',
                borderBottom: '1px solid var(--border)',
                fontSize: 13, alignItems: 'center',
              }}>
                {/* Time */}
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{timeStr}</span>

                {/* Action */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 12, fontWeight: 600,
                  color: isStore ? '#16A34A' : '#DC2626',
                }}>
                  {isStore ? <Package size={13} /> : <PackageOpen size={13} />}
                  {isStore ? 'จัดเก็บ' : 'นำออก'}
                </span>

                {/* Box */}
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12 }}>
                  {entry.boxLabel}
                </span>

                {/* Blood */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 30, height: 22, borderRadius: 99,
                  fontSize: 11, fontWeight: 700,
                  background: GROUP_SURFACE[entry.blood] || '#f0f0f0',
                  color: GROUP_COLOR[entry.blood] || '#666',
                }}>
                  {entry.blood}
                </span>

                {/* Location */}
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {entry.location === 'room' ? 'ห้อง' : entry.location === 'cabinet' ? 'ตู้' : '-'} {entry.shelf || ''}
                </span>

                {/* Detail */}
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {entry.detail}
                </span>

                {/* Performed by */}
                <span style={{ fontSize: 12, fontWeight: 500 }}>
                  {entry.performedBy || '-'}
                </span>
              </div>
            )
          })}

          {/* Load more */}
          {hasMore && (
            <div style={{ padding: 16, textAlign: 'center' }}>
              <button onClick={onLoadMore} style={{
                padding: '8px 24px', borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border)', background: 'transparent',
                fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer',
              }}>
                {loading ? 'กำลังโหลด...' : 'โหลดเพิ่ม'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
````

## File: frontend/src/pages/log/services/LogService.ts
````typescript
// ============================================================
//  src/pages/log/services/LogService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_LOG } from '../../../helpers/url_helper'
import type { LogEntryItem } from './LogType'

const logService = {
  /** GET /log?action=&blood=&limit=&offset= */
  getLog: async (params?: Record<string, string>): Promise<LogEntryItem[]> => {
    return await apiAdapter.get<LogEntryItem[]>(GET_LOG, params)
  },
}

export default logService
````

## File: frontend/src/pages/log/services/LogType.ts
````typescript
// ============================================================
//  src/pages/log/services/LogType.ts
// ============================================================

import type { BloodGroup, PlasmaType } from '../../../types/models'

export interface LogEntryItem {
  id: string
  action: 'store' | 'withdraw'
  boxLabel: string
  type: PlasmaType
  blood: BloodGroup | string
  units: string[]
  location?: string
  shelf?: string
  timestamp: string
  detail: string
  performedBy?: string
}

export interface LogFilters {
  action: string
  blood: string
  dateFrom: string
  dateTo: string
}
````

## File: frontend/src/pages/log/services/useLog.ts
````typescript
// ============================================================
//  src/pages/log/services/useLog.ts
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import logService from './LogService'
import type { LogEntryItem, LogFilters } from './LogType'

const INITIAL_FILTERS: LogFilters = {
  action: '',
  blood: '',
  dateFrom: '',
  dateTo: '',
}

const PAGE_SIZE = 30

export default function useLog() {
  const [entries, setEntries] = useState<LogEntryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<LogFilters>(INITIAL_FILTERS)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const loadLog = useCallback(async (reset = false) => {
    setLoading(true)
    try {
      const offset = reset ? 0 : page * PAGE_SIZE
      const params: Record<string, string> = {
        limit: String(PAGE_SIZE),
        offset: String(offset),
      }
      if (filters.action) params.action = filters.action
      if (filters.blood) params.blood = filters.blood

      const data = await logService.getLog(params)

      if (reset) {
        setEntries(data)
        setPage(0)
      } else {
        setEntries((prev) => reset ? data : [...prev, ...data])
      }
      setHasMore(data.length >= PAGE_SIZE)
    } catch {
      if (reset) setEntries([])
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  // Load on mount + filter change
  useEffect(() => { loadLog(true) }, [filters.action, filters.blood])

  const handleFilterChange = (field: keyof LogFilters, value: string) => {
    setFilters((f) => ({ ...f, [field]: value }))
  }

  const resetFilters = () => setFilters(INITIAL_FILTERS)

  const loadMore = () => {
    setPage((p) => p + 1)
    loadLog(false)
  }

  // Client-side date filter (backend doesn't support date range yet)
  const filteredEntries = entries.filter((e) => {
    if (filters.dateFrom) {
      const entryDate = e.timestamp.split('T')[0]
      if (entryDate < filters.dateFrom) return false
    }
    if (filters.dateTo) {
      const entryDate = e.timestamp.split('T')[0]
      if (entryDate > filters.dateTo) return false
    }
    return true
  })

  return {
    entries: filteredEntries,
    loading,
    filters,
    hasMore,
    handleFilterChange,
    resetFilters,
    loadMore,
  }
}
````

## File: frontend/src/pages/log/index.tsx
````typescript
// ============================================================
//  src/pages/log/index.tsx
// ============================================================

import useLog from './services/useLog'
import LogFiltersBar from './components/LogFiltersBar'
import LogTable from './components/LogTable'

const LogPage = () => {
  const {
    entries,
    loading,
    filters,
    hasMore,
    handleFilterChange,
    resetFilters,
    loadMore,
  } = useLog()

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>ประวัติการจัดเก็บ/นำออก</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          บันทึกทุกรายการจัดเก็บและนำออกพลาสมา · แสดง {entries.length} รายการ
        </p>
      </div>

      <LogFiltersBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={resetFilters}
      />

      <LogTable
        entries={entries}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  )
}

export default LogPage
````

## File: frontend/src/pages/map/components/MapCabinetGrid.tsx
````typescript
// ============================================================
//  src/pages/map/components/MapCabinetGrid.tsx
// ============================================================

import type { BloodGroup } from '../../../types/models'
import type { LocationSummary } from '../services/MapType'

const GROUP_COLOR: Record<BloodGroup, string> = {
  A: '#3B82F6', B: '#10B981', O: '#F59E0B', AB: '#8B5CF6',
}

interface Props {
  data: LocationSummary
}

export default function MapCabinetGrid({ data }: Props) {
  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: 24, boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
          ตู้ -30°C
        </h3>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {data.totalBoxes} กล่อง · {data.totalUnits} units
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.shelves.map((shelf) => {
          const hasBoxes = shelf.totalBoxes > 0
          return (
            <div key={shelf.shelf} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderRadius: 'var(--radius-md, 8px)',
              border: `1px solid ${hasBoxes ? 'var(--primary, #2563EB)' : 'var(--border, #E4E4E7)'}`,
              background: hasBoxes ? 'var(--group-a-surface, #DBEAFE)' : 'var(--surface-raised, #F4F4F5)',
            }}>
              <div>
                <span style={{ fontSize: 15, fontWeight: 700, color: hasBoxes ? 'var(--primary)' : 'var(--text-secondary)' }}>
                  {shelf.shelf}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 12 }}>
                  {shelf.totalBoxes} กล่อง · {shelf.totalUnits} units
                </span>
              </div>

              <div style={{ display: 'flex', gap: 4 }}>
                {(['A', 'B', 'O', 'AB'] as BloodGroup[]).map((g) => {
                  const count = shelf.byBlood[g]
                  if (!count) return null
                  return (
                    <span key={g} style={{
                      fontSize: 10, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 99,
                      background: `${GROUP_COLOR[g]}20`,
                      color: GROUP_COLOR[g],
                    }}>
                      {g}:{count}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
````

## File: frontend/src/pages/map/components/MapRoomGrid.tsx
````typescript
// ============================================================
//  src/pages/map/components/MapRoomGrid.tsx
// ============================================================

import type { BloodGroup } from '../../../types/models'
import type { LocationSummary } from '../services/MapType'
import { ROOM_LAYOUT } from '../services/MapType'

const GROUP_COLOR: Record<BloodGroup, string> = {
  A: '#3B82F6', B: '#10B981', O: '#F59E0B', AB: '#8B5CF6',
}

interface Props {
  data: LocationSummary
}

export default function MapRoomGrid({ data }: Props) {
  const shelfMap = Object.fromEntries(data.shelves.map((s) => [s.shelf, s]))

  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: 24, boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
          ห้อง -30°C
        </h3>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {data.totalBoxes} กล่อง · {data.totalUnits} units
        </span>
      </div>

      {/* 3x3 Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10, maxWidth: 480, margin: '0 auto',
      }}>
        {ROOM_LAYOUT.map((cell, idx) => {
          // Door cell
          if (cell.label === 'ประตู') {
            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16, borderRadius: 'var(--radius-md, 8px)',
                border: '2px dashed var(--border, #E4E4E7)',
                color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
              }}>
                🚪 ประตู
              </div>
            )
          }

          // Empty center
          if (!cell.shelf) {
            return <div key={idx} />
          }

          // Shelf cell
          const shelf = shelfMap[cell.shelf]
          const hasBoxes = shelf && shelf.totalBoxes > 0

          return (
            <div key={idx} style={{
              padding: 14, borderRadius: 'var(--radius-md, 8px)',
              border: `1px solid ${hasBoxes ? 'var(--primary, #2563EB)' : 'var(--border, #E4E4E7)'}`,
              background: hasBoxes ? 'var(--group-a-surface, #DBEAFE)' : 'var(--surface-raised, #F4F4F5)',
              transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: hasBoxes ? 'var(--primary)' : 'var(--text-secondary)' }}>
                {cell.shelf}
              </div>
              {shelf ? (
                <>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {shelf.totalBoxes} กล่อง · {shelf.totalUnits} u
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(['A', 'B', 'O', 'AB'] as BloodGroup[]).map((g) => {
                      const count = shelf.byBlood[g]
                      if (!count) return null
                      return (
                        <span key={g} style={{
                          fontSize: 10, fontWeight: 700,
                          padding: '2px 6px', borderRadius: 99,
                          background: `${GROUP_COLOR[g]}20`,
                          color: GROUP_COLOR[g],
                        }}>
                          {g}:{count}
                        </span>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-disabled, #A1A1AA)' }}>ว่าง</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
````

## File: frontend/src/pages/map/services/MapService.ts
````typescript
// ============================================================
//  src/pages/map/services/MapService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_BOXES } from '../../../helpers/url_helper'

interface BoxRaw {
  id: string
  blood: string
  location: string
  shelf: string
  units: string[]
  status: string
}

const mapService = {
  /** GET /boxes?status=stored → aggregate by shelf */
  getStoredBoxes: async (): Promise<BoxRaw[]> => {
    return await apiAdapter.get<BoxRaw[]>(GET_BOXES, { status: 'stored' })
  },
}

export default mapService
````

## File: frontend/src/pages/map/services/MapType.ts
````typescript
// ============================================================
//  src/pages/map/services/MapType.ts
// ============================================================

import type { BloodGroup } from '../../../types/models'

export interface ShelfSummary {
  shelf: string
  totalBoxes: number
  totalUnits: number
  byBlood: Record<BloodGroup, number>
}

export interface LocationSummary {
  location: 'room' | 'cabinet'
  shelves: ShelfSummary[]
  totalBoxes: number
  totalUnits: number
}

export const ROOM_LAYOUT: { shelf: string; row: number; col: number; label: string }[] = [
  { shelf: 'L3', row: 0, col: 0, label: 'L3' },
  { shelf: 'M1', row: 0, col: 1, label: 'M1' },
  { shelf: 'R3', row: 0, col: 2, label: 'R3' },
  { shelf: 'L2', row: 1, col: 0, label: 'L2' },
  { shelf: '',   row: 1, col: 1, label: '' },       // empty center
  { shelf: 'R2', row: 1, col: 2, label: 'R2' },
  { shelf: 'L1', row: 2, col: 0, label: 'L1' },
  { shelf: '',   row: 2, col: 1, label: 'ประตู' },  // door
  { shelf: 'R1', row: 2, col: 2, label: 'R1' },
]

export const CABINET_SHELVES = ['C1', 'C2', 'C3']
````

## File: frontend/src/pages/map/services/useMap.ts
````typescript
// ============================================================
//  src/pages/map/services/useMap.ts
// ============================================================

import { useState, useEffect, useMemo } from 'react'
import mapService from './MapService'
import type { ShelfSummary, LocationSummary } from './MapType'
import type { BloodGroup } from '../../../types/models'

const EMPTY_BLOOD: Record<BloodGroup, number> = { A: 0, B: 0, O: 0, AB: 0 }

export default function useMap() {
  const [boxes, setBoxes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    mapService.getStoredBoxes()
      .then(setBoxes)
      .catch(() => setBoxes([]))
      .finally(() => setLoading(false))
  }, [])

  const { room, cabinet } = useMemo(() => {
    const buildSummary = (loc: string, shelfList: string[]): LocationSummary => {
      const filtered = boxes.filter((b) => b.location === loc)
      const shelves: ShelfSummary[] = shelfList.map((shelf) => {
        const shelfBoxes = filtered.filter((b) => b.shelf === shelf)
        const byBlood = { ...EMPTY_BLOOD }
        let totalUnits = 0
        for (const b of shelfBoxes) {
          const bg = b.blood as BloodGroup
          const count = Array.isArray(b.units) ? b.units.length : 0
          byBlood[bg] = (byBlood[bg] || 0) + count
          totalUnits += count
        }
        return { shelf, totalBoxes: shelfBoxes.length, totalUnits, byBlood }
      })
      return {
        location: loc as 'room' | 'cabinet',
        shelves,
        totalBoxes: filtered.length,
        totalUnits: filtered.reduce((s, b) => s + (Array.isArray(b.units) ? b.units.length : 0), 0),
      }
    }

    return {
      room: buildSummary('room', ['M1', 'R1', 'R2', 'R3', 'L1', 'L2', 'L3']),
      cabinet: buildSummary('cabinet', ['C1', 'C2', 'C3']),
    }
  }, [boxes])

  const totalBoxes = room.totalBoxes + cabinet.totalBoxes
  const totalUnits = room.totalUnits + cabinet.totalUnits

  return { room, cabinet, totalBoxes, totalUnits, loading }
}
````

## File: frontend/src/pages/map/index.tsx
````typescript
// ============================================================
//  src/pages/map/index.tsx
// ============================================================

import useMap from './services/useMap'
import MapRoomGrid from './components/MapRoomGrid'
import MapCabinetGrid from './components/MapCabinetGrid'

const MapPage = () => {
  const { room, cabinet, totalBoxes, totalUnits, loading } = useMap()

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
  }

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>แผนผังจัดเก็บ</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          ภาพรวมตำแหน่งจัดเก็บพลาสมา · รวม {totalBoxes} กล่อง · {totalUnits} units
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'กล่องทั้งหมด', value: totalBoxes, color: 'var(--primary)' },
          { label: 'Unit ทั้งหมด', value: totalUnits, color: 'var(--group-b)' },
          { label: 'ห้อง -30°C', value: room.totalBoxes, color: 'var(--group-a)' },
          { label: 'ตู้ -30°C', value: cabinet.totalBoxes, color: 'var(--group-ab)' },
        ].map((item) => (
          <div key={item.label} style={{
            background: 'var(--surface, #fff)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '14px 18px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Maps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        <MapRoomGrid data={room} />
        <MapCabinetGrid data={cabinet} />
      </div>
    </div>
  )
}

export default MapPage
````

## File: frontend/src/pages/search/services/SearchService.ts
````typescript
// ============================================================
//  src/pages/search/services/SearchService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_UNIT_SEARCH } from '../../../helpers/url_helper'
import type { SearchUnitResult } from './SearchType'

const searchService = {
  /** GET /units/search?q= */
  searchUnits: async (query: string): Promise<SearchUnitResult[]> => {
    return await apiAdapter.get<SearchUnitResult[]>(GET_UNIT_SEARCH, { q: query })
  },
}

export default searchService
````

## File: frontend/src/pages/search/services/SearchType.ts
````typescript
// ============================================================
//  src/pages/search/services/SearchType.ts
// ============================================================

import type { BloodGroup, PlasmaType, StorageLocation, BoxStatus } from '../../../types/models'

export interface SearchUnitResult {
  id: string
  unitNumber: string
  status: 'stored' | 'withdrawn'
  box: {
    id: string
    boxLabel: string
    blood: BloodGroup
    type: PlasmaType
    location: StorageLocation
    shelf: string
    status: BoxStatus
    collectionDate: string
  }
}

export interface SearchBoxGroup {
  box: SearchUnitResult['box']
  units: SearchUnitResult[]
}
````

## File: frontend/src/pages/search/services/useSearch.ts
````typescript
// ============================================================
//  src/pages/search/services/useSearch.ts
// ============================================================

import { useState, useRef, useMemo } from 'react'
import searchService from './SearchService'
import type { SearchUnitResult, SearchBoxGroup } from './SearchType'

export default function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchUnitResult[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const doSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchService.searchUnits(q.trim())
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setSearched(false)
  }

  // Group results by box
  const boxGroups: SearchBoxGroup[] = useMemo(() => {
    const map: Record<string, SearchBoxGroup> = {}
    for (const unit of results) {
      if (!map[unit.box.id]) {
        map[unit.box.id] = { box: unit.box, units: [] }
      }
      map[unit.box.id].units.push(unit)
    }
    return Object.values(map)
  }, [results])

  return {
    query,
    results,
    searched,
    loading,
    boxGroups,
    handleQueryChange,
    clearSearch,
  }
}
````

## File: frontend/src/pages/search/SearchPage.tsx
````typescript
// frontend/src/pages/search/SearchPage.tsx

import { Search } from 'lucide-react'

export default function SearchPage() {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Search size={18} style={{ color: 'var(--color-primary)' }} />
        ค้นหา Unit
      </h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>ค้นหาว่า Unit อยู่กล่องไหน ตำแหน่งไหน</p>
    </div>
  )
}
````

## File: frontend/src/pages/settings/components/SettingsMinStock.tsx
````typescript
// ============================================================
//  src/pages/settings/components/SettingsMinStock.tsx
// ============================================================

import { Save } from 'lucide-react'
import type { BloodGroup } from '../../../types/models'
import type { MinimumStock } from '../services/SettingsType'

const GROUP_COLOR: Record<BloodGroup, string> = {
  A: 'var(--group-a, #3B82F6)', B: 'var(--group-b, #10B981)',
  O: 'var(--group-o, #F59E0B)', AB: 'var(--group-ab, #8B5CF6)',
}
const GROUP_SURFACE: Record<BloodGroup, string> = {
  A: 'var(--group-a-surface, #DBEAFE)', B: 'var(--group-b-surface, #D1FAE5)',
  O: 'var(--group-o-surface, #FEF3C7)', AB: 'var(--group-ab-surface, #EDE9FE)',
}

interface Props {
  minimumStock: MinimumStock
  saving: boolean
  onChange: (group: keyof MinimumStock, value: string) => void
  onSave: () => void
}

export default function SettingsMinStock({ minimumStock, saving, onChange, onSave }: Props) {
  const groups: BloodGroup[] = ['A', 'B', 'O', 'AB']

  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: 24, boxShadow: 'var(--shadow-sm)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>จำนวนขั้นต่ำ (Minimum Stock)</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
        กำหนดจำนวน unit ขั้นต่ำต่อหมู่เลือด — ต่ำกว่านี้จะแจ้งเตือน
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {groups.map((g) => (
          <div key={g} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border)',
          }}>
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: '50%',
              background: GROUP_SURFACE[g], color: GROUP_COLOR[g],
              fontSize: 14, fontWeight: 700, flexShrink: 0,
            }}>{g}</span>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>หมู่เลือด {g}</label>
              <input
                type="number"
                min={0}
                value={minimumStock[g]}
                onChange={(e) => onChange(g, e.target.value)}
                style={{
                  width: '100%', padding: '6px 10px', marginTop: 4,
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                  textAlign: 'center',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '10px 24px', borderRadius: 'var(--radius-sm, 6px)',
          border: 'none', background: 'var(--primary, #2563EB)', color: '#fff',
          fontWeight: 600, fontSize: 14, cursor: saving ? 'wait' : 'pointer',
          opacity: saving ? 0.7 : 1,
        }}
      >
        <Save size={14} />
        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
    </div>
  )
}
````

## File: frontend/src/pages/settings/components/SettingsUsers.tsx
````typescript
// ============================================================
//  src/pages/settings/components/SettingsUsers.tsx
// ============================================================

import { Plus, X, UserCheck, UserX } from 'lucide-react'
import type { UserItem, UserFormData } from '../services/SettingsType'

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid var(--border, #E4E4E7)',
  borderRadius: 'var(--radius-sm, 6px)',
  fontSize: 14,
  background: 'var(--surface, #fff)',
  color: 'var(--text-primary)',
  width: '100%',
}

interface Props {
  users: UserItem[]
  loading: boolean
  showForm: boolean
  form: UserFormData
  saving: boolean
  onToggleForm: (show: boolean) => void
  onFormChange: (field: keyof UserFormData, value: string) => void
  onCreate: () => void
  onToggleActive: (user: UserItem) => void
}

export default function SettingsUsers({
  users, loading, showForm, form, saving,
  onToggleForm, onFormChange, onCreate, onToggleActive,
}: Props) {
  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: 24, boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>จัดการผู้ใช้</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            เพิ่ม/ปิดใช้งานบัญชีผู้ใช้ · {users.length} คน
          </p>
        </div>
        <button
          onClick={() => onToggleForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 'var(--radius-sm, 6px)',
            border: 'none', background: 'var(--primary, #2563EB)', color: '#fff',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'ปิด' : 'เพิ่มผู้ใช้'}
        </button>
      </div>

      {/* Add user form */}
      {showForm && (
        <div style={{
          padding: 16, marginBottom: 16,
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border)',
          background: 'var(--surface-raised, #F4F4F5)',
          animation: 'plasm-fade-in 0.2s ease',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block' }}>ชื่อผู้ใช้ *</label>
              <input
                type="text"
                placeholder="username"
                value={form.username}
                onChange={(e) => onFormChange('username', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block' }}>ชื่อ-สกุล *</label>
              <input
                type="text"
                placeholder="ชื่อที่แสดง"
                value={form.name}
                onChange={(e) => onFormChange('name', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block' }}>รหัสผ่าน *</label>
              <input
                type="password"
                placeholder="••••••"
                value={form.password}
                onChange={(e) => onFormChange('password', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block' }}>บทบาท</label>
              <select value={form.role} onChange={(e) => onFormChange('role', e.target.value)} style={inputStyle}>
                <option value="staff">เจ้าหน้าที่</option>
                <option value="admin">ผู้ดูแลระบบ</option>
              </select>
            </div>
          </div>
          <button
            onClick={onCreate}
            disabled={saving}
            style={{
              padding: '8px 20px', borderRadius: 'var(--radius-sm, 6px)',
              border: 'none', background: 'var(--primary)', color: '#fff',
              fontWeight: 600, fontSize: 13, cursor: saving ? 'wait' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'กำลังบันทึก...' : 'เพิ่มผู้ใช้'}
          </button>
        </div>
      )}

      {/* User list */}
      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {users.map((user, idx) => (
            <div key={user.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: idx < users.length - 1 ? '1px solid var(--border)' : 'none',
              opacity: user.active ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: '50%',
                  background: user.role === 'admin' ? '#DBEAFE' : '#F4F4F5',
                  color: user.role === 'admin' ? '#2563EB' : '#71717A',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {user.name.charAt(0)}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    @{user.username} · {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onToggleActive(user)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 12px', borderRadius: 'var(--radius-sm, 6px)',
                  border: `1px solid ${user.active ? '#FECACA' : '#BBF7D0'}`,
                  background: user.active ? '#FEF2F2' : '#F0FDF4',
                  color: user.active ? '#DC2626' : '#16A34A',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {user.active ? <UserX size={13} /> : <UserCheck size={13} />}
                {user.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
````

## File: frontend/src/pages/settings/services/SettingsService.ts
````typescript
// ============================================================
//  src/pages/settings/services/SettingsService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import {
  GET_SETTINGS, PUT_SETTINGS,
  GET_USERS, POST_USER, PATCH_USER,
} from '../../../helpers/url_helper'
import type { MinimumStock, UserItem, UserFormData } from './SettingsType'

const settingsService = {
  /** GET /settings */
  getSettings: async (): Promise<Record<string, unknown>> => {
    return await apiAdapter.get(GET_SETTINGS)
  },

  /** PUT /settings */
  updateMinimumStock: async (minimumStock: MinimumStock): Promise<{ message: string }> => {
    return await apiAdapter.put(PUT_SETTINGS, { minimumStock })
  },

  /** GET /users */
  getUsers: async (): Promise<UserItem[]> => {
    return await apiAdapter.get<UserItem[]>(GET_USERS)
  },

  /** POST /users */
  createUser: async (data: UserFormData): Promise<UserItem> => {
    return await apiAdapter.post<UserFormData, UserItem>(POST_USER, data)
  },

  /** PATCH /users/:id */
  updateUser: async (id: string, data: Partial<UserItem & { password?: string }>): Promise<UserItem> => {
    return await apiAdapter.patch<typeof data, UserItem>(`${PATCH_USER}/${id}`, data)
  },
}

export default settingsService
````

## File: frontend/src/pages/settings/services/SettingsType.ts
````typescript
// ============================================================
//  src/pages/settings/services/SettingsType.ts
// ============================================================

import type { BloodGroup } from '../../../types/models'

export interface MinimumStock {
  A: number
  B: number
  O: number
  AB: number
}

export interface UserItem {
  id: string
  username: string
  name: string
  role: 'admin' | 'staff'
  active: boolean
  createdAt: string
}

export interface UserFormData {
  username: string
  name: string
  password: string
  role: 'admin' | 'staff'
}

export interface ToastState {
  type: 'success' | 'error'
  msg: string
}
````

## File: frontend/src/pages/settings/services/useSettings.ts
````typescript
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
  const [activeTab, setActiveTab] = useState<'stock' | 'users'>('stock')

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
  }
}
````

## File: frontend/src/pages/settings/index.tsx
````typescript
// ============================================================
//  src/pages/settings/index.tsx
// ============================================================

import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import useSettings from './services/useSettings'
import SettingsMinStock from './components/SettingsMinStock'
import SettingsUsers from './components/SettingsUsers'

const TABS = [
  { key: 'stock' as const, label: 'ค่าขั้นต่ำ' },
  { key: 'users' as const, label: 'จัดการผู้ใช้' },
]

const SettingsPage = () => {
  const {
    activeTab, setActiveTab,
    minimumStock, savingSettings,
    handleMinStockChange, handleSaveMinimumStock,
    users, loadingUsers,
    showUserForm, setShowUserForm,
    userForm, savingUser,
    handleUserFormChange, handleCreateUser, handleToggleActive,
    toast, dismissToast,
  } = useSettings()

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 20px', borderRadius: 'var(--radius-md, 8px)',
          background: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
          color: toast.type === 'success' ? '#166534' : '#991B1B',
          fontSize: 13, fontWeight: 500, boxShadow: 'var(--shadow-md)',
          animation: 'plasm-fade-in 0.2s ease',
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
          <button onClick={dismissToast} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 8 }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>ตั้งค่า</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          กำหนดค่าขั้นต่ำสต็อกและจัดการบัญชีผู้ใช้
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid var(--border, #E4E4E7)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              border: 'none', background: 'transparent',
              fontSize: 14, fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? 'var(--primary, #2563EB)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.key ? '2px solid var(--primary, #2563EB)' : '2px solid transparent',
              marginBottom: -2,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'stock' && (
        <SettingsMinStock
          minimumStock={minimumStock}
          saving={savingSettings}
          onChange={handleMinStockChange}
          onSave={handleSaveMinimumStock}
        />
      )}

      {activeTab === 'users' && (
        <SettingsUsers
          users={users}
          loading={loadingUsers}
          showForm={showUserForm}
          form={userForm}
          saving={savingUser}
          onToggleForm={setShowUserForm}
          onFormChange={handleUserFormChange}
          onCreate={handleCreateUser}
          onToggleActive={handleToggleActive}
        />
      )}
    </div>
  )
}

export default SettingsPage
````

## File: frontend/src/pages/storage/components/StorageNewBoxForm.tsx
````typescript
// ============================================================
//  src/pages/storage/components/StorageNewBoxForm.tsx
// ============================================================

import { X, Printer } from 'lucide-react'
import type { BloodGroup } from '../../../types/models'
import type { StorageFormData } from '../services/StorageType'

const GROUP_COLOR: Record<BloodGroup, string> = {
  A: 'var(--group-a, #3B82F6)', B: 'var(--group-b, #10B981)',
  O: 'var(--group-o, #F59E0B)', AB: 'var(--group-ab, #8B5CF6)',
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  border: '1px solid var(--border, #E4E4E7)',
  borderRadius: 'var(--radius-sm, 6px)',
  fontSize: 14,
  background: 'var(--surface, #fff)',
  color: 'var(--text-primary, #18181B)',
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #18181B)', marginBottom: 6,
}

interface Props {
  form: StorageFormData
  boxLabel: string
  scannedUnits: string[]
  unitInput: string
  submitting: boolean
  availableShelves: string[]
  onFormChange: (field: keyof StorageFormData, value: string) => void
  onUnitInputChange: (value: string) => void
  onAddUnit: () => void
  onUnitKeyDown: (e: React.KeyboardEvent) => void
  onRemoveUnit: (unit: string) => void
  onSubmit: () => void
}

export default function StorageNewBoxForm({
  form, boxLabel, scannedUnits, unitInput, submitting, availableShelves,
  onFormChange, onUnitInputChange, onAddUnit, onUnitKeyDown, onRemoveUnit, onSubmit,
}: Props) {
  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: '24px 28px',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: 20,
    }}>
      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
        กล่องใหม่
      </h3>

      {/* ── Row 1: main fields ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16, marginBottom: 20,
      }}>
        {/* Box Label (auto) */}
        <div>
          <label style={labelStyle}>หมายเลขกล่อง (อัตโนมัติ)</label>
          <input
            type="text"
            value={boxLabel}
            readOnly
            style={{ ...inputStyle, background: 'var(--surface-raised, #F4F4F5)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
          />
        </div>

        {/* Blood Group */}
        <div>
          <label style={labelStyle}>หมู่เลือด</label>
          <select
            value={form.blood}
            onChange={(e) => onFormChange('blood', e.target.value)}
            style={inputStyle}
          >
            {(['A', 'B', 'O', 'AB'] as const).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Collection Date */}
        <div>
          <label style={labelStyle}>วันที่เก็บ</label>
          <input
            type="date"
            value={form.collectionDate}
            onChange={(e) => onFormChange('collectionDate', e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Location */}
        <div>
          <label style={labelStyle}>ตำแหน่งจัดเก็บ</label>
          <select
            value={form.location}
            onChange={(e) => onFormChange('location', e.target.value)}
            style={inputStyle}
          >
            <option value="room">ห้อง -30°C</option>
            <option value="cabinet">ตู้ -30°C</option>
          </select>
        </div>

        {/* Shelf */}
        <div>
          <label style={labelStyle}>ชั้นวาง</label>
          <select
            value={form.shelf}
            onChange={(e) => onFormChange('shelf', e.target.value)}
            style={inputStyle}
          >
            {availableShelves.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Unit input ── */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>
          Unit ที่สแกนแล้ว · {scannedUnits.length} units
          <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 8 }}>
            (ตรวจจับ Unit ซ้ำอัตโนมัติ)
          </span>
        </label>

        {/* Input row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="พิมพ์หรือสแกนหมายเลข Unit แล้วกด Enter"
            value={unitInput}
            onChange={(e) => onUnitInputChange(e.target.value)}
            onKeyDown={onUnitKeyDown}
            style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
          />
          <button
            onClick={onAddUnit}
            style={{
              padding: '10px 18px', borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border)', background: 'var(--surface-raised)',
              fontSize: 14, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            เพิ่ม
          </button>
        </div>

        {/* Unit pills */}
        {scannedUnits.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {scannedUnits.map((unit) => (
              <span key={unit} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border, #E4E4E7)',
                background: 'var(--surface, #fff)',
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                color: GROUP_COLOR[form.blood] || 'var(--text-primary)',
              }}>
                {unit}
                <button
                  onClick={() => onRemoveUnit(unit)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, display: 'flex', alignItems: 'center',
                  }}
                >
                  <X size={13} color="var(--text-secondary)" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Submit ── */}
      <button
        onClick={onSubmit}
        disabled={submitting || scannedUnits.length === 0}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 28px', borderRadius: 'var(--radius-sm, 6px)',
          border: 'none', background: 'var(--primary, #2563EB)', color: '#fff',
          fontWeight: 600, fontSize: 14, cursor: submitting ? 'wait' : 'pointer',
          opacity: submitting || scannedUnits.length === 0 ? 0.6 : 1,
        }}
      >
        <Printer size={16} />
        {submitting ? 'กำลังบันทึก...' : 'บันทึกและพิมพ์บาร์โค้ด'}
      </button>
    </div>
  )
}
````

## File: frontend/src/pages/storage/components/StorageToast.tsx
````typescript
// ============================================================
//  src/pages/storage/components/StorageToast.tsx
// ============================================================

import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import type { ToastState } from '../services/StorageType'

interface Props {
  toast: ToastState | null
  onDismiss: () => void
}

export default function StorageToast({ toast, onDismiss }: Props) {
  if (!toast) return null

  return (
    <div style={{
      position: 'fixed', top: 16, right: 16, zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '12px 20px', borderRadius: 'var(--radius-md, 8px)',
      background: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
      border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
      color: toast.type === 'success' ? '#166534' : '#991B1B',
      fontSize: 13, fontWeight: 500, boxShadow: 'var(--shadow-md)',
      animation: 'plasm-fade-in 0.2s ease',
    }}>
      {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {toast.msg}
      <button onClick={onDismiss} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 8,
      }}>
        <X size={14} />
      </button>
    </div>
  )
}
````

## File: frontend/src/pages/storage/services/StorageService.ts
````typescript
// ============================================================
//  src/pages/storage/services/StorageService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_BOXES, POST_BOX } from '../../../helpers/url_helper'
import type { StorageBoxItem } from './StorageType'

const storageService = {
  /** GET /boxes?status=stored */
  getStoredBoxes: async (): Promise<StorageBoxItem[]> => {
    return await apiAdapter.get<StorageBoxItem[]>(GET_BOXES, { status: 'stored' })
  },

  /** POST /boxes */
  createBox: async (data: {
    boxLabel: string
    type: string
    blood: string
    location: string
    shelf: string
    collectionDate: string
    units: string[]
  }): Promise<StorageBoxItem> => {
    return await apiAdapter.post<typeof data, StorageBoxItem>(POST_BOX, data)
  },
}

export default storageService
````

## File: frontend/src/pages/storage/services/StorageType.ts
````typescript
// ============================================================
//  src/pages/storage/services/StorageType.ts
// ============================================================

import type { BloodGroup, PlasmaType, StorageLocation, BoxStatus } from '../../../types/models'

export interface StorageBoxItem {
  id: string
  boxLabel: string
  type: PlasmaType
  blood: BloodGroup
  location: StorageLocation
  shelf: string
  collectionDate: string
  units: string[]
  status: BoxStatus
  storedAt: string
}

export interface StorageFormData {
  type: PlasmaType
  blood: BloodGroup
  collectionDate: string
  location: StorageLocation
  shelf: string
}

export interface ToastState {
  type: 'success' | 'error'
  msg: string
}

export const SHELVES_ROOM = ['M1', 'R1', 'R2', 'R3', 'L1', 'L2', 'L3']
export const SHELVES_CABINET = ['C1', 'C2', 'C3']
````

## File: frontend/src/pages/withdraw/components/WithdrawBoxDetail.tsx
````typescript
// ============================================================
//  src/pages/withdraw/components/WithdrawBoxDetail.tsx
// ============================================================

import { PackageOpen, X, Package, Loader2 } from 'lucide-react'
import type { BloodGroup } from '../../../types/models'
import type { WithdrawBoxDetail as BoxDetailType } from '../services/WithdrawType'

const GROUP_COLOR: Record<BloodGroup, string> = {
  A: 'var(--group-a, #3B82F6)', B: 'var(--group-b, #10B981)',
  O: 'var(--group-o, #F59E0B)', AB: 'var(--group-ab, #8B5CF6)',
}
const GROUP_SURFACE: Record<BloodGroup, string> = {
  A: 'var(--group-a-surface, #DBEAFE)', B: 'var(--group-b-surface, #D1FAE5)',
  O: 'var(--group-o-surface, #FEF3C7)', AB: 'var(--group-ab-surface, #EDE9FE)',
}

interface Props {
  box: BoxDetailType | null
  loadingDetail: boolean
  withdrawingBox: boolean
  withdrawingUnits: Set<string>
  onClose: () => void
  onWithdrawBox: (box: BoxDetailType) => void
  onWithdrawUnit: (unitId: string, unitNumber: string) => void
}

export default function WithdrawBoxDetail({
  box, loadingDetail, withdrawingBox, withdrawingUnits,
  onClose, onWithdrawBox, onWithdrawUnit,
}: Props) {

  // Loading state
  if (loadingDetail) {
    return (
      <div style={{
        background: 'var(--surface, #fff)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg, 10px)', padding: 40,
        textAlign: 'center', color: 'var(--text-secondary)',
      }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 8 }}>กำลังโหลด...</p>
      </div>
    )
  }

  // Empty state
  if (!box) {
    return (
      <div style={{
        background: 'var(--surface, #fff)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg, 10px)', padding: 40,
        textAlign: 'center', color: 'var(--text-secondary)',
      }}>
        <Package size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
        <p style={{ fontSize: 14 }}>เลือกกล่องจากรายการด้านซ้าย</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>เพื่อดูรายละเอียดและนำออก</p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      animation: 'plasm-fade-in 0.2s ease',
      position: 'sticky', top: 16,
    }}>
      {/* Box header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: '50%',
            background: GROUP_SURFACE[box.blood], color: GROUP_COLOR[box.blood],
            fontSize: 15, fontWeight: 700,
          }}>{box.blood}</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {box.boxLabel}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {box.type} · {box.location === 'room' ? 'ห้อง' : 'ตู้'} -30°C · ชั้น {box.shelf}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        }}>
          <X size={18} color="var(--text-secondary)" />
        </button>
      </div>

      {/* Info row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 1, background: 'var(--border)',
      }}>
        {[
          { label: 'ทั้งหมด', value: box.unitCount },
          { label: 'เก็บอยู่', value: box.storedCount },
          { label: 'นำออกแล้ว', value: box.unitCount - box.storedCount },
        ].map((item) => (
          <div key={item.label} style={{
            background: 'var(--surface)', padding: '10px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{item.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Withdraw whole box button */}
      {box.status === 'stored' && box.storedCount > 0 && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => onWithdrawBox(box)}
            disabled={withdrawingBox}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: '10px 0',
              borderRadius: 'var(--radius-sm, 6px)',
              border: 'none', background: '#DC2626', color: '#fff',
              fontWeight: 600, fontSize: 14, cursor: withdrawingBox ? 'wait' : 'pointer',
              opacity: withdrawingBox ? 0.7 : 1,
            }}
          >
            <PackageOpen size={16} />
            {withdrawingBox ? 'กำลังนำออก...' : `นำออกทั้งกล่อง (${box.storedCount} units)`}
          </button>
        </div>
      )}

      {/* Unit list */}
      <div style={{ padding: '12px 20px 16px' }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
          รายการ Unit ({box.units.length})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 360, overflowY: 'auto' }}>
          {box.units.map((unit) => {
            const isStored = unit.status === 'stored'
            const isWithdrawing = withdrawingUnits.has(unit.id)
            return (
              <div key={unit.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border, #E4E4E7)',
                opacity: isStored ? 1 : 0.5,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: isStored ? '#16A34A' : '#DC2626',
                  }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>
                    {unit.unitNumber}
                  </span>
                </div>
                {isStored ? (
                  <button
                    onClick={() => onWithdrawUnit(unit.id, unit.unitNumber)}
                    disabled={isWithdrawing}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 'var(--radius-sm, 6px)',
                      border: '1px solid #FECACA', background: '#FEF2F2',
                      color: '#DC2626', fontSize: 12, fontWeight: 600,
                      cursor: isWithdrawing ? 'wait' : 'pointer',
                      opacity: isWithdrawing ? 0.6 : 1,
                    }}
                  >
                    <PackageOpen size={12} />
                    {isWithdrawing ? '...' : 'นำออก'}
                  </button>
                ) : (
                  <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 500 }}>นำออกแล้ว</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
````

## File: frontend/src/pages/withdraw/components/WithdrawBoxList.tsx
````typescript
// ============================================================
//  src/pages/withdraw/components/WithdrawBoxList.tsx
// ============================================================

import { Search, ChevronRight } from 'lucide-react'
import type { BloodGroup } from '../../../types/models'
import type { WithdrawBoxItem } from '../services/WithdrawType'

const GROUP_COLOR: Record<BloodGroup, string> = {
  A: 'var(--group-a, #3B82F6)', B: 'var(--group-b, #10B981)',
  O: 'var(--group-o, #F59E0B)', AB: 'var(--group-ab, #8B5CF6)',
}
const GROUP_SURFACE: Record<BloodGroup, string> = {
  A: 'var(--group-a-surface, #DBEAFE)', B: 'var(--group-b-surface, #D1FAE5)',
  O: 'var(--group-o-surface, #FEF3C7)', AB: 'var(--group-ab-surface, #EDE9FE)',
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid var(--border, #E4E4E7)',
  borderRadius: 'var(--radius-sm, 6px)',
  fontSize: 14,
  background: 'var(--surface, #fff)',
  color: 'var(--text-primary, #18181B)',
  width: '100%',
}

interface Props {
  boxes: WithdrawBoxItem[]
  loading: boolean
  selectedBoxId?: string
  searchQuery: string
  filterBlood: string
  onSearchChange: (q: string) => void
  onFilterBloodChange: (b: string) => void
  onSelectBox: (boxId: string) => void
}

export default function WithdrawBoxList({
  boxes, loading, selectedBoxId,
  searchQuery, filterBlood,
  onSearchChange, onFilterBloodChange, onSelectBox,
}: Props) {
  return (
    <div style={{ flex: '1 1 400px', minWidth: 0 }}>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            placeholder="ค้นหากล่อง หรือ unit..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
        </div>
        <select value={filterBlood} onChange={(e) => onFilterBloodChange(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">ทุกหมู่เลือด</option>
          {(['A', 'B', 'O', 'AB'] as const).map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Box cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
        ) : boxes.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            {searchQuery ? 'ไม่พบกล่องที่ค้นหา' : 'ไม่มีกล่องที่เก็บอยู่'}
          </div>
        ) : (
          boxes.map((box) => {
            const isSelected = selectedBoxId === box.id
            return (
              <button
                key={box.id}
                onClick={() => onSelectBox(box.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', textAlign: 'left', width: '100%',
                  background: isSelected ? 'var(--group-a-surface, #DBEAFE)' : 'var(--surface, #fff)',
                  border: isSelected ? '2px solid var(--primary, #2563EB)' : '1px solid var(--border, #E4E4E7)',
                  borderRadius: 'var(--radius-md, 8px)',
                  cursor: 'pointer', transition: 'border 0.15s',
                }}
              >
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: GROUP_SURFACE[box.blood], color: GROUP_COLOR[box.blood],
                  fontSize: 15, fontWeight: 700,
                }}>{box.blood}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {box.boxLabel}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {box.type} · {box.location === 'room' ? 'ห้อง' : 'ตู้'} -30°C · ชั้น {box.shelf} · {box.units.length} units
                  </div>
                </div>

                <ChevronRight size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
````

## File: frontend/src/pages/withdraw/components/WithdrawConfirmModal.tsx
````typescript
// ============================================================
//  src/pages/withdraw/components/WithdrawConfirmModal.tsx
// ============================================================

import { AlertTriangle, CheckCircle2, AlertCircle, X } from 'lucide-react'
import type { ConfirmAction, ToastState } from '../services/WithdrawType'

// ── Toast ──
export function WithdrawToast({ toast, onDismiss }: { toast: ToastState | null; onDismiss: () => void }) {
  if (!toast) return null

  return (
    <div style={{
      position: 'fixed', top: 16, right: 16, zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '12px 20px', borderRadius: 'var(--radius-md, 8px)',
      background: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
      border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
      color: toast.type === 'success' ? '#166534' : '#991B1B',
      fontSize: 13, fontWeight: 500, boxShadow: 'var(--shadow-md)',
      animation: 'plasm-fade-in 0.2s ease',
    }}>
      {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {toast.msg}
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 8 }}>
        <X size={14} />
      </button>
    </div>
  )
}

// ── Confirm Dialog ──
export function WithdrawConfirmDialog({
  action,
  onCancel,
}: {
  action: ConfirmAction | null
  onCancel: () => void
}) {
  if (!action) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1001,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface, #fff)', borderRadius: 'var(--radius-lg, 10px)',
        padding: 24, width: 400, maxWidth: '90vw', boxShadow: 'var(--shadow-md)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={18} color="#D97706" />
          {action.title}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
          {action.msg}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '8px 18px', borderRadius: 'var(--radius-sm, 6px)',
            border: '1px solid var(--border)', background: 'transparent',
            fontSize: 14, cursor: 'pointer',
          }}>
            ยกเลิก
          </button>
          <button onClick={action.onConfirm} style={{
            padding: '8px 18px', borderRadius: 'var(--radius-sm, 6px)',
            border: 'none', background: '#DC2626', color: '#fff',
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>
            ยืนยันนำออก
          </button>
        </div>
      </div>
    </div>
  )
}
````

## File: frontend/src/pages/withdraw/services/useWithdraw.ts
````typescript
// ============================================================
//  src/pages/withdraw/services/useWithdraw.ts
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import withdrawService from './WithdrawService'
import type {
  WithdrawBoxItem,
  WithdrawBoxDetail,
  ConfirmAction,
  ToastState,
} from './WithdrawType'

export default function useWithdraw() {
  // ── Box list ──
  const [boxes, setBoxes] = useState<WithdrawBoxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBlood, setFilterBlood] = useState<string>('')

  // ── Detail / withdraw ──
  const [selectedBox, setSelectedBox] = useState<WithdrawBoxDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [withdrawingBox, setWithdrawingBox] = useState(false)
  const [withdrawingUnits, setWithdrawingUnits] = useState<Set<string>>(new Set())

  // ── UI feedback ──
  const [toast, setToast] = useState<ToastState | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  // ── Load stored boxes ──
  const loadBoxes = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filterBlood) params.blood = filterBlood
      const data = await withdrawService.getStoredBoxes(params)
      setBoxes(data)
    } catch {
      setBoxes([])
    } finally {
      setLoading(false)
    }
  }, [filterBlood])

  useEffect(() => { loadBoxes() }, [loadBoxes])

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  // ── Open box detail ──
  const openBoxDetail = async (boxId: string) => {
    setLoadingDetail(true)
    try {
      const data = await withdrawService.getBoxDetail(boxId)
      setSelectedBox(data)
    } catch {
      setToast({ type: 'error', msg: 'ไม่สามารถโหลดรายละเอียดกล่องได้' })
    } finally {
      setLoadingDetail(false)
    }
  }

  const closeBoxDetail = () => setSelectedBox(null)

  // ── Withdraw whole box ──
  const handleWithdrawBox = (box: WithdrawBoxDetail) => {
    setConfirmAction({
      title: 'นำออกทั้งกล่อง',
      msg: `ยืนยันนำออกกล่อง ${box.boxLabel} ทั้งหมด ${box.storedCount} units?`,
      onConfirm: async () => {
        setConfirmAction(null)
        setWithdrawingBox(true)
        try {
          await withdrawService.withdrawBox(box.id)
          setToast({ type: 'success', msg: `นำออกกล่อง ${box.boxLabel} สำเร็จ` })
          setSelectedBox(null)
          loadBoxes()
        } catch (err: any) {
          setToast({ type: 'error', msg: err?.response?.data?.message || 'เกิดข้อผิดพลาด' })
        } finally {
          setWithdrawingBox(false)
        }
      },
    })
  }

  // ── Withdraw single unit ──
  const handleWithdrawUnit = (unitId: string, unitNumber: string) => {
    setConfirmAction({
      title: 'นำออก Unit',
      msg: `ยืนยันนำออก unit ${unitNumber}?`,
      onConfirm: async () => {
        setConfirmAction(null)
        setWithdrawingUnits((s) => new Set(s).add(unitId))
        try {
          await withdrawService.withdrawUnit(unitId)
          setToast({ type: 'success', msg: `นำออก unit ${unitNumber} สำเร็จ` })
          // Reload detail
          if (selectedBox) {
            const updated = await withdrawService.getBoxDetail(selectedBox.id)
            setSelectedBox(updated)
          }
          loadBoxes()
        } catch (err: any) {
          setToast({ type: 'error', msg: err?.response?.data?.message || 'เกิดข้อผิดพลาด' })
        } finally {
          setWithdrawingUnits((s) => { const n = new Set(s); n.delete(unitId); return n })
        }
      },
    })
  }

  // ── Cancel confirm ──
  const cancelConfirm = () => setConfirmAction(null)
  const dismissToast = () => setToast(null)

  // ── Filtered boxes ──
  const filteredBoxes = boxes.filter((b) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return b.boxLabel.toLowerCase().includes(q) || b.units.some((u) => u.toLowerCase().includes(q))
  })

  return {
    // data
    boxes,
    filteredBoxes,
    selectedBox,
    loading,
    loadingDetail,
    withdrawingBox,
    withdrawingUnits,
    toast,
    confirmAction,
    searchQuery,
    filterBlood,
    // actions
    setSearchQuery,
    setFilterBlood,
    openBoxDetail,
    closeBoxDetail,
    handleWithdrawBox,
    handleWithdrawUnit,
    cancelConfirm,
    dismissToast,
  }
}
````

## File: frontend/src/pages/withdraw/services/WithdrawService.ts
````typescript
// ============================================================
//  src/pages/withdraw/services/WithdrawService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import {
  GET_BOXES,
  GET_BOX_DETAIL,
  PATCH_BOX_WITHDRAW,
  PATCH_UNIT_WITHDRAW,
} from '../../../helpers/url_helper'
import type { WithdrawBoxItem, WithdrawBoxDetail } from './WithdrawType'

const withdrawService = {
  /** GET /boxes?status=stored (&blood=) */
  getStoredBoxes: async (params?: Record<string, string>): Promise<WithdrawBoxItem[]> => {
    return await apiAdapter.get<WithdrawBoxItem[]>(GET_BOXES, { status: 'stored', ...params })
  },

  /** GET /boxes/:id */
  getBoxDetail: async (id: string): Promise<WithdrawBoxDetail> => {
    return await apiAdapter.getById<WithdrawBoxDetail>(GET_BOX_DETAIL, id)
  },

  /** PATCH /boxes/:id/withdraw */
  withdrawBox: async (id: string): Promise<{ message: string }> => {
    return await apiAdapter.patch<undefined, { message: string }>(
      `${PATCH_BOX_WITHDRAW}/${id}/withdraw`,
    )
  },

  /** PATCH /units/:id/withdraw */
  withdrawUnit: async (unitId: string): Promise<{ message: string }> => {
    return await apiAdapter.patch<undefined, { message: string }>(
      `${PATCH_UNIT_WITHDRAW}/${unitId}/withdraw`,
    )
  },
}

export default withdrawService
````

## File: frontend/src/pages/withdraw/services/WithdrawType.ts
````typescript
// ============================================================
//  src/pages/withdraw/services/WithdrawType.ts
// ============================================================

import type { BloodGroup, PlasmaType, StorageLocation, BoxStatus } from '../../../types/models'

// ── Box item (from GET /boxes list) ──
export interface WithdrawBoxItem {
  id: string
  boxLabel: string
  type: PlasmaType
  blood: BloodGroup
  location: StorageLocation
  shelf: string
  collectionDate: string
  units: string[]
  status: BoxStatus
  storedAt: string
  withdrawnAt?: string
}

// ── Unit detail (from GET /boxes/:id) ──
export interface WithdrawUnitInfo {
  id: string
  unitNumber: string
  status: 'stored' | 'withdrawn'
}

// ── Box detail (from GET /boxes/:id) ──
export interface WithdrawBoxDetail {
  id: string
  boxLabel: string
  type: PlasmaType
  blood: BloodGroup
  location: StorageLocation
  shelf: string
  collectionDate: string
  units: WithdrawUnitInfo[]
  unitCount: number
  storedCount: number
  status: BoxStatus
  storedAt: string
  withdrawnAt?: string
}

// ── Confirm action ──
export interface ConfirmAction {
  title: string
  msg: string
  onConfirm: () => void
}

// ── Toast ──
export interface ToastState {
  type: 'success' | 'error'
  msg: string
}
````

## File: frontend/src/pages/withdraw/index.tsx
````typescript
// ============================================================
//  src/pages/withdraw/index.tsx
// ============================================================

import useWithdraw from './services/useWithdraw'
import WithdrawBoxList from './components/WithdrawBoxList'
import WithdrawBoxDetail from './components/WithdrawBoxDetail'
import { WithdrawToast, WithdrawConfirmDialog } from './components/WithdrawConfirmModal'

const WithdrawPage = () => {
  const {
    filteredBoxes,
    selectedBox,
    loading,
    loadingDetail,
    withdrawingBox,
    withdrawingUnits,
    toast,
    confirmAction,
    searchQuery,
    filterBlood,
    setSearchQuery,
    setFilterBlood,
    openBoxDetail,
    closeBoxDetail,
    handleWithdrawBox,
    handleWithdrawUnit,
    cancelConfirm,
    dismissToast,
  } = useWithdraw()

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>

      <WithdrawToast toast={toast} onDismiss={dismissToast} />
      <WithdrawConfirmDialog action={confirmAction} onCancel={cancelConfirm} />

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>นำออกพลาสมา</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          เลือกกล่องเพื่อนำออกทั้งกล่อง หรือเลือกนำออกรายถุง
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Left — Box List */}
        <WithdrawBoxList
          boxes={filteredBoxes}
          loading={loading}
          selectedBoxId={selectedBox?.id}
          searchQuery={searchQuery}
          filterBlood={filterBlood}
          onSearchChange={setSearchQuery}
          onFilterBloodChange={setFilterBlood}
          onSelectBox={openBoxDetail}
        />

        {/* Right — Box Detail */}
        <div style={{ flex: '1 1 360px', minWidth: 0 }}>
          <WithdrawBoxDetail
            box={selectedBox}
            loadingDetail={loadingDetail}
            withdrawingBox={withdrawingBox}
            withdrawingUnits={withdrawingUnits}
            onClose={closeBoxDetail}
            onWithdrawBox={handleWithdrawBox}
            onWithdrawUnit={handleWithdrawUnit}
          />
        </div>
      </div>
    </div>
  )
}

export default WithdrawPage
````

## File: frontend/src/pages/withdraw/WithdrawPage.tsx
````typescript
// frontend/src/pages/withdraw/WithdrawPage.tsx

import { PackageOpen } from 'lucide-react'

export default function WithdrawPage() {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <PackageOpen size={18} style={{ color: 'var(--color-primary)' }} />
        นำออกพลาสมา
      </h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>นำออกเป็นกล่อง หรือเป็น Unit</p>
    </div>
  )
}
````

## File: frontend/src/types/models.ts
````typescript
// frontend/src/types/models.ts

// ===== Blood Type =====
export type BloodGroup = 'A' | 'B' | 'O' | 'AB'
export type PlasmaType = 'FFP' | 'Cryo'
export type StorageLocation = 'room' | 'cabinet'
export type BoxStatus = 'stored' | 'withdrawn'

// ===== Box =====
export interface Box {
  id: string
  boxLabel: string
  type: PlasmaType
  blood: BloodGroup
  location: StorageLocation
  shelf: string
  collectionDate: string
  units: string[]
  status: BoxStatus
  storedAt: string
  withdrawnAt?: string
}

// ===== Log Entry =====
export type LogAction = 'store' | 'withdraw'

export interface LogEntry {
  id: string
  action: LogAction
  boxLabel: string
  type: PlasmaType
  blood: BloodGroup
  units: string[]
  location?: StorageLocation
  shelf?: string
  timestamp: string
  detail: string
  performedBy?: string
}

// ===== Stock =====
export interface StockSummary {
  blood: BloodGroup
  count: number
  minimum: number
  isLow: boolean
}

// ===== Shelf Position =====
export interface ShelfConfig {
  room: string[]
  cabinet: string[]
}

// ===== Settings =====
export interface MinimumStock {
  A: number
  B: number
  O: number
  AB: number
}

// ===== Summary Card =====
export interface SummaryCardData {
  label: string
  value: string
  icon: React.ComponentType<{ size?: number }>
  color: string
  bg: string
  sub?: string
}
````

## File: frontend/src/types/navigation.ts
````typescript
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
  type LucideIcon,
} from 'lucide-react'

export type UserRole = 'ADMIN' | 'STAFF'

export interface MenuItem {
  key: string
  label: string
  icon: LucideIcon
  roles: UserRole[]
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
  settings: 'ตั้งค่า',
}
````

## File: frontend/src/App.tsx
````typescript
// frontend/src/App.tsx

import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './Routes'

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
````

## File: frontend/src/index.css
````css
@import "tailwindcss";

/* ===== Plasm Design Tokens (from tokens.json) ===== */

:root {
  /* Background & Surface */
  --color-bg: #f0f4f8;
  --color-surface: #ffffff;
  --color-surface-alt: #f7f9fc;
  --color-border: #d8dee6;

  /* Primary (Blue) */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-light: #dbeafe;

  /* Text */
  --color-text: #1a2332;
  --color-text-muted: #5a6a7e;

  /* Danger */
  --color-danger: #dc2626;
  --color-danger-light: #fef2f2;
  --color-danger-border: #fecaca;

  /* Warning */
  --color-warning: #f59e0b;
  --color-warning-light: #fffbeb;
  --color-warning-border: #fde68a;

  /* Success */
  --color-success: #16a34a;
  --color-success-light: #f0fdf4;
  --color-success-border: #bbf7d0;

  /* Blood Types */
  --color-blood-a: #e74c3c;
  --color-blood-b: #3498db;
  --color-blood-o: #2ecc71;
  --color-blood-ab: #9b59b6;

  /* Typography */
  --font-sans: 'Segoe UI', system-ui, -apple-system, sans-serif;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-full: 99px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 6px;
  --space-3: 8px;
  --space-4: 12px;
  --space-5: 16px;
  --space-6: 20px;
  --space-7: 24px;

  /* Shadow */
  --shadow-sm: 0 1px 3px rgba(0,0,0,.08);
  --shadow-lg: 0 4px 16px rgba(0,0,0,.1);
}

/* ===== Dark Theme ===== */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg: #0f1419;
    --color-surface: #1c2430;
    --color-surface-alt: #232d3b;
    --color-border: #2e3a4a;
    --color-text: #e2e8f0;
    --color-text-muted: #8899aa;
    --color-primary: #3b82f6;
    --color-primary-hover: #60a5fa;
    --color-primary-light: #1e3a5f;
    --color-danger-light: #3b1515;
    --color-danger-border: #7f1d1d;
    --color-warning-light: #3b2f0a;
    --color-warning-border: #78600a;
    --color-success-light: #0a3b1a;
    --color-success-border: #0a6b2a;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.3);
    --shadow-lg: 0 4px 16px rgba(0,0,0,.4);
  }
}

/* ===== Base ===== */
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body, #root {
  height: 100%;
  width: 100%;
}

body {
  font-family: var(--font-sans);
  color: var(--color-text);
  background-color: var(--color-bg);
  -webkit-font-smoothing: antialiased;
}

::selection {
  background-color: var(--color-primary-light);
  color: var(--color-text);
}
````

## File: frontend/.gitignore
````
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Build outputs
dist/
build/
*.log
npm-debug.log*

# Docker
.dockerignore

# Database
*.sql
!schema.sql

# Secrets
*.key
*.pem
!*.example

# Temp
tmp/
temp/
/cache/
````

## File: frontend/README.md
````markdown
# Plasm — ระบบจัดเก็บและนำออกพลาสมา

ระบบเว็บแอปสำหรับจัดเก็บและนำออกพลาสมา (FFP) ในธนาคารเลือด

## Features

- 📊 **แดชบอร์ด** — แสดงสต็อกแยกตามหมู่เลือด พร้อม Alert เมื่อต่ำกว่า minimum
- 📦 **จัดเก็บ** — รันหมายเลขกล่องอัตโนมัติ, พิมพ์บาร์โค้ด, ตรวจจับ Unit ซ้ำ
- 📤 **นำออก** — นำออกทั้งกล่อง หรือเป็น Unit
- 🔍 **ค้นหา** — ค้นหา Unit ว่าอยู่กล่องไหน ตำแหน่งไหน
- 🗺️ **แผนผัง** — แผนผังห้อง -30°C (7 ตำแหน่ง) และตู้ -30°C
- 📋 **ประวัติ** — บันทึกทุกการจัดเก็บ/นำออก

## Minimum Stock Alert

| หมู่เลือด | ขั้นต่ำ (units) |
|-----------|----------------|
| A         | 150            |
| B         | 300            |
| O         | 300            |
| AB        | 100            |

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend:** Express + TypeScript
- **Icons:** Lucide React
- **Table:** TanStack Table
- **HTTP:** Axios + Mock Adapter (dev)
- **Barcode:** JsBarcode

## Getting Started

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

## Project Structure

```
plasm/
├── backend/
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── Routes/          # Route config + guards
│   │   ├── common/data/     # Mock data
│   │   ├── components/
│   │   │   ├── layout/      # MainLayout, Sidebar, TopBar, BottomNav
│   │   │   └── shared/      # Reusable components
│   │   ├── helpers/          # API client, URL config, fake backend
│   │   ├── pages/            # Page components
│   │   └── types/            # TypeScript types
│   ├── tailwind.config.ts
│   └── vite.config.ts
├── .gitignore
└── README.md
```
````

## File: frontend/tailwind.config.ts
````typescript
// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background & Surface
        bg: '#f0f4f8',
        surface: {
          DEFAULT: '#ffffff',
          alt: '#f7f9fc',
        },
        border: '#d8dee6',

        // Primary (Blue — Plasm Design System)
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          light: '#dbeafe',
        },

        // Text
        text: {
          DEFAULT: '#1a2332',
          muted: '#5a6a7e',
        },

        // Danger
        danger: {
          DEFAULT: '#dc2626',
          light: '#fef2f2',
          border: '#fecaca',
        },

        // Warning
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fffbeb',
          border: '#fde68a',
        },

        // Success
        success: {
          DEFAULT: '#16a34a',
          light: '#f0fdf4',
          border: '#bbf7d0',
        },

        // Blood types
        blood: {
          a: '#e74c3c',
          b: '#3498db',
          o: '#2ecc71',
          ab: '#9b59b6',
        },
      },

      fontFamily: {
        sans: ['"Noto Sans Thai Variable"', '"Segoe UI"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        // Display
        'display': ['36px', { lineHeight: '1.1', fontWeight: '700' }],

        // Heading
        'heading': ['22px', { lineHeight: '28px', fontWeight: '700' }],

        // Body
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],

        // Label
        'label': ['13px', { lineHeight: '18px', fontWeight: '500' }],

        // Caption
        'caption': ['12px', { lineHeight: '16px', fontWeight: '600' }],
      },

      spacing: {
        1: '4px',
        2: '6px',
        3: '8px',
        4: '12px',
        5: '16px',
        6: '20px',
        7: '24px',
      },

      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
        full: '99px',
      },

      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,.08)',
        lg: '0 4px 16px rgba(0,0,0,.1)',
      },
    },
  },
  plugins: [],
} satisfies Config
````

## File: frontend/tsconfig.app.json
````json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
````

## File: frontend/tsconfig.json
````json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
````

## File: frontend/tsconfig.node.json
````json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
````

## File: .gitignore
````
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Build outputs
dist/
build/
*.log
npm-debug.log*

# Docker
.dockerignore

# Database
*.sql
!schema.sql

# Secrets
*.key
*.pem
!*.example

# Temp
tmp/
temp/
/cache/
````

## File: .github/workflows/deploy.yml
````yaml
name: Deploy Plasm

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Connect to Tailscale
        uses: tailscale/github-action@v3
        with:
          authkey: ${{ secrets.TAILSCALE_AUTHKEY }}

      - name: Deploy via SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key

          ssh -o StrictHostKeyChecking=no -i ~/.ssh/deploy_key athiwat@${{ secrets.SERVER_TAILSCALE_IP }} << 'ENDSSH'
            cd /home/athiwat/plasm
            git pull origin main

            cd backend
            npm install
            npx prisma migrate deploy
            npx prisma generate
            pm2 restart plasm-backend

            cd ../frontend
            npm install
            npm run build
          ENDSSH
````

## File: backend/src/routes/boxes.ts
````typescript
// src/routes/boxes.ts

import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// ===== GET /api/v1/boxes =====
router.get('/', async (req, res) => {
  try {
    const { blood, location, status } = req.query

    const where: Record<string, unknown> = {}
    if (blood) where.blood = (blood as string).toUpperCase()
    if (location) where.location = (location as string).toUpperCase()
    if (status) where.status = (status as string).toUpperCase()

    const boxes = await prisma.box.findMany({
      where,
      include: { units: { select: { unitNumber: true, status: true } } },
      orderBy: { storedAt: 'desc' },
    })

    // map ให้ตรง format frontend
    const result = boxes.map((b) => ({
      id: b.id,
      boxLabel: b.boxLabel,
      type: b.type,
      blood: b.blood,
      location: b.location.toLowerCase(),
      shelf: b.shelf,
      collectionDate: b.collectionDate.toISOString().split('T')[0],
      units: b.units.map((u) => u.unitNumber),
      status: b.status.toLowerCase(),
      storedAt: b.storedAt.toISOString(),
      withdrawnAt: b.withdrawnAt?.toISOString() || null,
    }))

    res.json(result)
  } catch (error) {
    console.error('GET /boxes error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== GET /api/v1/boxes/:id =====
router.get('/:id', async (req, res) => {
  try {
    const box = await prisma.box.findUnique({
      where: { id: req.params.id },
      include: { units: { select: { id: true, unitNumber: true, status: true } } },
    })

    if (!box) {
      res.status(404).json({ message: 'ไม่พบกล่อง' })
      return
    }

    res.json({
      id: box.id,
      boxLabel: box.boxLabel,
      type: box.type,
      blood: box.blood,
      location: box.location.toLowerCase(),
      shelf: box.shelf,
      collectionDate: box.collectionDate.toISOString().split('T')[0],
      units: box.units.map((u) => ({
        id: u.id,
        unitNumber: u.unitNumber,
        status: u.status.toLowerCase(),
      })),
      unitCount: box.units.length,
      storedCount: box.units.filter((u) => u.status === 'STORED').length,
      status: box.status.toLowerCase(),
      storedAt: box.storedAt.toISOString(),
      withdrawnAt: box.withdrawnAt?.toISOString() || null,
    })
  } catch (error) {
    console.error('GET /boxes/:id error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== POST /api/v1/boxes =====
router.post('/', async (req, res) => {
  try {
    const { boxLabel, type, blood, location, shelf, collectionDate, units } = req.body

    // ตรวจ unit ซ้ำ
    if (units?.length) {
      const existing = await prisma.unit.findMany({
        where: { unitNumber: { in: units } },
        select: { unitNumber: true },
      })
      if (existing.length > 0) {
        const dupes = existing.map((u) => u.unitNumber)
        res.status(409).json({
          message: `Unit ซ้ำ: ${dupes.join(', ')}`,
          duplicates: dupes,
        })
        return
      }
    }

    const box = await prisma.box.create({
      data: {
        boxLabel,
        type: type || 'FFP',
        blood: blood.toUpperCase(),
        location: location.toUpperCase(),
        shelf,
        collectionDate: new Date(collectionDate),
        status: 'STORED',
        units: {
          create: (units || []).map((u: string) => ({ unitNumber: u })),
        },
        logs: {
          create: {
            action: 'STORE',
            detail: `จัดเก็บกล่อง ${boxLabel} จำนวน ${units?.length || 0} units`,
            userId: req.user?.id,
          },
        },
      },
      include: { units: { select: { unitNumber: true } } },
    })

    res.status(201).json({
      id: box.id,
      boxLabel: box.boxLabel,
      type: box.type,
      blood: box.blood,
      location: box.location.toLowerCase(),
      shelf: box.shelf,
      collectionDate: box.collectionDate.toISOString().split('T')[0],
      units: box.units.map((u) => u.unitNumber),
      status: box.status.toLowerCase(),
      storedAt: box.storedAt.toISOString(),
    })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ message: 'หมายเลขกล่องซ้ำ' })
      return
    }
    console.error('POST /boxes error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== PATCH /api/v1/boxes/:id/withdraw =====
router.patch('/:id/withdraw', async (req, res) => {
  try {
    const box = await prisma.box.findUnique({
      where: { id: req.params.id },
      include: { units: true },
    })

    if (!box) {
      res.status(404).json({ message: 'ไม่พบกล่อง' })
      return
    }

    if (box.status === 'WITHDRAWN') {
      res.status(400).json({ message: 'กล่องนี้ถูกนำออกแล้ว' })
      return
    }

    const now = new Date()

    await prisma.$transaction([
      prisma.box.update({
        where: { id: box.id },
        data: { status: 'WITHDRAWN', withdrawnAt: now },
      }),
      prisma.unit.updateMany({
        where: { boxId: box.id },
        data: { status: 'WITHDRAWN' },
      }),
      prisma.logEntry.create({
        data: {
          action: 'WITHDRAW',
          boxId: box.id,
          detail: `นำออกกล่อง ${box.boxLabel} จำนวน ${box.units.length} units`,
          userId: req.user?.id,
        },
      }),
    ])

    res.json({ message: `นำออกกล่อง ${box.boxLabel} สำเร็จ` })
  } catch (error) {
    console.error('PATCH /boxes/:id/withdraw error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router
````

## File: backend/src/routes/stock.ts
````typescript
// src/routes/stock.ts

import { Router } from 'express'
import { prisma } from '../lib/prisma'
import type { BloodGroup } from '@prisma/client'

const router = Router()

// ===== GET /api/v1/stock/summary =====
router.get('/summary', async (_req, res) => {
  try {
    // นับ unit ที่ยังเก็บอยู่ แยกตามหมู่เลือด
    const counts = await prisma.unit.groupBy({
      by: ['status'],
      where: {
        status: 'STORED',
        box: { status: 'STORED' },
      },
      _count: true,
    })

    // นับแยกตาม blood group ผ่าน raw query เพื่อประสิทธิภาพ
    const stockByBlood = await prisma.$queryRaw<
      { blood: BloodGroup; count: bigint }[]
    >`
      SELECT b.blood, COUNT(u.id) as count
      FROM units u
      JOIN boxes b ON u.box_id = b.id
      WHERE u.status = 'STORED' AND b.status = 'STORED'
      GROUP BY b.blood
    `

    const stocks: Record<string, number> = { A: 0, B: 0, O: 0, AB: 0 }
    for (const row of stockByBlood) {
      stocks[row.blood] = Number(row.count)
    }

    // ดึง minimum stock setting
    const setting = await prisma.setting.findUnique({
      where: { key: 'minimumStock' },
    })
    const minimum = (setting?.value as Record<string, number>) || {
      A: 150, B: 300, O: 300, AB: 100,
    }

    // คำนวณ % change (เทียบ 7 วันก่อน)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const pastStockByBlood = await prisma.$queryRaw<
      { blood: BloodGroup; count: bigint }[]
    >`
      SELECT b.blood, COUNT(u.id) as count
      FROM units u
      JOIN boxes b ON u.box_id = b.id
      WHERE u.status = 'STORED' AND b.status = 'STORED'
        AND u.created_at <= ${sevenDaysAgo}
      GROUP BY b.blood
    `

    const pastStocks: Record<string, number> = { A: 0, B: 0, O: 0, AB: 0 }
    for (const row of pastStockByBlood) {
      pastStocks[row.blood] = Number(row.count)
    }

    const change: Record<string, number> = {}
    for (const g of ['A', 'B', 'O', 'AB']) {
      const prev = pastStocks[g]
      const curr = stocks[g]
      change[g] = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : (curr > 0 ? 100 : 0)
    }

    res.json({ stocks, minimum, change })
  } catch (error) {
    console.error('GET /stock/summary error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== GET /api/v1/stock/daily?days=7 =====
// จำนวน unit ที่จัดเก็บ (STORE) แต่ละวัน
router.get('/daily', async (req, res) => {
  try {
    const days = Math.min(Number(req.query.days) || 7, 30)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (days - 1))
    startDate.setHours(0, 0, 0, 0)

    const rows = await prisma.$queryRaw<
      { day: Date; count: bigint }[]
    >`
      SELECT DATE(le.timestamp) as day, COUNT(le.id) as count
      FROM log_entries le
      WHERE le.action = 'STORE'
        AND le.timestamp >= ${startDate}
      GROUP BY DATE(le.timestamp)
      ORDER BY day ASC
    `

    // เติมวันที่ไม่มีข้อมูลเป็น 0
    const result: { label: string; value: number }[] = []
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const found = rows.find((r) => {
        const rDate = new Date(r.day).toISOString().split('T')[0]
        return rDate === dateStr
      })
      result.push({
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        value: found ? Number(found.count) : 0,
      })
    }

    res.json(result)
  } catch (error) {
    console.error('GET /stock/daily error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router
````

## File: backend/src/routes/units.ts
````typescript
// src/routes/units.ts

import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// ===== GET /api/v1/units =====
router.get('/', async (_req, res) => {
  try {
    const units = await prisma.unit.findMany({
      include: {
        box: { select: { boxLabel: true, blood: true, location: true, shelf: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(units)
  } catch (error) {
    console.error('GET /units error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== GET /api/v1/units/search?q= =====
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q as string || '').trim()
    if (!q) {
      res.json([])
      return
    }

    const units = await prisma.unit.findMany({
      where: {
        OR: [
          { unitNumber: { contains: q, mode: 'insensitive' } },
          { box: { boxLabel: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: {
        box: {
          select: {
            id: true,
            boxLabel: true,
            blood: true,
            type: true,
            location: true,
            shelf: true,
            status: true,
            collectionDate: true,
          },
        },
      },
      take: 50,
    })

    const result = units.map((u) => ({
      id: u.id,
      unitNumber: u.unitNumber,
      status: u.status.toLowerCase(),
      box: {
        id: u.box.id,
        boxLabel: u.box.boxLabel,
        blood: u.box.blood,
        type: u.box.type,
        location: u.box.location.toLowerCase(),
        shelf: u.box.shelf,
        status: u.box.status.toLowerCase(),
        collectionDate: u.box.collectionDate.toISOString().split('T')[0],
      },
    }))

    res.json(result)
  } catch (error) {
    console.error('GET /units/search error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

// ===== PATCH /api/v1/units/:id/withdraw =====
router.patch('/:id/withdraw', async (req, res) => {
  try {
    const unit = await prisma.unit.findUnique({
      where: { id: req.params.id },
      include: { box: true },
    })

    if (!unit) {
      res.status(404).json({ message: 'ไม่พบ unit' })
      return
    }

    if (unit.status === 'WITHDRAWN') {
      res.status(400).json({ message: 'Unit นี้ถูกนำออกแล้ว' })
      return
    }

    await prisma.$transaction([
      prisma.unit.update({
        where: { id: unit.id },
        data: { status: 'WITHDRAWN' },
      }),
      prisma.logEntry.create({
        data: {
          action: 'WITHDRAW',
          boxId: unit.boxId,
          detail: `นำออก unit ${unit.unitNumber} จากกล่อง ${unit.box.boxLabel}`,
          userId: req.user?.id,
        },
      }),
    ])

    res.json({ message: `นำออก unit ${unit.unitNumber} สำเร็จ` })
  } catch (error) {
    console.error('PATCH /units/:id/withdraw error:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
})

export default router
````

## File: backend/src/routes/users.ts
````typescript
// src/routes/users.ts

import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { adminOnly } from '../middleware/auth'

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

    const data: { name?: string; role?: string; active?: boolean; password?: string } = {}
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
````

## File: backend/src/index.ts
````typescript
// src/index.ts
// Plasm Backend — Express + Prisma + PostgreSQL

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authGuard } from './middleware/auth'

// Routes
import authRoutes from './routes/auth'
import boxRoutes from './routes/boxes'
import unitRoutes from './routes/units'
import stockRoutes from './routes/stock'
import logRoutes from './routes/log'
import settingsRoutes from './routes/settings'
import usersRoutes from './routes/users'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// ===== Middleware =====
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

// ===== Health check =====
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', service: 'plasm-backend' })
})

// ===== Public routes =====
app.use('/api/v1/auth', authRoutes)

// ===== Protected routes =====
app.use('/api/v1/boxes', authGuard, boxRoutes)
app.use('/api/v1/units', authGuard, unitRoutes)
app.use('/api/v1/stock', authGuard, stockRoutes)
app.use('/api/v1/log', authGuard, logRoutes)
app.use('/api/v1/settings', authGuard, settingsRoutes)
app.use('/api/v1/users', authGuard, usersRoutes)

// ===== Start =====
app.listen(PORT, () => {
  console.log(`🚀 Plasm backend running at http://localhost:${PORT}`)
  console.log(`📋 API base: http://localhost:${PORT}/api/v1`)
})
````

## File: backend/package.json
````json
{
  "name": "plasm-backend",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "npx prisma migrate dev",
    "db:push": "npx prisma db push",
    "db:seed": "npx prisma db seed",
    "db:studio": "npx prisma studio",
    "db:reset": "npx prisma migrate reset"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^6.9.0",
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^3.0.0",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.9",
    "@types/node": "^22.20.3",
    "prisma": "^6.9.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  }
}
````

## File: frontend/src/components/layout/MainLayout.tsx
````typescript
// frontend/src/components/layout/MainLayout.tsx

import { useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import type { UserRole } from '../../types/navigation'

interface MainLayoutProps {
  children: ReactNode
  activeModule: string
  onNavigate: (key: string) => void
  role?: UserRole
  userName?: string
  onLogout?: () => void
}

export default function MainLayout({
  children,
  activeModule,
  onNavigate,
  role = 'ADMIN',
  userName = 'ผู้ดูแลระบบ',
  onLogout,
}: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        activeModule={activeModule}
        onNavigate={onNavigate}
        role={role}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <TopBar activeModule={activeModule} userName={userName} userRole={role} />

        <main className="flex-1 min-h-0 overflow-auto" style={{ padding: 24, background: 'var(--background)' }}>
          {children}
        </main>

        <BottomNav activeModule={activeModule} onNavigate={onNavigate} />
      </div>
    </div>
  )
}
````

## File: frontend/src/components/layout/Sidebar.tsx
````typescript
// frontend/src/components/layout/Sidebar.tsx

import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { MENU_ITEMS, type UserRole } from '../../types/navigation'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  activeModule: string
  onNavigate: (key: string) => void
  role: UserRole
  onLogout?: () => void
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  activeModule,
  onNavigate,
  role,
  onLogout,
}: SidebarProps) {
  const filteredMenu = MENU_ITEMS.filter((m) => m.roles.includes(role))

  return (
    <aside
      className="hidden md:flex flex-col flex-none transition-all duration-150 ease-in-out overflow-hidden"
      style={{
        width: collapsed ? 68 : 240,
        background: 'var(--primary)',
        backgroundImage: 'url(/sidebar-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 10,
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex-none flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            P
          </div>
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: 17, color: '#fff', whiteSpace: 'nowrap' }}>
              Plasm
            </span>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          aria-label="ย่อ/ขยายเมนู"
          style={{
            width: 24, height: 24, borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: 'none', flexShrink: 0, color: '#fff',
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        {filteredMenu.map((item) => {
          const isActive = activeModule === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                marginBottom: 2,
                background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                color: '#fff', fontSize: 14, fontWeight: 500,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={20} />
              {!collapsed && item.label}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '8px 8px 12px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <button
          onClick={onLogout}
          title={collapsed ? 'ออกจากระบบ' : undefined}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: collapsed ? '10px 0' : '10px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'rgba(255,255,255,0.7)',
            fontSize: 14, fontWeight: 500, transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
          }}
        >
          <LogOut size={20} />
          {!collapsed && 'ออกจากระบบ'}
        </button>
      </div>
    </aside>
  )
}
````

## File: frontend/src/components/layout/TopBar.tsx
````typescript
// frontend/src/components/layout/TopBar.tsx

import { User } from 'lucide-react'
import { PAGE_TITLES, type UserRole } from '../../types/navigation'

interface TopBarProps {
  activeModule: string
  userName: string
  userRole: UserRole
}

export default function TopBar({ activeModule, userName }: TopBarProps) {
  const title = PAGE_TITLES[activeModule] || 'Plasm'

  return (
    <header
      className="flex items-center justify-between px-6 flex-none"
      style={{
        height: 56,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <h1 style={{ fontWeight: 700, fontSize: 18, lineHeight: '28px' }}>
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{userName}</span>
        <div
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--surface-raised)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <User size={16} color="var(--text-secondary)" />
        </div>
      </div>
    </header>
  )
}
````

## File: frontend/src/helpers/api_helper.ts
````typescript
// frontend/src/helpers/api_helper.ts
//
// Backward-compatible wrapper + re-export layer ใหม่
// ไฟล์เก่า import { apiClient, axiosApi } ยังใช้ได้

import axiosInstance from './http/axiosInstance'
import apiAdapter from './http/apiAdapter'

// ===== Backward-compatible exports =====
export const axiosApi = axiosInstance
export const apiClient = apiAdapter

// ===== Re-export layer ใหม่ =====
export { default as apiAdapter } from './http/apiAdapter'
export { default as axiosInstance } from './http/axiosInstance'
export { setInstanceToken, clearInstanceToken } from './http/axiosInstance'
export type { ApiResponse, ApiError, GetParams, BlobRequestOptions } from './http/types'
````

## File: frontend/src/pages/auth/LoginPage.tsx
````typescript
// frontend/src/pages/auth/LoginPage.tsx

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../../helpers/services/authService'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน')
      return
    }

    setLoading(true)
    try {
      await authService.login({ username: username.trim(), password })
      navigate('/', { replace: true })
    } catch (err: any) {
      const msg = err?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ───── Left panel: branding ───── */}
      <div
        className="hidden md:flex"
        style={{
          flex: '1 1 60%',
          background: 'var(--primary, #2563EB)',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 48px 32px',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -100, right: -60,
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -40,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', top: '35%', right: '30%',
          width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        {/* Top: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#fff',
          }}>
            P
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Plasm</span>
        </div>

        {/* Middle: Hero text */}
        <div style={{ position: 'relative' }}>
          <h1 style={{
            fontSize: 42, fontWeight: 700, color: '#fff',
            lineHeight: 1.2, marginBottom: 20,
          }}>
            ระบบจัดเก็บและ<br />นำออกพลาสมา
          </h1>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.7, maxWidth: 420,
          }}>
            ติดตามสต็อก FFP แยกตามหมู่เลือด รู้ตำแหน่งทุก Unit และแจ้งเตือนเมื่อต่ำกว่าขั้นต่ำ
          </p>

          {/* Blood group circles */}
          <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
            {['A', 'B', 'O', 'AB'].map((g) => (
              <div key={g} style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 600, color: '#fff',
              }}>
                {g}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Copyright */}
        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,0.4)',
          position: 'relative',
        }}>
          © MedtechSoft
        </p>
      </div>

      {/* ───── Right panel: login form ───── */}
      <div style={{
        flex: '1 1 40%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
        background: 'var(--background, #FAFAFA)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile logo */}
          <div className="md:hidden" style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--primary, #2563EB)',
              fontSize: 22, fontWeight: 700, color: '#fff',
              marginBottom: 12,
            }}>
              P
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary, #18181B)' }}>
              Plasm
            </h1>
          </div>

          {/* Heading */}
          <h2 style={{
            fontSize: 28, fontWeight: 700,
            color: 'var(--text-primary, #18181B)',
            marginBottom: 8,
          }}>
            เข้าสู่ระบบ
          </h2>
          <p style={{
            fontSize: 15,
            color: 'var(--text-secondary, #71717A)',
            marginBottom: 36,
          }}>
            ใช้บัญชีของธนาคารเลือด
          </p>

          {error && (
            <div style={{
              background: 'var(--danger-surface, #FEF2F2)',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '10px 14px',
              marginBottom: 24,
              fontSize: 13, fontWeight: 500,
              color: 'var(--danger-ink, #991B1B)',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="username" style={{
                display: 'block', fontSize: 14, fontWeight: 500,
                color: 'var(--text-primary, #18181B)',
                marginBottom: 8,
              }}>
                ชื่อผู้ใช้
              </label>
              <input
                id="username" type="text" value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username" autoFocus
                style={{
                  width: '100%', height: 48, padding: '0 16px',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--border, #E4E4E7)',
                  fontSize: 15, color: 'var(--text-primary, #18181B)',
                  background: '#fff',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary, #2563EB)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border, #E4E4E7)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label htmlFor="password" style={{
                display: 'block', fontSize: 14, fontWeight: 500,
                color: 'var(--text-primary, #18181B)',
                marginBottom: 8,
              }}>
                รหัสผ่าน
              </label>
              <input
                id="password" type="password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{
                  width: '100%', height: 48, padding: '0 16px',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--border, #E4E4E7)',
                  fontSize: 15, color: 'var(--text-primary, #18181B)',
                  background: '#fff',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary, #2563EB)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border, #E4E4E7)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', height: 50,
                borderRadius: 25,
                border: 'none',
                background: loading
                  ? 'var(--text-disabled, #A1A1AA)'
                  : 'var(--primary, #2563EB)',
                color: '#fff',
                fontSize: 16, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = 'var(--primary-hover, #1D4ED8)'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = 'var(--primary, #2563EB)'
              }}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          {/* Hint */}
          <p style={{
            textAlign: 'center', fontSize: 13,
            color: 'var(--text-disabled, #A1A1AA)',
            marginTop: 20,
          }}>
            ใช้บัญชี admin / admin123
          </p>
        </div>
      </div>
    </div>
  )
}
````

## File: frontend/src/pages/search/components/SearchBar.tsx
````typescript
// ============================================================
//  src/pages/search/components/SearchBar.tsx
// ============================================================

import { Search, X } from 'lucide-react'

interface Props {
  query: string
  onChange: (value: string) => void
  onClear: () => void
}

export default function SearchBar({ query, onChange, onClear }: Props) {
  return (
    <div style={{ position: 'relative', maxWidth: 560, marginBottom: 24 }}>
      <Search size={18} style={{
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
        color: 'var(--text-secondary)',
      }} />
      <input
        type="text"
        placeholder="พิมพ์หมายเลข Unit หรือกล่อง เช่น U001, FFP-A-0001..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        style={{
          width: '100%', padding: '14px 40px 14px 44px',
          border: '2px solid var(--border, #E4E4E7)',
          borderRadius: 'var(--radius-lg, 10px)',
          fontSize: 16, background: 'var(--surface, #fff)',
          color: 'var(--text-primary)',
          transition: 'border-color 0.15s',
          outline: 'none',
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary, #2563EB)'}
        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border, #E4E4E7)'}
      />
      {query && (
        <button onClick={onClear} style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        }}>
          <X size={16} color="var(--text-secondary)" />
        </button>
      )}
    </div>
  )
}
````

## File: frontend/src/pages/search/components/SearchResults.tsx
````typescript
// ============================================================
//  src/pages/search/components/SearchResults.tsx
// ============================================================

import { Package, MapPin, Calendar, Droplets, Search } from 'lucide-react'
import type { BloodGroup } from '../../../types/models'
import type { SearchBoxGroup } from '../services/SearchType'

const GROUP_COLOR: Record<BloodGroup, string> = {
  A: 'var(--group-a, #3B82F6)', B: 'var(--group-b, #10B981)',
  O: 'var(--group-o, #F59E0B)', AB: 'var(--group-ab, #8B5CF6)',
}
const GROUP_SURFACE: Record<BloodGroup, string> = {
  A: 'var(--group-a-surface, #DBEAFE)', B: 'var(--group-b-surface, #D1FAE5)',
  O: 'var(--group-o-surface, #FEF3C7)', AB: 'var(--group-ab-surface, #EDE9FE)',
}

interface Props {
  boxGroups: SearchBoxGroup[]
  totalUnits: number
  query: string
  searched: boolean
  loading: boolean
}

export default function SearchResults({ boxGroups, totalUnits, query, searched, loading }: Props) {

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังค้นหา...</div>
  }

  if (searched && totalUnits === 0) {
    return (
      <div style={{
        background: 'var(--surface, #fff)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg, 10px)', padding: 40, textAlign: 'center',
      }}>
        <Search size={40} style={{ opacity: 0.15, marginBottom: 12 }} />
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
          ไม่พบ Unit ที่ตรงกับ "{query}"
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          ลองตรวจสอบหมายเลข Unit อีกครั้ง
        </p>
      </div>
    )
  }

  if (!searched) {
    return (
      <div style={{
        background: 'var(--surface, #fff)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg, 10px)', padding: 60, textAlign: 'center',
      }}>
        <Search size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
          พิมพ์หมายเลข Unit หรือหมายเลขกล่อง เพื่อค้นหา
        </p>
      </div>
    )
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
        พบ {totalUnits} units ใน {boxGroups.length} กล่อง
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {boxGroups.map(({ box, units }) => (
          <div key={box.id} style={{
            background: 'var(--surface, #fff)',
            border: '1px solid var(--border, #E4E4E7)',
            borderRadius: 'var(--radius-lg, 10px)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
            animation: 'plasm-fade-in 0.15s ease',
          }}>
            {/* Box header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface-raised, #F4F4F5)',
            }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: '50%',
                background: GROUP_SURFACE[box.blood], color: GROUP_COLOR[box.blood],
                fontSize: 14, fontWeight: 700, flexShrink: 0,
              }}>{box.blood}</span>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {box.boxLabel}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Droplets size={11} /> {box.type}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <MapPin size={11} /> {box.location === 'room' ? 'ห้อง' : 'ตู้'} -30°C · ชั้น {box.shelf}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Calendar size={11} /> เจาะเก็บ {new Date(box.collectionDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </span>
                </div>
              </div>

              <span style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600,
                color: box.status === 'stored' ? '#16A34A' : '#DC2626',
                padding: '4px 10px', borderRadius: 99,
                background: box.status === 'stored' ? '#F0FDF4' : '#FEF2F2',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: box.status === 'stored' ? '#16A34A' : '#DC2626' }} />
                {box.status === 'stored' ? 'เก็บอยู่' : 'นำออกแล้ว'}
              </span>
            </div>

            {/* Matching units */}
            <div style={{ padding: '10px 20px 14px' }}>
              {units.map((unit) => {
                const isStored = unit.status === 'stored'
                return (
                  <div key={unit.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Package size={14} style={{ color: 'var(--text-secondary)' }} />
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600,
                        background: '#FEFCE8', padding: '2px 6px', borderRadius: 4,
                      }}>
                        {unit.unitNumber}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 500,
                      color: isStored ? '#16A34A' : '#DC2626',
                    }}>
                      {isStored ? 'เก็บอยู่' : 'นำออกแล้ว'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
````

## File: frontend/src/pages/search/index.tsx
````typescript
// ============================================================
//  src/pages/search/index.tsx
// ============================================================

import useSearch from './services/useSearch'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'

const SearchPage = () => {
  const {
    query,
    results,
    searched,
    loading,
    boxGroups,
    handleQueryChange,
    clearSearch,
  } = useSearch()

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>ค้นหา</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          ค้นหาด้วยหมายเลข Unit หรือหมายเลขกล่อง เพื่อดูตำแหน่งจัดเก็บ
        </p>
      </div>

      <SearchBar
        query={query}
        onChange={handleQueryChange}
        onClear={clearSearch}
      />

      <SearchResults
        boxGroups={boxGroups}
        totalUnits={results.length}
        query={query}
        searched={searched}
        loading={loading}
      />
    </div>
  )
}

export default SearchPage
````

## File: frontend/src/pages/storage/components/BarcodeLabel.tsx
````typescript
// ============================================================
//  src/pages/storage/components/BarcodeLabel.tsx
// ============================================================

import { useRef, useEffect } from 'react'
import JsBarcode from 'jsbarcode'
import { Printer, X } from 'lucide-react'

const GROUP_COLOR_HEX: Record<string, string> = {
  A: '#3B82F6', B: '#10B981', O: '#F59E0B', AB: '#8B5CF6',
}

export interface BarcodeLabelData {
  boxLabel: string
  type: string
  blood: string
  location: string
  shelf: string
  collectionDate: string
  unitCount: number
}

interface Props {
  data: BarcodeLabelData
  onClose: () => void
}

export default function BarcodeLabel({ data, onClose }: Props) {
  const barcodeRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!barcodeRef.current) return

    JsBarcode(barcodeRef.current, data.boxLabel, {
      format: 'CODE128',
      width: 1.5,
      height: 40,
      displayValue: true,
      text: data.boxLabel,
      fontSize: 14,
      font: 'monospace',
      fontOptions: 'bold',
      textMargin: 4,
      margin: 0,
    })

    // Convert fixed size → viewBox so SVG scales with container
    const svg = barcodeRef.current
    const w = svg.getAttribute('width')
    const h = svg.getAttribute('height')
    if (w && h) {
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      svg.removeAttribute('width')
      svg.removeAttribute('height')
    }
  }, [data.boxLabel])

  const locText = data.location === 'room' || data.location === 'ROOM' ? 'ห้อง -30°C' : 'ตู้ -30°C'

  const handlePrint = () => {
    const area = document.getElementById('barcode-print-area')
    if (!area) return

    const printWindow = window.open('', '_blank', 'width=600,height=500')
    if (!printWindow) return

    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${data.boxLabel}</title>
<style>
  @page { size: 100mm 55mm; margin: 2mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; }
  body { font-family: Helvetica, Arial, sans-serif; }
  .print-label {
    width: 96mm; height: 51mm;
    padding: 3mm;
    border: 1px solid #ccc;
    display: flex; flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    page-break-inside: avoid;
  }
  .print-label > div:first-child > div:nth-child(2) {
    overflow: hidden;
  }
  .print-label svg {
    width: 100% !important;
    height: auto !important;
    max-height: 18mm !important;
    display: block !important;
  }
</style>
</head><body>
  <div class="print-label">${area.innerHTML}</div>
  <script>window.onload=function(){window.print();window.close();}</script>
</body></html>`)
    printWindow.document.close()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1001,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-lg, 10px)',
        padding: 24, width: 480, maxWidth: '95vw',
        boxShadow: 'var(--shadow-md)',
        animation: 'plasm-fade-in 0.2s ease',
      }}>
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Printer size={18} style={{ color: 'var(--primary)' }} />
            พิมพ์บาร์โค้ด
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Preview — this is what gets printed */}
        <div id="barcode-print-area">
          <div style={{
            border: '2px solid #E4E4E7', borderRadius: 8,
            padding: 16, background: '#fff',
          }}>
            {/* Top row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 10,
            }}>
              <span style={{ fontSize: 20, fontWeight: 900, fontFamily: 'monospace', letterSpacing: 1 }}>
                {data.boxLabel}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                  background: data.type === 'FFP' ? '#DBEAFE' : '#FEE2E2',
                  color: data.type === 'FFP' ? '#1D4ED8' : '#991B1B',
                }}>{data.type}</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: '50%',
                  background: GROUP_COLOR_HEX[data.blood] || '#666',
                  color: '#fff', fontSize: 12, fontWeight: 900,
                }}>{data.blood}</span>
              </div>
            </div>

            {/* Barcode SVG — viewBox makes it responsive */}
            <div style={{ textAlign: 'center', padding: '4px 0', overflow: 'hidden' }}>
              <svg
                ref={barcodeRef}
                style={{ width: '100%', height: 'auto', maxHeight: 90, display: 'block' }}
              />
            </div>

            {/* Info row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: '#888', marginTop: 10,
              borderTop: '1px solid #eee', paddingTop: 6,
            }}>
              <span>{locText} · {data.shelf}</span>
              <span>{data.unitCount} units</span>
              <span>เก็บ {data.collectionDate}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={handlePrint} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 0', borderRadius: 'var(--radius-sm, 6px)',
            border: 'none', background: 'var(--primary, #2563EB)', color: '#fff',
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>
            <Printer size={16} /> พิมพ์
          </button>
          <button onClick={onClose} style={{
            padding: '10px 20px', borderRadius: 'var(--radius-sm, 6px)',
            border: '1px solid var(--border)', background: 'transparent',
            fontSize: 14, cursor: 'pointer',
          }}>
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}
````

## File: frontend/src/pages/storage/services/useStorage.ts
````typescript
// ============================================================
//  src/pages/storage/services/useStorage.ts
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import storageService from './StorageService'
import type {
  StorageBoxItem,
  StorageFormData,
  ToastState,
} from './StorageType'
import { SHELVES_ROOM, SHELVES_CABINET } from './StorageType'
import type { BarcodeLabelData } from '../components/BarcodeLabel'

const DEFAULT_FORM: StorageFormData = {
  type: 'FFP',
  blood: 'A',
  collectionDate: new Date().toISOString().split('T')[0],
  location: 'room',
  shelf: 'M1',
}

export default function useStorage() {
  const [boxes, setBoxes] = useState<StorageBoxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<StorageFormData>(DEFAULT_FORM)
  const [scannedUnits, setScannedUnits] = useState<string[]>([])
  const [unitInput, setUnitInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  // ── Barcode print ──
  const [printData, setPrintData] = useState<BarcodeLabelData | null>(null)

  // ── Load boxes ──
  const loadBoxes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await storageService.getStoredBoxes()
      setBoxes(data)
    } catch {
      setBoxes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadBoxes() }, [loadBoxes])

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  // ── Auto-generate box label ──
  const generateBoxLabel = useCallback(() => {
    const prefix = `${form.type}-${form.blood}-`
    const existing = boxes
      .filter((b) => b.boxLabel.startsWith(prefix))
      .map((b) => {
        const num = parseInt(b.boxLabel.replace(prefix, ''), 10)
        return isNaN(num) ? 0 : num
      })
    const next = existing.length > 0 ? Math.max(...existing) + 1 : 1
    return `${prefix}${String(next).padStart(4, '0')}`
  }, [boxes, form.type, form.blood])

  // ── Available shelves ──
  const availableShelves = form.location === 'room' ? SHELVES_ROOM : SHELVES_CABINET

  // ── Form handlers ──
  const handleFormChange = (field: keyof StorageFormData, value: string) => {
    setForm((f) => {
      const updated = { ...f, [field]: value }
      if (field === 'location') {
        const shelves = value === 'room' ? SHELVES_ROOM : SHELVES_CABINET
        updated.shelf = shelves[0]
      }
      return updated
    })
  }

  // ── Unit scanning ──
  const handleAddUnit = () => {
    const trimmed = unitInput.trim().toUpperCase()
    if (!trimmed) return

    const newUnits = trimmed
      .split(/[,\s\n]+/)
      .map((u) => u.trim())
      .filter(Boolean)

    const dupes: string[] = []
    const added: string[] = []

    for (const u of newUnits) {
      if (scannedUnits.includes(u)) {
        dupes.push(u)
      } else {
        added.push(u)
      }
    }

    if (added.length > 0) {
      setScannedUnits((prev) => [...prev, ...added])
    }
    if (dupes.length > 0) {
      setToast({ type: 'error', msg: `Unit ซ้ำ: ${dupes.join(', ')}` })
    }

    setUnitInput('')
  }

  const handleUnitKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddUnit()
    }
  }

  const handleRemoveUnit = (unit: string) => {
    setScannedUnits((prev) => prev.filter((u) => u !== unit))
  }

  // ── Submit + auto print ──
  const handleSubmit = async () => {
    if (scannedUnits.length === 0) {
      setToast({ type: 'error', msg: 'กรุณาเพิ่ม Unit อย่างน้อย 1 รายการ' })
      return
    }

    const boxLabel = generateBoxLabel()
    const unitCount = scannedUnits.length

    setSubmitting(true)
    try {
      await storageService.createBox({
        boxLabel,
        type: form.type,
        blood: form.blood,
        location: form.location.toUpperCase(),
        shelf: form.shelf,
        collectionDate: form.collectionDate,
        units: scannedUnits,
      })
      setToast({ type: 'success', msg: `บันทึกกล่อง ${boxLabel} สำเร็จ (${unitCount} units)` })

      // Auto open barcode print
      setPrintData({
        boxLabel,
        type: form.type,
        blood: form.blood,
        location: form.location,
        shelf: form.shelf,
        collectionDate: form.collectionDate,
        unitCount,
      })

      setScannedUnits([])
      setUnitInput('')
      loadBoxes()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'เกิดข้อผิดพลาด'
      setToast({ type: 'error', msg })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Print existing box ──
  const handlePrintBox = (box: StorageBoxItem) => {
    setPrintData({
      boxLabel: box.boxLabel,
      type: box.type,
      blood: box.blood,
      location: box.location,
      shelf: box.shelf,
      collectionDate: box.collectionDate,
      unitCount: box.units.length,
    })
  }

  const closePrint = () => setPrintData(null)
  const dismissToast = () => setToast(null)

  return {
    // data
    boxes,
    loading,
    form,
    scannedUnits,
    unitInput,
    submitting,
    toast,
    availableShelves,
    boxLabel: generateBoxLabel(),
    printData,
    // actions
    handleFormChange,
    setUnitInput,
    handleAddUnit,
    handleUnitKeyDown,
    handleRemoveUnit,
    handleSubmit,
    handlePrintBox,
    closePrint,
    dismissToast,
  }
}
````

## File: frontend/src/pages/storage/index.tsx
````typescript
// ============================================================
//  src/pages/storage/index.tsx
// ============================================================

import useStorage from './services/useStorage'
import StorageNewBoxForm from './components/StorageNewBoxForm'
import StorageBoxList from './components/StorageBoxList'
import StorageToast from './components/StorageToast'
import BarcodeLabel from './components/BarcodeLabel'

const StoragePage = () => {
  const {
    boxes,
    loading,
    form,
    scannedUnits,
    unitInput,
    submitting,
    toast,
    availableShelves,
    boxLabel,
    printData,
    handleFormChange,
    setUnitInput,
    handleAddUnit,
    handleUnitKeyDown,
    handleRemoveUnit,
    handleSubmit,
    handlePrintBox,
    closePrint,
    dismissToast,
  } = useStorage()

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>

      <StorageToast toast={toast} onDismiss={dismissToast} />

      {/* Barcode print modal */}
      {printData && (
        <BarcodeLabel data={printData} onClose={closePrint} />
      )}

      {/* Subtitle */}
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
        รันหมายเลขกล่องอัตโนมัติ และพิมพ์บาร์โค้ด
      </p>

      <StorageNewBoxForm
        form={form}
        boxLabel={boxLabel}
        scannedUnits={scannedUnits}
        unitInput={unitInput}
        submitting={submitting}
        availableShelves={availableShelves}
        onFormChange={handleFormChange}
        onUnitInputChange={setUnitInput}
        onAddUnit={handleAddUnit}
        onUnitKeyDown={handleUnitKeyDown}
        onRemoveUnit={handleRemoveUnit}
        onSubmit={handleSubmit}
      />

      <StorageBoxList
        boxes={boxes}
        loading={loading}
        onPrintBox={handlePrintBox}
      />
    </div>
  )
}

export default StoragePage
````

## File: frontend/src/Routes/AuthProtected.tsx
````typescript
// frontend/src/Routes/AuthProtected.tsx

import { Navigate } from 'react-router-dom'
import type { UserRole } from '../types/navigation'

interface AuthUser {
  id: string
  name: string
  role: UserRole
}

// ===== Simple auth hook =====
export function useAuth(): { isAuthenticated: boolean; user: AuthUser } {
  const token = sessionStorage.getItem('authToken')
  const userStr = sessionStorage.getItem('authUser')

  if (token && userStr) {
    try {
      return { isAuthenticated: true, user: JSON.parse(userStr) }
    } catch {
      sessionStorage.removeItem('authToken')
      sessionStorage.removeItem('authUser')
    }
  }

  // ไม่มี token → ไม่ authenticated
  return {
    isAuthenticated: false,
    user: { id: '', name: '', role: 'STAFF' },
  }
}

// ===== Auth guard =====
export function AuthProtected({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: UserRole[]
}) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />

  return <>{children}</>
}

// ===== Public guard =====
export function PublicGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return <Navigate to="/" replace />

  return <>{children}</>
}
````

## File: frontend/src/Routes/index.tsx
````typescript
// frontend/src/Routes/index.tsx

import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { authProtectedRoutes, publicRoutes } from './allRoutes'
import { AuthProtected, PublicGuard, useAuth } from './AuthProtected'
import MainLayout from '../components/layout/MainLayout'
import authService from '../helpers/services/authService'

const PATH_TO_MODULE: Record<string, string> = {
  '/': 'dashboard',
  '/storage': 'storage',
  '/withdraw': 'withdraw',
  '/search': 'search',
  '/map': 'map',
  '/log': 'log',
  '/settings': 'settings',
}

const MODULE_TO_PATH: Record<string, string> = Object.fromEntries(
  Object.entries(PATH_TO_MODULE).map(([path, mod]) => [mod, path]),
)

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const activeModule = PATH_TO_MODULE[location.pathname] || 'dashboard'

  const handleNavigate = (key: string) => {
    const path = MODULE_TO_PATH[key]
    if (path) navigate(path)
  }

  // เพิ่มตรงนี้
  const handleLogout = () => {
    authService.logout()
    navigate('/login', { replace: true })
  }

  return (
    <MainLayout
      activeModule={activeModule}
      onNavigate={handleNavigate}
      role={user.role}
      userName={user.name}
      onLogout={handleLogout}   // เพิ่ม prop นี้
    >
      {children}
    </MainLayout>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <PublicGuard>
              {route.component}
            </PublicGuard>
          }
        />
      ))}

      {authProtectedRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <AuthProtected roles={route.roles}>
              <LayoutWrapper>
                {route.component}
              </LayoutWrapper>
            </AuthProtected>
          }
        />
      ))}
    </Routes>
  )
}
````

## File: frontend/src/globals.css
````css
/* frontend/src/globals.css */
@import "tailwindcss";

/* ── Tailwind v4 Theme Override ── */
@theme {
  --font-sans: 'IBM Plex Sans Thai', 'IBM Plex Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
}

/* ── Plasm Design System Tokens (updated) ── */
:root {
  --primary: #2563EB;
  --primary-hover: #1D4ED8;
  --primary-pressed: #1E40AF;

  --background: #FAFAFA;
  --surface: #FFFFFF;
  --surface-raised: #F4F4F5;
  --border: #E4E4E7;

  --text-primary: #18181B;
  --text-secondary: #71717A;
  --text-disabled: #A1A1AA;

  /* Blood group identity */
  --group-a: #3B82F6;
  --group-b: #10B981;
  --group-o: #F59E0B;
  --group-ab: #8B5CF6;
  --group-a-surface: #DBEAFE;
  --group-b-surface: #D1FAE5;
  --group-o-surface: #FEF3C7;
  --group-ab-surface: #EDE9FE;

  /* Stock status */
  --stock-normal: #10B981;
  --stock-warning: #F59E0B;
  --stock-danger: #EF4444;

  /* Semantic surfaces */
  --danger-surface: #FEF2F2;
  --danger-ink: #991B1B;
  --warning-surface: #FFFBEB;
  --warning-ink: #92400E;
  --success-surface: #F0FDF4;
  --success-ink: #166534;

  /* Spacing */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-full: 99px;

  --shadow-sm: 0 1px 3px rgba(26,35,50,0.08);
  --shadow-md: 0 12px 28px rgba(26,35,50,0.14);
}

html, body, #root {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

* { box-sizing: border-box; }

body {
  color: var(--text-primary);
  background-color: var(--background);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a { color: var(--primary); }
a:hover { color: var(--primary-hover); }
::selection { background-color: #DBEAFE; color: var(--primary); }

@keyframes plasm-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes plasm-rise { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes plasm-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
````

## File: frontend/index.html
````html
<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Plasm — ระบบจัดเก็บและนำออกพลาสมา</title>
    <link rel="stylesheet" href="/fonts/ibm-plex-sans-thai.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
````

## File: frontend/package.json
````json
{
  "name": "plasm-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@fontsource-variable/noto-sans-thai": "^5.3.0",
    "@fontsource/ibm-plex-sans": "^5.3.0",
    "@fontsource/ibm-plex-sans-thai": "^5.3.0",
    "@tanstack/react-table": "^8.21.3",
    "axios": "^1.20.0",
    "axios-mock-adapter": "^2.1.0",
    "jsbarcode": "^3.11.6",
    "lucide-react": "^1.48.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.3",
    "@tailwindcss/vite": "^4.3.3",
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.7",
    "@vitejs/plugin-react": "^6.1.1",
    "autoprefixer": "^10.6.1",
    "oxlint": "^1.81.0",
    "postcss": "^8.5.28",
    "tailwindcss": "^4.3.3",
    "typescript": "~6.0.2",
    "vite": "^8.3.0"
  }
}
````

## File: README.md
````markdown
# Plasm — ระบบจัดเก็บและนำออกพลาสมา

ระบบเว็บแอปสำหรับจัดเก็บและนำออกพลาสมา (FFP) ในธนาคารเลือด

## Features

- 📊 **แดชบอร์ด** — แสดงสต็อกแยกตามหมู่เลือด พร้อม Alert เมื่อต่ำกว่า minimum
- 📦 **จัดเก็บ** — รันหมายเลขกล่องอัตโนมัติ, พิมพ์บาร์โค้ด, ตรวจจับ Unit ซ้ำ
- 📤 **นำออก** — นำออกทั้งกล่อง หรือเป็น Unit
- 🔍 **ค้นหา** — ค้นหา Unit ว่าอยู่กล่องไหน ตำแหน่งไหน
- 🗺️ **แผนผัง** — แผนผังห้อง -30°C (7 ตำแหน่ง) และตู้ -30°C
- 📋 **ประวัติ** — บันทึกทุกการจัดเก็บ/นำออก

## Minimum Stock Alert

| หมู่เลือด | ขั้นต่ำ (units) |
|-----------|----------------|
| A         | 150            |
| B         | 300            |
| O         | 300            |
| AB        | 100            |

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend:** Express + TypeScript
- **Icons:** Lucide React
- **Table:** TanStack Table
- **HTTP:** Axios + Mock Adapter (dev)
- **Barcode:** JsBarcode

## Getting Started

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

## Project Structure

```
plasm/
├── .github/
│   └── workflows/
│       └── deploy.yml                    # CI/CD: Tailscale + SSH auto-deploy
├── README.md
│
├── backend/
│   ├── env.example
│   ├── gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma                 # DB schema
│   │   └── seed.ts                       # Seed data
│   └── src/
│       ├── index.ts                      # Express entry point
│       ├── lib/
│       │   └── prisma.ts                 # Prisma client instance
│       ├── middleware/
│       │   └── auth.ts                   # JWT auth middleware
│       └── routes/
│           ├── auth.ts                   # Login/register
│           ├── boxes.ts                  # Box CRUD
│           ├── units.ts                  # Unit CRUD
│           ├── stock.ts                  # Stock summary/alerts
│           ├── log.ts                    # Activity log
│           ├── settings.ts               # Min stock config
│           └── users.ts                  # User management (admin)
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
    │
    ├── public/
    │   ├── favicon.svg
    │   ├── sidebar-bg.png
    │   └── fonts/
    │       ├── ibm-plex-sans-thai.css
    │       └── ibm-plex-sans-thai-*.woff2  # (12 font files, 400-700)
    │
    ├── assets/
    │   ├── index.ts                      # Asset barrel export
    │   ├── images/
    │   │   ├── auth-bg.jpg
    │   │   ├── error.svg / error500.png / notfound.png / maintenance.png
    │   │   ├── logo/
    │   │   │   ├── plasm-dark.svg
    │   │   │   ├── plasm-light.svg
    │   │   │   └── plasm-sm.svg
    │   │   ├── sidebar/img-1.jpg
    │   │   └── users/user-dummy-img.jpg
    │   ├── plasm/
    │   │   ├── login/login_cover.png
    │   │   └── sidebar/icon-plasm.svg
    │   └── styles/
    │       ├── dashboard.css
    │       └── design-system.css
    │
    └── src/
        ├── main.tsx                      # Entry point
        ├── App.tsx                       # App wrapper
        ├── globals.css
        ├── index.css
        │
        ├── Routes/
        │   ├── index.tsx                 # Router setup
        │   ├── allRoutes.tsx             # Route definitions
        │   └── AuthProtected.tsx         # Auth guard
        │
        ├── helpers/
        │   ├── url_helper.ts             # API base URLs
        │   ├── api_helper.ts             # Generic HTTP methods
        │   ├── backend_helper.ts         # Business-specific API calls
        │   ├── http/
        │   │   ├── axiosInstance.ts       # Axios config + interceptors
        │   │   ├── apiAdapter.ts          # Request/response adapter
        │   │   └── types.ts              # HTTP types
        │   └── services/
        │       └── authService.ts        # Auth token management
        │
        ├── common/
        │   └── data/
        │       └── index.ts              # Mock/static data
        │
        ├── types/
        │   ├── models.ts                 # Data models (Box, Unit, etc.)
        │   └── navigation.ts             # Nav/route types
        │
        ├── components/
        │   ├── layout/
        │   │   ├── index.ts
        │   │   ├── MainLayout.tsx        # Main app layout
        │   │   ├── Sidebar.tsx           # Blue sidebar nav
        │   │   ├── TopBar.tsx            # Top header bar
        │   │   └── BottomNav.tsx         # Mobile bottom nav
        │   └── shared/
        │       ├── index.ts
        │       ├── ContentCard.tsx
        │       ├── PageHeader.tsx
        │       ├── StatusBadge.tsx
        │       └── SummaryCards.tsx
        │
        └── pages/
            ├── auth/
            │   └── LoginPage.tsx
            │
            ├── dashboard/
            │   └── DashboardPage.tsx
            │
            ├── storage/                  # ── Sentinel pattern ──
            │   ├── index.tsx             # Main page (imports hook+components)
            │   ├── components/
            │   │   ├── BarcodeLabel.tsx
            │   │   ├── StorageBoxList.tsx
            │   │   ├── StorageNewBoxForm.tsx
            │   │   └── StorageToast.tsx
            │   └── services/
            │       ├── StorageService.ts   # API calls
            │       ├── StorageType.ts      # Interfaces
            │       └── useStorage.ts       # State + logic hook
            │
            ├── withdraw/
            │   ├── index.tsx
            │   ├── WithdrawPage.tsx
            │   ├── components/
            │   │   ├── WithdrawBoxList.tsx
            │   │   ├── WithdrawBoxDetail.tsx
            │   │   └── WithdrawConfirmModal.tsx
            │   └── services/
            │       ├── WithdrawService.ts
            │       ├── WithdrawType.ts
            │       └── useWithdraw.ts
            │
            ├── search/
            │   ├── index.tsx
            │   ├── SearchPage.tsx
            │   ├── components/
            │   │   ├── SearchBar.tsx
            │   │   └── SearchResults.tsx
            │   └── services/
            │       ├── SearchService.ts
            │       ├── SearchType.ts
            │       └── useSearch.ts
            │
            ├── map/
            │   ├── index.tsx
            │   ├── components/
            │   │   ├── MapRoomGrid.tsx
            │   │   └── MapCabinetGrid.tsx
            │   └── services/
            │       ├── MapService.ts
            │       ├── MapType.ts
            │       └── useMap.ts
            │
            ├── log/
            │   ├── index.tsx
            │   ├── components/
            │   │   ├── LogFiltersBar.tsx
            │   │   └── LogTable.tsx
            │   └── services/
            │       ├── LogService.ts
            │       ├── LogType.ts
            │       └── useLog.ts
            │
            └── settings/
                ├── index.tsx
                ├── components/
                │   ├── SettingsMinStock.tsx
                │   └── SettingsUsers.tsx
                └── services/
                    ├── SettingsService.ts
                    ├── SettingsType.ts
                    └── useSettings.ts
```
````

## File: frontend/src/helpers/backend_helper.ts
````typescript
// frontend/src/helpers/backend_helper.ts
//
// Domain API functions
// Pattern: url_helper → apiAdapter → backend_helper
// Page components เรียกผ่านนี้

import apiAdapter from './http/apiAdapter'
import * as url from './url_helper'

// ===== Auth (ใช้ authService แทนได้) =====
export const postLogin = (data: { username: string; password: string }) =>
  apiAdapter.post(url.POST_LOGIN, data)

export const postLogout = () =>
  apiAdapter.post(url.POST_LOGOUT)

// ===== Boxes =====
export const getBoxes = (params?: Record<string, string>) =>
  apiAdapter.get(url.GET_BOXES, params)

export const getBoxById = (id: string) =>
  apiAdapter.getById(url.GET_BOX_DETAIL, id)

export const postBox = (data: unknown) =>
  apiAdapter.post(url.POST_BOX, data)

export const withdrawBox = (id: string) =>
  apiAdapter.patch(`${url.PATCH_BOX_WITHDRAW}/${id}/withdraw`)

// ===== Units =====
export const searchUnits = (query: string) =>
  apiAdapter.get(url.GET_UNIT_SEARCH, { q: query })

export const withdrawUnit = (unitId: string) =>
  apiAdapter.patch(`${url.PATCH_UNIT_WITHDRAW}/${unitId}/withdraw`)

// ===== Stock =====
export const getStockSummary = () =>
  apiAdapter.get(url.GET_STOCK_SUMMARY)

export const getStockDaily = (days = 7) =>
  apiAdapter.get(url.GET_STOCK_DAILY, { days: String(days) })

// ===== Log =====
export const getLog = (params?: Record<string, string>) =>
  apiAdapter.get(url.GET_LOG, params)

// ===== Settings =====
export const getSettings = () =>
  apiAdapter.get(url.GET_SETTINGS)

export const putSettings = (data: unknown) =>
  apiAdapter.put(url.PUT_SETTINGS, data)
````

## File: frontend/src/pages/dashboard/components/DashboardHero.tsx
````typescript
// ============================================================
//  src/pages/dashboard/components/DashboardHero.tsx
// ============================================================

import { Package, PackageOpen } from 'lucide-react'

interface Props {
  total: number
}

export default function DashboardHero({ total }: Props) {
  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 'var(--radius-lg, 10px)',
      background: 'var(--primary, #2563EB)', color: '#fff',
      padding: '28px 28px', marginBottom: 16,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{ position: 'absolute', right: -40, top: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ position: 'absolute', right: 120, bottom: -80, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

      <div style={{ position: 'relative', flex: '1 1 320px' }}>
        <p style={{ fontSize: 14, opacity: 0.85 }}>สวัสดี, ผู้ดูแลระบบ</p>
        <p style={{ fontWeight: 700, fontSize: 28, lineHeight: 1.3, marginTop: 6 }}>
          สต็อกพลาสมารวม {total.toLocaleString()} units
        </p>
        <p style={{ fontSize: 13, marginTop: 8, opacity: 0.8 }}>
          อัปเดตล่าสุด {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. · ห้อง -30°C และตู้ -30°C
        </p>
      </div>

      <div style={{ position: 'relative', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
          borderRadius: 'var(--radius-sm, 6px)', border: 'none',
          background: '#fff', color: 'var(--primary, #2563EB)',
          fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>
          <Package size={14} /> จัดเก็บกล่องใหม่
        </button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
          borderRadius: 'var(--radius-sm, 6px)',
          border: '1px solid rgba(255,255,255,0.6)', background: 'transparent', color: '#fff',
          fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>
          <PackageOpen size={14} /> นำออก
        </button>
      </div>
    </section>
  )
}
````

## File: frontend/src/pages/storage/components/StorageBoxList.tsx
````typescript
// ============================================================
//  src/pages/storage/components/StorageBoxList.tsx
// ============================================================

import { useState } from 'react'
import { Printer, Search } from 'lucide-react'
import type { BloodGroup } from '../../../types/models'
import type { StorageBoxItem } from '../services/StorageType'

const GROUP_COLOR: Record<BloodGroup, string> = {
  A: 'var(--group-a, #3B82F6)', B: 'var(--group-b, #10B981)',
  O: 'var(--group-o, #F59E0B)', AB: 'var(--group-ab, #8B5CF6)',
}
const GROUP_SURFACE: Record<BloodGroup, string> = {
  A: 'var(--group-a-surface, #DBEAFE)', B: 'var(--group-b-surface, #D1FAE5)',
  O: 'var(--group-o-surface, #FEF3C7)', AB: 'var(--group-ab-surface, #EDE9FE)',
}

interface Props {
  boxes: StorageBoxItem[]
  loading: boolean
  onPrintBox: (box: StorageBoxItem) => void
}

export default function StorageBoxList({ boxes, loading, onPrintBox }: Props) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = boxes.filter((b) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      b.boxLabel.toLowerCase().includes(q) ||
      b.blood.toLowerCase().includes(q) ||
      b.shelf.toLowerCase().includes(q) ||
      b.units.some((u) => u.toLowerCase().includes(q))
    )
  })

  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: '24px 28px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header + Search */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, gap: 12, flexWrap: 'wrap',
      }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
          กล่องที่จัดเก็บแล้ว
          <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 8 }}>
            {filtered.length}/{boxes.length}
          </span>
        </h3>

        <div style={{ position: 'relative', flex: '0 1 260px' }}>
          <Search size={14} style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
          }} />
          <input
            type="text"
            placeholder="ค้นหากล่อง, หมู่เลือด, unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 32px',
              border: '1px solid var(--border, #E4E4E7)',
              borderRadius: 'var(--radius-sm, 6px)',
              fontSize: 13, background: 'var(--surface, #fff)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
          กำลังโหลด...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
          {searchQuery ? `ไม่พบกล่องที่ตรงกับ "${searchQuery}"` : 'ยังไม่มีกล่องที่จัดเก็บ'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((box, idx) => (
            <div
              key={box.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: idx < filtered.length - 1 ? '1px solid var(--border, #E4E4E7)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 34, height: 34, borderRadius: '50%',
                  background: GROUP_SURFACE[box.blood], color: GROUP_COLOR[box.blood],
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>
                  {box.blood}
                </span>
                <div>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}>
                    {box.boxLabel}
                  </span>
                  <span style={{
                    fontSize: 13, color: 'var(--text-secondary)', marginLeft: 10,
                  }}>
                    {box.units.length} units
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => onPrintBox(box)}
                  title="พิมพ์บาร์โค้ด"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--border, #E4E4E7)',
                    background: 'transparent', cursor: 'pointer',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Printer size={14} />
                </button>

                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 14px', borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border, #E4E4E7)',
                  fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                }}>
                  {box.location === 'room' ? 'ห้อง' : 'ตู้'} -30°C · {box.shelf}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
````

## File: frontend/src/main.tsx
````typescript
// frontend/src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './globals.css'

// ลบ fakeBackend() ออกทั้งหมด

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
````

## File: frontend/vite.config.ts
````typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
````

## File: frontend/src/helpers/url_helper.ts
````typescript
// frontend/src/helpers/url_helper.ts
//
// รวม API URL ทั้งหมดไว้ที่เดียว
// Pattern: url_helper → apiAdapter → services / backend_helper

const API = '/api/v1'

// ===== Auth =====
export const POST_LOGIN = `${API}/auth/login`
export const POST_LOGOUT = `${API}/auth/logout`

// ===== Boxes =====
export const GET_BOXES = `${API}/boxes`
export const GET_BOX_DETAIL = `${API}/boxes`       // + /:id
export const POST_BOX = `${API}/boxes`
export const PATCH_BOX_WITHDRAW = `${API}/boxes`    // + /:id/withdraw

// ===== Units =====
export const GET_UNITS = `${API}/units`
export const GET_UNIT_SEARCH = `${API}/units/search` // ?q=
export const PATCH_UNIT_WITHDRAW = `${API}/units`    // + /:id/withdraw

// ===== Stock =====
export const GET_STOCK_SUMMARY = `${API}/stock/summary`
export const GET_STOCK_DAILY = `${API}/stock/daily`

// ===== Log =====
export const GET_LOG = `${API}/log`

// ===== Users =====
export const GET_USERS = `${API}/users`
export const POST_USER = `${API}/users`
export const PATCH_USER = `${API}/users`    // + /:id

// ===== Settings =====
export const GET_SETTINGS = `${API}/settings`
export const PUT_SETTINGS = `${API}/settings`
````

## File: frontend/src/Routes/allRoutes.tsx
````typescript
import { Navigate } from 'react-router-dom'

import DashboardPage from '../pages/dashboard'
import StoragePage from '../pages/storage'
import WithdrawPage from '../pages/withdraw'
import SearchPage from '../pages/search'
import MapPage from '../pages/map'
import LogPage from '../pages/log'
import SettingsPage from '../pages/settings'
import LoginPage from '../pages/auth/LoginPage'

export interface RouteConfig {
  path: string
  component: React.ReactNode
  exact?: boolean
  roles?: ('ADMIN' | 'STAFF')[]
}

const authProtectedRoutes: RouteConfig[] = [
  { path: '/', component: <DashboardPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/storage', component: <StoragePage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/withdraw', component: <WithdrawPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/search', component: <SearchPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/map', component: <MapPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/log', component: <LogPage />, roles: ['ADMIN', 'STAFF'] },
  { path: '/settings', component: <SettingsPage />, roles: ['ADMIN'] },
  { path: '*', component: <Navigate to="/" replace /> },
]

const publicRoutes: RouteConfig[] = [
  { path: '/login', component: <LoginPage /> },
]

export { authProtectedRoutes, publicRoutes }
````
