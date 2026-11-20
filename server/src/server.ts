import express from 'express'
import prisma from './config/database.js'
import 'dotenv/config'

const app = express()

const PORT = 5000

// Middleware to parse JSON request bodies
app.use(express.json())

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

async function startServer() {
  try {
    await prisma.$connect()

    console.log('Database connected successfully')

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()