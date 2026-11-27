import type { Request, Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import prisma from '../config/database.js'
import {
  clearSessionCookie,
  createSession,
  hashPassword,
  setSessionCookie,
  verifyPassword,
  type AuthenticatedRequest,
  type UserRole,
} from './authentication.js'
import {
  changePasswordRequestSchema,
  createUserRequestSchema,
  loginRequestSchema,
  updateUserRoleRequestSchema,
} from '../schemas/auth.js'

const loginAttempts = new Map<string, { count: number; resetAt: number }>()

export async function getAuthStatus(_req: Request, res: Response) {
  const userCount = await prisma.user.count()
  res.json({ success: true, setupRequired: userCount === 0 })
}

export async function login(
  req: Request<ParamsDictionary, unknown, unknown>,
  res: Response,
) {
  const ip = req.ip || 'unknown'
  const now = Date.now()
  const attempt = loginAttempts.get(ip)

  if (attempt && attempt.resetAt > now && attempt.count >= 10) {
    res.status(429).json({ success: false, message: 'Too many login attempts. Try again later.' })
    return
  }

  const parsedBody = loginRequestSchema.safeParse(req.body)
  const email = parsedBody.success ? parsedBody.data.email ?? '' : ''
  const password = parsedBody.success ? parsedBody.data.password ?? '' : ''

  const user = email
    ? await prisma.user.findUnique({ where: { email } })
    : null
  const passwordValid = user
    ? await verifyPassword(password, user.passwordHash)
    : false

  if (!user || !passwordValid) {
    loginAttempts.set(ip, {
      count: attempt && attempt.resetAt > now ? attempt.count + 1 : 1,
      resetAt: attempt && attempt.resetAt > now
        ? attempt.resetAt
        : now + 15 * 60 * 1000,
    })
    res.status(401).json({ success: false, message: 'Invalid email or password' })
    return
  }

  loginAttempts.delete(ip)
  const token = await createSession(user.id)
  setSessionCookie(res, token)
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    },
  })
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  if (req.sessionTokenHash) {
    await prisma.session.deleteMany({
      where: { tokenHash: req.sessionTokenHash },
    })
  }
  clearSessionCookie(res)
  res.json({ success: true })
}

export function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  res.json({ success: true, user: req.user })
}

export async function listUsers(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })
  res.json({ success: true, users })
}

export async function createUser(
  req: Request<ParamsDictionary, unknown, unknown>,
  res: Response,
) {
  const parsedBody = createUserRequestSchema.safeParse(req.body)
  if (!parsedBody.success) {
    res.status(400).json({
      success: false,
      message: 'Provide a name, valid email, password of at least 12 characters, and valid role',
    })
    return
  }

  const { name, email, password, role } = parsedBody.data

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })
    res.status(201).json({ success: true, user })
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      res.status(409).json({ success: false, message: 'An account with that email already exists' })
      return
    }
    throw error
  }
}

export async function updateUserRole(
  req: Request<ParamsDictionary, unknown, unknown>,
  res: Response,
) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  if (!id) {
    res.status(400).json({ success: false, message: 'Invalid user ID' })
    return
  }
  const parsedBody = updateUserRoleRequestSchema.safeParse(req.body)
  if (!parsedBody.success) {
    res.status(400).json({ success: false, message: 'Invalid role' })
    return
  }
  const { role } = parsedBody.data

  const existingUser = await prisma.user.findUnique({ where: { id } })
  if (!existingUser) {
    res.status(404).json({ success: false, message: 'User not found' })
    return
  }

  if (existingUser.role === 'ADMIN' && role !== 'ADMIN') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    if (adminCount <= 1) {
      res.status(400).json({ success: false, message: 'At least one administrator must remain' })
      return
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
  res.json({ success: true, user })
}

export async function deleteUser(req: AuthenticatedRequest, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  if (!id) {
    res.status(400).json({ success: false, message: 'Invalid user ID' })
    return
  }
  if (id === req.user?.id) {
    res.status(400).json({ success: false, message: 'You cannot delete your own account' })
    return
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' })
    return
  }

  if (user.role === 'ADMIN') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    if (adminCount <= 1) {
      res.status(400).json({ success: false, message: 'At least one administrator must remain' })
      return
    }
  }

  await prisma.user.delete({ where: { id } })
  res.json({ success: true })
}

export async function changePassword(
  req: AuthenticatedRequest,
  res: Response,
) {
  const parsedBody = changePasswordRequestSchema.safeParse(req.body)
  if (!parsedBody.success) {
    const invalidNewPassword = parsedBody.error.issues.some(
      ({ path }) => path[0] === 'newPassword',
    )
    if (invalidNewPassword) {
      res.status(400).json({
        success: false,
        message: 'New password must contain 12 to 128 characters',
      })
      return
    }
  }

  const currentPassword = parsedBody.success
    ? parsedBody.data.currentPassword ?? ''
    : ''
  const newPassword = parsedBody.success ? parsedBody.data.newPassword : ''

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    res.status(400).json({ success: false, message: 'Current password is incorrect' })
    return
  }

  const passwordHash = await hashPassword(newPassword)
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.session.deleteMany({
      where: {
        userId: user.id,
        NOT: { tokenHash: req.sessionTokenHash },
      },
    }),
  ])
  res.json({ success: true })
}
