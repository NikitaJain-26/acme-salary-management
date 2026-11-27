import { Router } from 'express'
import {
  changePassword,
  createUser,
  deleteUser,
  getAuthStatus,
  getCurrentUser,
  listUsers,
  login,
  logout,
  updateUserRole,
} from './auth.controller.js'
import { requireAdmin, requireAuth } from './authentication.js'

const router = Router()

router.get('/status', getAuthStatus)
router.post('/login', login)
router.post('/logout', requireAuth, logout)
router.get('/me', requireAuth, getCurrentUser)
router.post('/change-password', requireAuth, changePassword)
router.get('/users', requireAuth, requireAdmin, listUsers)
router.post('/users', requireAuth, requireAdmin, createUser)
router.patch('/users/:id/role', requireAuth, requireAdmin, updateUserRole)
router.delete('/users/:id', requireAuth, requireAdmin, deleteUser)

export default router
