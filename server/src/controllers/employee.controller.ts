
import type { Request, Response } from 'express'
import {
  createEmployee,
  employeeSortFields,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeSalary,
} from '../services/employee.service.js'
import type { EmployeeSortField } from '../services/employee.service.js'

export async function postEmployee(req: Request, res: Response) {
  const stringFields = [
    'employeeNumber',
    'firstName',
    'lastName',
    'email',
    'countryCode',
    'department',
    'jobTitle',
  ] as const
  const getString = (field: (typeof stringFields)[number]) =>
    typeof req.body[field] === 'string' ? req.body[field].trim() : ''
  const values = {
    employeeNumber: getString('employeeNumber'),
    firstName: getString('firstName'),
    lastName: getString('lastName'),
    email: getString('email').toLowerCase(),
    countryCode: getString('countryCode').toUpperCase(),
    department: getString('department'),
    jobTitle: getString('jobTitle'),
  }
  const statusInput = req.body.status || 'ACTIVE'
  const hireDateInput = typeof req.body.hireDate === 'string'
    ? req.body.hireDate.trim()
    : ''
  const hireDate = new Date(hireDateInput)
  const salaryInput = req.body.salary
  const salaryAmount = salaryInput?.amount
  const currencyCode = typeof salaryInput?.currencyCode === 'string'
    ? salaryInput.currencyCode.trim().toUpperCase()
    : ''
  const effectiveFromInput = typeof salaryInput?.effectiveFrom === 'string'
    ? salaryInput.effectiveFrom.trim()
    : ''
  const effectiveFrom = new Date(effectiveFromInput)
  const hasSalary = salaryAmount !== undefined && salaryAmount !== null && salaryAmount !== ''

  if (
    stringFields.some((field) => !values[field]) ||
    values.employeeNumber.length > 32 ||
    values.firstName.length > 100 ||
    values.lastName.length > 100 ||
    values.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ||
    !/^[A-Z]{2}$/.test(values.countryCode) ||
    values.department.length > 100 ||
    values.jobTitle.length > 100 ||
    !['ACTIVE', 'INACTIVE'].includes(statusInput) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(hireDateInput) ||
    Number.isNaN(hireDate.getTime())
  ) {
    res.status(400).json({
      success: false,
      message: 'Provide valid employee details, a two-letter country code, status, and hire date',
    })
    return
  }

  const status: 'ACTIVE' | 'INACTIVE' = statusInput === 'INACTIVE'
    ? 'INACTIVE'
    : 'ACTIVE'

  if (
    hasSalary &&
    (
      !Number.isSafeInteger(salaryAmount) ||
      salaryAmount <= 0 ||
      salaryAmount > 2_147_483_647 ||
      !/^[A-Z]{3}$/.test(currencyCode) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(effectiveFromInput) ||
      Number.isNaN(effectiveFrom.getTime())
    )
  ) {
    res.status(400).json({
      success: false,
      message: 'Salary requires a positive amount in minor currency units, a three-letter currency code, and an effective date',
    })
    return
  }

  try {
    const employee = await createEmployee({
      ...values,
      status,
      hireDate,
      ...(hasSalary
        ? {
            salary: {
              amount: salaryAmount,
              currencyCode,
              effectiveFrom,
            },
          }
        : {}),
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
