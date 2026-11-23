
import { Router } from 'express'
import {
  getEmployeeDetails,
  getEmployees,
} from '../controllers/employee.controller.js'

const router = Router()

router.get('/', getEmployees)
router.get('/:id', getEmployeeDetails)

export default router
