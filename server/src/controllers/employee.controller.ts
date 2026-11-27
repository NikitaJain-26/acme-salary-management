
import type { Request, Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import {
  EMPLOYEE_SORT_FIELDS,
  isEmployeeStatus,
  type EmployeeSortField,
} from '../constants/employee.js'
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeSalary,
} from '../services/employee.service.js'
import {
  employeeCreateRequestSchema,
  employeeSalaryUpdateRequestSchema,
} from '../schemas/employee.js'
import type { SortOrder } from '../types/employee.js'

function isValidPagination(page: number, limit: number): boolean {
  return (
    Number.isInteger(page) &&
    Number.isInteger(limit) &&
    page >= 1 &&
    limit >= 1 &&
    limit <= 100
  )
}

function isSortOrder(value: string): value is SortOrder {
  return value === 'asc' || value === 'desc'
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isIncludeHistoryValue(value: string): value is 'true' | 'false' {
  return value === 'true' || value === 'false'
}

export async function postEmployee(
  req: Request<ParamsDictionary, unknown, unknown>,
  res: Response,
) {
  const parsedBody = employeeCreateRequestSchema.safeParse(req.body)
  if (!parsedBody.success) {
    const hasInvalidSalary = parsedBody.error.issues.some(
      ({ path }) => path[0] === 'salary',
    )
    res.status(400).json({
      success: false,
      message: hasInvalidSalary
        ? 'Salary requires a positive amount in minor currency units, a three-letter currency code, and an effective date'
        : 'Provide valid employee details, a two-letter country code, status, and hire date',
    })
    return
  }

  const body = parsedBody.data
  const hireDate = new Date(body.hireDate)
  const salary = body.salary?.amount !== undefined &&
      body.salary.amount !== null
    ? {
        amount: body.salary.amount,
        currencyCode: body.salary.currencyCode,
        effectiveFrom: new Date(body.salary.effectiveFrom),
      }
    : undefined

  try {
    const employee = await createEmployee({
      employeeNumber: body.employeeNumber,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      countryCode: body.countryCode,
      department: body.department,
      jobTitle: body.jobTitle,
      status: body.status,
      hireDate,
      ...(salary ? { salary } : {}),
    })
    res.status(201).json({ success: true, employee })
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      res.status(409).json({
        success: false,
        message: 'Employee number or email already exists',
      })
      return
    }

    console.error('Error creating employee:', error)
    res.status(500).json({ success: false, message: 'Failed to create employee' })
  }
}

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

    if (!isValidPagination(page, limit)) {
      res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters',
      })
      return
    }

    if (status && !isEmployeeStatus(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status filter',
      })
      return
    }

    let sortBy: EmployeeSortField = 'createdAt'
    if (sortByInput) {
      const matchedSortField = EMPLOYEE_SORT_FIELDS.find(
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

    if (!isSortOrder(sortOrderInput)) {
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

export async function putEmployeeSalary(
  req: Request<ParamsDictionary, unknown, unknown>,
  res: Response,
) {
  try {
    const id = req.params.id
    if (!isNonEmptyString(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid employee ID',
      })
      return
    }

    const parsedBody = employeeSalaryUpdateRequestSchema.safeParse(req.body)
    if (!parsedBody.success) {
      res.status(400).json({
        success: false,
        message:
          'Invalid salary data: amount must be a positive integer, currencyCode must be a three-letter code, and effectiveFrom must be a valid date',
      })
      return
    }

    const { amount, currencyCode, effectiveFrom, reason } = parsedBody.data
    const salary = await updateEmployeeSalary(id.trim(), {
      amount,
      currencyCode,
      effectiveFrom: new Date(effectiveFrom),
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
    if (!isNonEmptyString(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid employee ID',
      })
      return
    }

    const includeHistoryInput = String(req.query.includeHistory || '')
      .trim()
      .toLowerCase()

    if (includeHistoryInput && !isIncludeHistoryValue(includeHistoryInput)) {
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
