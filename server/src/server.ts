import express from 'express'

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})