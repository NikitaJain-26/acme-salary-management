
import { Router } from 'express'
import {
  getEmployeeDetails,
  getEmployees,
  postEmployee,
  putEmployeeSalary,
} from '../controllers/employee.controller.js'
import { requireAdmin } from '../auth/authentication.js'

const router = Router()

router.get('/', getEmployees)
router.post('/', requireAdmin, postEmployee)
router.put('/:id/salary', requireAdmin, putEmployeeSalary)
router.get('/:id', getEmployeeDetails)

export default router
