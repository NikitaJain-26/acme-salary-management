
import type { Request, Response } from 'express'
import { getAllEmployees } from '../services/employee.service.js'

export async function getEmployees(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const search = String(req.query.search || '').trim()

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters',
      })
      return
    }

   const result = await getAllEmployees({ page, limit, search })

    res.status(200).json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Error fetching employees:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
    })
  }
}
