
import type { Request, Response } from 'express'
import { getAllEmployees } from '../services/employee.service.js'

export async function getEmployees(req: Request, res: Response) {
  try {
    const employees = await getAllEmployees()

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    })
  } catch (error) {
    console.error('Error fetching employees:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
    })
  }
}
