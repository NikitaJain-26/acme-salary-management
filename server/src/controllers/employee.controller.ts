
import type { Request, Response } from 'express'
import { getAllEmployees } from '../services/employee.service.js'

export async function getEmployees(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const search = String(req.query.search || '').trim()
    const country = String(req.query.country || '').trim().toUpperCase()
    const department = String(req.query.department || '').trim()
    const status = String(req.query.status || '').trim().toUpperCase()

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

    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status filter',
      })
      return
    }

    const result = await getAllEmployees({
      page,
      limit,
      search,
      country,
      department,
      status,
    })

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
