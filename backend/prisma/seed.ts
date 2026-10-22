// prisma/seed.ts
// Seed ข้อมูลเริ่มต้น: admin user, settings, master data, sample boxes

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

  // ===== 4. Master data (ต้องมาก่อนกล่อง) =====
  const plasmaTypes = ['FFP', 'Cryo']
  for (const [i, code] of plasmaTypes.entries()) {
    await prisma.masterPlasmaType.upsert({
      where: { code }, update: {}, create: { code, sort: i },
    })
  }

  const bloodTypes = ['A', 'B', 'O', 'AB']
  for (const [i, code] of bloodTypes.entries()) {
    await prisma.masterBloodType.upsert({
      where: { code }, update: {}, create: { code, sort: i },
    })
  }

  const zones = [
    { name: 'ห้อง -30°C', legacyKey: 'ROOM', shelves: ['M1', 'R1', 'R2', 'R3', 'L1', 'L2', 'L3'] },
    { name: 'ตู้ -30°C', legacyKey: 'CABINET', shelves: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'] },
  ]
  for (const [i, z] of zones.entries()) {
    const zone = await prisma.masterZone.upsert({
      where: { name: z.name },
      update: {},
      create: { name: z.name, legacyKey: z.legacyKey, sort: i },
    })
    for (const [j, code] of z.shelves.entries()) {
      await prisma.masterShelf.upsert({
        where: { zoneId_code: { zoneId: zone.id, code } },
        update: {},
        create: { zoneId: zone.id, code, sort: j },
      })
    }
  }
  console.log('✅ Master data')

  // ===== 5. Sample Boxes + Units =====
  const sampleBoxes = [
    { boxLabel: 'FFP_A_2024_00001',  type: 'FFP', blood: 'A',  legacyKey: 'ROOM',    shelf: 'M1', date: '2024-10-01', units: ['A001', 'A002', 'A003', 'A004', 'A005', 'A006', 'A007', 'A008'] },
    { boxLabel: 'FFP_B_2024_00001',  type: 'FFP', blood: 'B',  legacyKey: 'ROOM',    shelf: 'R1', date: '2024-10-02', units: ['B001', 'B002', 'B003', 'B004', 'B005', 'B006', 'B007', 'B008', 'B009', 'B010'] },
    { boxLabel: 'FFP_O_2024_00001',  type: 'FFP', blood: 'O',  legacyKey: 'ROOM',    shelf: 'L1', date: '2024-10-03', units: ['O001', 'O002', 'O003', 'O004', 'O005', 'O006', 'O007', 'O008'] },
    { boxLabel: 'FFP_AB_2024_00001', type: 'FFP', blood: 'AB', legacyKey: 'CABINET', shelf: 'C1', date: '2024-10-04', units: ['AB001', 'AB002', 'AB003', 'AB004', 'AB005'] },
  ]

  for (const box of sampleBoxes) {
    const existing = await prisma.box.findUnique({ where: { boxLabel: box.boxLabel } })
    if (existing) continue

    const zone = await prisma.masterZone.findUniqueOrThrow({ where: { legacyKey: box.legacyKey } })

    await prisma.box.create({
      data: {
        boxLabel: box.boxLabel,
        type: box.type,
        blood: box.blood,
        year: 2024,
        zoneId: zone.id,
        shelf: box.shelf,
        collectionDate: new Date(box.date),
        status: 'STORED',
        units: {
          create: box.units.map((u) => ({ unitNumber: u })),
        },
        logs: {
          create: {
            action: 'STORE',
            detail: `จัดเก็บกล่อง ${box.boxLabel} จำนวน ${box.units.length} units`,
            unitCount: box.units.length,
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