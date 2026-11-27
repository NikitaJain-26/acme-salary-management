import process from 'node:process'
import prisma from '../src/config/database.js'
import { hashPassword } from '../src/auth/authentication.js'

async function bootstrapAdmin() {
  const userCount = await prisma.user.count()
  if (userCount > 0) {
    return
  }

  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.INITIAL_ADMIN_PASSWORD
  const name = process.env.INITIAL_ADMIN_NAME?.trim() || 'HR Administrator'

  if (!email || !password) {
    console.warn(
      'No HR accounts exist. Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in the service environment, then restart to create the first administrator.',
    )
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 128) {
    throw new Error('Initial administrator requires a valid email and a password of 12 to 128 characters')
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: 'ADMIN',
    },
  })
  console.log(`Created initial administrator account for ${email}`)
}

bootstrapAdmin()
  .catch((error) => {
    console.error('Failed to bootstrap administrator:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
