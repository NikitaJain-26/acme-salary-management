
import { Router } from 'express'
import {
  getEmployeeDetails,
  getEmployees,
  putEmployeeSalary,
} from '../controllers/employee.controller.js'

const router = Router()

router.get('/', getEmployees)
router.put('/:id/salary', putEmployeeSalary)
router.get('/:id', getEmployeeDetails)

export default router
