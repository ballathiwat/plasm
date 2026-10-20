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
