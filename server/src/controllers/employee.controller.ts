
import type { Request, Response } from 'express'
import {
  employeeSortFields,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeSalary,
} from '../services/employee.service.js'
import type { EmployeeSortField } from '../services/employee.service.js'

export async function getEmployees(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const search = String(req.query.search || '').trim()
    const country = String(req.query.country || '').trim().toUpperCase()
    const department = String(req.query.department || '').trim()
    const status = String(req.query.status || '').trim().toUpperCase()
    const sortByInput = String(req.query.sortBy || '').trim()
    const sortOrderInput = String(req.query.sortOrder || 'desc')
      .trim()
      .toLowerCase()

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

    let sortBy: EmployeeSortField = 'createdAt'
    if (sortByInput) {
      const matchedSortField = employeeSortFields.find(
        (field) => field === sortByInput,
      )

      if (!matchedSortField) {
        res.status(400).json({
          success: false,
          message: 'Invalid sort field',
        })
        return
      }

      sortBy = matchedSortField
    }

    if (!['asc', 'desc'].includes(sortOrderInput)) {
      res.status(400).json({
        success: false,
        message: 'Invalid sort order',
      })
      return
    }

    const sortOrder = sortOrderInput === 'asc' ? 'asc' : 'desc'

    const result = await getAllEmployees({
      page,
      limit,
      search,
      country,
      department,
      status,
      sortBy,
      sortOrder,
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

export async function putEmployeeSalary(req: Request, res: Response) {
  try {
    const id = req.params.id
    if (typeof id !== 'string' || !id.trim()) {
      res.status(400).json({
        success: false,
        message: 'Invalid employee ID',
      })
      return
    }

    const amount = req.body.amount
    const currencyCode =
      typeof req.body.currencyCode === 'string'
        ? req.body.currencyCode.trim().toUpperCase()
        : ''
    const effectiveFromInput =
      typeof req.body.effectiveFrom === 'string'
        ? req.body.effectiveFrom.trim()
        : ''
    const reason =
      typeof req.body.reason === 'string' && req.body.reason.trim()
        ? req.body.reason.trim()
        : undefined

    const effectiveFrom = new Date(effectiveFromInput)

    if (
      !Number.isInteger(amount) ||
      amount <= 0 ||
      !/^[A-Z]{3}$/.test(currencyCode) ||
      !effectiveFromInput ||
      Number.isNaN(effectiveFrom.getTime())
    ) {
      res.status(400).json({
        success: false,
        message:
          'Invalid salary data: amount must be a positive integer, currencyCode must be a three-letter code, and effectiveFrom must be a valid date',
      })
      return
    }

    const salary = await updateEmployeeSalary(id.trim(), {
      amount,
      currencyCode,
      effectiveFrom,
      reason,
    })

    if (!salary) {
      res.status(404).json({
        success: false,
        message: 'Employee not found',
      })
      return
    }

    res.status(200).json({
      success: true,
      salary,
    })
  } catch (error) {
    console.error('Error updating employee salary:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to update employee salary',
    })
  }
}

export async function getEmployeeDetails(req: Request, res: Response) {
  try {
    const id = req.params.id
    if (typeof id !== 'string' || !id.trim()) {
      res.status(400).json({
        success: false,
        message: 'Invalid employee ID',
      })
      return
    }

    const includeHistoryInput = String(req.query.includeHistory || '')
      .trim()
      .toLowerCase()

    if (
      includeHistoryInput &&
      !['true', 'false'].includes(includeHistoryInput)
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid includeHistory parameter',
      })
      return
    }

    const employee = await getEmployeeById(
      id.trim(),
      includeHistoryInput === 'true',
    )

    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Employee not found',
      })
      return
    }

    res.status(200).json({
      success: true,
      employee,
    })
  } catch (error) {
    console.error('Error fetching employee details:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee details',
    })
  }
}
