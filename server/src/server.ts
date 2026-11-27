import express from 'express'
import prisma from './config/database.js'
import 'dotenv/config'
import employeeRoutes from './routes/employee.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import authRoutes from './auth/auth.routes.js'
import { requireAuth } from './auth/authentication.js'

const app = express()
app.set('trust proxy', 1)

const PORT = Number(process.env.PORT ?? 5000)
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

// Middleware to parse JSON request bodies
app.use(express.json())
app.use((req, res, next) => {
  const origin = req.get('origin')

  if (origin) {
    res.setHeader('Vary', 'Origin')
  }

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(!origin || allowedOrigins.includes(origin) ? 204 : 403)
  }

  next()
})
app.use('/api/auth', authRoutes)
app.use('/api/employees', requireAuth, employeeRoutes)
app.use('/api/analytics', requireAuth, analyticsRoutes)

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ACME Salary Management API is running',
  })
})
app.get('/api/health/db', async (req, res) => {
  try {
    const employeeCount = await prisma.employee.count()

    res.status(200).json({
      success: true,
      message: 'Database query successful',
      employeeCount,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database query failed',
    })
  }
})

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    next(error)
    return
  }

  console.error('Unhandled API error:', error)
  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred',
  })
})

async function startServer() {
  try {
    await prisma.$connect()

    console.log('Database connected successfully')

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()