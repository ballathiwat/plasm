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
