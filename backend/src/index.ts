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

// ===== Start =====
app.listen(PORT, () => {
  console.log(`🚀 Plasm backend running at http://localhost:${PORT}`)
  console.log(`📋 API base: http://localhost:${PORT}/api/v1`)
})
