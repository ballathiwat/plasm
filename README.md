# Plasm — ระบบจัดการคลังพลาสมาและรับเลือดจากภายนอก

เว็บแอปสำหรับจัดเก็บ ค้นหา และนำออกพลาสมา (FFP) พร้อมระบบบันทึก ตรวจสอบ อนุมัติ และติดตามการรับเลือดจากภายนอก สำหรับธนาคารเลือด

## ฟีเจอร์หลัก

### คลังพลาสมา

- 📊 **แดชบอร์ดและสต็อก** — ดูสรุปสต็อก แยกตามชนิดพลาสมาและหมู่เลือด พร้อมการแจ้งเตือนเมื่อสต็อกต่ำกว่าค่าขั้นต่ำ
- 📦 **จัดเก็บ** — บันทึกกล่องและ Unit ตรวจจับ Unit ซ้ำ และพิมพ์ฉลากบาร์โค้ด
- 📤 **นำออก** — นำออกได้ทั้งกล่องหรือ Unit พร้อมบันทึกประวัติ
- 🔍 **ค้นหา** — ค้นหากล่องหรือ Unit และดูตำแหน่งจัดเก็บ
- 🗺️ **แผนผังและ Rack** — ดูตำแหน่งจัดเก็บในห้องและตู้แช่ รวมถึงชั้นและช่องของ Rack
- 📋 **ประวัติและรายงาน** — ตรวจสอบกิจกรรมและรายงานการเคลื่อนไหวของสต็อก

### รับเลือดจากภายนอก

- 🩸 บันทึกเอกสารรับเลือด รายละเอียดผลิตภัณฑ์ จำนวนถุง และไฟล์แนบ
- ✅ รองรับขั้นตอนตรวจสอบ จัดเก็บ และอนุมัติ โดยกำหนดผู้รับผิดชอบและติดตามสถานะเอกสาร
- 📦 บันทึกการนำถุงเลือดออก พร้อมเหตุผล และดูรายงานสรุป
- 🔐 รองรับการยืนยันด้วย PIN สำหรับขั้นตอนที่เกี่ยวข้อง

### ตั้งค่าและผู้ใช้

- จัดการบัญชีผู้ใช้และสิทธิ์ ADMIN/STAFF
- กำหนดค่าขั้นต่ำสต็อกและจัดการข้อมูลหลัก เช่น ชนิดพลาสมา หมู่เลือด และสถานที่จัดเก็บ
- จัดการตัวเลือกในฟอร์มรับเลือดจากภายนอก

## ค่าขั้นต่ำสต็อกเริ่มต้น

ค่าต่อไปนี้เป็นค่าเริ่มต้นที่ seed ให้ฐานข้อมูล และผู้ดูแลระบบสามารถเปลี่ยนได้ในหน้าตั้งค่า

| หมู่เลือด | ขั้นต่ำ (units) |
|-----------|----------------:|
| A         | 150             |
| B         | 300             |
| O         | 300             |
| AB        | 100             |

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4
- **Backend:** Express 5, TypeScript, Prisma 6
- **Database:** PostgreSQL
- **Routing:** React Router 7
- **UI:** Lucide React, Sass, IBM Plex Sans Thai และ Noto Sans Thai
- **Tables:** TanStack Table
- **HTTP:** Axios
- **Barcode:** JsBarcode

## ความต้องการก่อนติดตั้ง

- Node.js และ npm
- PostgreSQL

## เริ่มต้นใช้งาน

### 1. ตั้งค่าฐานข้อมูลและ Backend

```bash
cd backend
npm install
```

สร้างไฟล์ `backend/.env` จากตัวอย่าง แล้วกำหนดค่าเชื่อมต่อฐานข้อมูลและ secret สำหรับ JWT:

```bash
cp env.example .env
```

แก้ `DATABASE_URL` ให้ตรงกับ PostgreSQL ในเครื่อง และเปลี่ยน `JWT_SECRET` เป็นค่าลับที่คาดเดายาก จากนั้นรัน migration และ seed ข้อมูลเริ่มต้น:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

Backend จะเริ่มที่ `http://localhost:3000` โดยมี health check ที่ `/api/v1/health` หากต้องการใช้ข้อมูลตัวอย่างจาก seed โปรดตรวจสอบและเปลี่ยนรหัสผ่านเริ่มต้นก่อนนำระบบไปใช้งานจริง

### 2. เริ่ม Frontend

เปิดอีกหน้าต่าง Terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite จะรายงาน URL สำหรับเปิดเว็บแอปใน Terminal (โดยปกติคือ `http://localhost:5173`) การตั้งค่า proxy สำหรับ API อยู่ใน `frontend/vite.config.ts`

### คำสั่งที่ใช้บ่อย

```bash
# Frontend (จาก frontend/)
npm run dev
npm run build
npm run lint

# Backend (จาก backend/)
npm run dev
npm run build
npm start
npm run db:migrate
npm run db:seed
npm run db:studio
```

## โครงสร้างโปรเจกต์

```text
plasm/
├── .github/workflows/deploy.yml     # Workflow สำหรับ deploy
├── backend/
│   ├── prisma/                      # Schema, migrations และ seed
│   └── src/
│       ├── middleware/              # Authentication middleware
│       ├── lib/                     # Prisma และ business helpers
│       └── routes/                  # Auth, คลัง, รายงาน, ตั้งค่า, รับเลือด ฯลฯ
└── frontend/
    ├── assets/                      # ภาพและ styles
    ├── public/                      # ไฟล์ static และ fonts
    └── src/
        ├── Routes/                  # Route config และ auth guard
        ├── components/              # Components ใช้ร่วมกันและ layout
        ├── helpers/                 # API client, hooks และ utilities
        └── pages/                   # Dashboard, storage, reports, profile,
                                     # external blood และ settings
```

## หมายเหตุด้านความปลอดภัย

- ห้ามนำค่า `JWT_SECRET` ตัวอย่างหรือรหัสผ่านจาก seed ไปใช้ในระบบจริง
- เก็บไฟล์ `.env` และข้อมูลรับรองฐานข้อมูลเป็นความลับ และอย่า commit ขึ้น Git
- สำรองฐานข้อมูลอย่างสม่ำเสมอ และจำกัดการเข้าถึงระบบตามนโยบายของหน่วยงาน
