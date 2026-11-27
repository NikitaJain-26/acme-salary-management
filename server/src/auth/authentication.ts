import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import type { NextFunction, Request, Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import prisma from '../config/database.js'

const scryptAsync = promisify(scrypt)
const sessionCookieName = 'acme_session'
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000

export type UserRole = 'ADMIN' | 'VIEWER'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface AuthenticatedRequest
  extends Request<ParamsDictionary, unknown, unknown> {
  user?: AuthenticatedUser
  sessionTokenHash?: string
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url')
  const derivedKey = await scryptAsync(password, salt, 64) as Buffer
  return `${salt}:${derivedKey.toString('base64url')}`
}

export async function verifyPassword(password: string, storedHash: string) {
  if (password.length > 128) {
    return false
  }

  const [salt, encodedKey] = storedHash.split(':')
  if (!salt || !encodedKey) {
    return false
  }

  const expectedKey = Buffer.from(encodedKey, 'base64url')
  const actualKey = await scryptAsync(password, salt, expectedKey.length) as Buffer

  return expectedKey.length === actualKey.length &&
    timingSafeEqual(expectedKey, actualKey)
}

export function getCookie(req: Request, name: string) {
  const cookieHeader = req.get('cookie')
  if (!cookieHeader) {
    return undefined
  }

  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))

  return cookie?.slice(name.length + 1)
}

export function setSessionCookie(res: Response, token: string) {
  const secure =
    process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT
      ? '; Secure'
      : ''
  res.setHeader(
    'Set-Cookie',
    `${sessionCookieName}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${sessionDurationMs / 1000}${secure}`,
  )
}

export function clearSessionCookie(res: Response) {
  const secure =
    process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT
      ? '; Secure'
      : ''
  res.setHeader(
    'Set-Cookie',
    `${sessionCookieName}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`,
  )
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url')
  const tokenHash = createHash('sha256').update(token).digest('hex')

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt: new Date(Date.now() + sessionDurationMs),
    },
  })

  return token
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = getCookie(req, sessionCookieName)
  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required' })
    return
  }

  const tokenHash = createHash('sha256').update(token).digest('hex')
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.session.delete({ where: { tokenHash } })
    }
    res.status(401).json({ success: false, message: 'Session expired' })
    return
  }

  req.user = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as UserRole,
  }
  req.sessionTokenHash = tokenHash
  next()
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Administrator access required' })
    return
  }

  next()
}
