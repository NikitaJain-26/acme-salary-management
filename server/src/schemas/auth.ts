import { z } from 'zod'

export const loginRequestSchema = z.object({
  email: z.string().optional().transform((email) => email?.trim().toLowerCase()),
  password: z.string().optional(),
})

export const createUserRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string()
    .trim()
    .toLowerCase()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  password: z.string().min(12).max(128),
  role: z.enum(['ADMIN', 'VIEWER']),
})

export const updateUserRoleRequestSchema = z.object({
  role: z.enum(['ADMIN', 'VIEWER']),
})

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(12).max(128),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>
export type UpdateUserRoleRequest = z.infer<typeof updateUserRoleRequestSchema>
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>
