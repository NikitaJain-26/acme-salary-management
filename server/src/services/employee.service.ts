
import prisma from '../config/database.js'

export const employeeSortFields = [
  'firstName',
  'lastName',
  'employeeNumber',
  'countryCode',
  'department',
  'status',
  'hireDate',
  'salaryAmount',
] as const

export type EmployeeSortField =
  | (typeof employeeSortFields)[number]
  | 'createdAt'

export type SortOrder = 'asc' | 'desc'

interface PaginationParams {
  page: number
  limit: number
  search?: string
  country?: string
  department?: string
  status?: string
  sortBy: EmployeeSortField
  sortOrder: SortOrder
}

export async function getAllEmployees({
  page,
  limit,
  search,
  country,
  department,
  status,
  sortBy,
  sortOrder,
}: PaginationParams) {
  const skip = (page - 1) * limit
  const where = {
    ...(search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { employeeNumber: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {}),
    ...(country ? { countryCode: country } : {}),
    ...(department ? { department } : {}),
    ...(status ? { status } : {}),
  }

  const [employees, totalEmployees] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip,
      take: limit,
      include: {
        salary: true,
      },
      orderBy: sortBy === 'salaryAmount'
        ? { salary: { amount: sortOrder } }
        : { [sortBy]: sortOrder },
    }),

    prisma.employee.count({where}),
  ])

  return {
    employees,
    totalEmployees,
    currentPage: page,
    totalPages: Math.ceil(totalEmployees / limit),
    pageSize: limit,
  }
}

export interface EmployeeCreateParams {
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  countryCode: string
  department: string
  jobTitle: string
  status: 'ACTIVE' | 'INACTIVE'
  hireDate: Date
  salary?: {
    amount: number
    currencyCode: string
    effectiveFrom: Date
  }
}

export async function createEmployee(params: EmployeeCreateParams) {
  const { salary, ...employee } = params

  return prisma.employee.create({
    data: {
      ...employee,
      ...(salary
        ? {
            salary: { create: salary },
            salaryHistory: {
              create: {
                ...salary,
                reason: 'Initial salary record',
              },
            },
          }
        : {}),
    },
    include: { salary: true },
  })
}

export interface SalaryUpdateParams {
  amount: number
  currencyCode: string
  effectiveFrom: Date
  reason?: string
}

export async function updateEmployeeSalary(
  employeeId: string,
  params: SalaryUpdateParams,
) {
  return prisma.$transaction(async (tx) => {
    const employee = await tx.employee.findUnique({
      where: { id: employeeId },
      select: { id: true },
    })

    if (!employee) {
      return null
    }

    const existingSalary = await tx.salary.findUnique({
      where: { employeeId },
    })

    const salaryChanged = !existingSalary ||
      existingSalary.amount !== params.amount ||
      existingSalary.currencyCode !== params.currencyCode ||
      existingSalary.effectiveFrom.getTime() !== params.effectiveFrom.getTime()

    if (salaryChanged) {
      await tx.salaryHistory.create({
        data: {
          employeeId,
          amount: params.amount,
          currencyCode: params.currencyCode,
          effectiveFrom: params.effectiveFrom,
          reason: params.reason,
        },
      })
    }

    const salary = await tx.salary.upsert({
      where: { employeeId },
      create: {
        employeeId,
        amount: params.amount,
        currencyCode: params.currencyCode,
        effectiveFrom: params.effectiveFrom,
      },
      update: {
        amount: params.amount,
        currencyCode: params.currencyCode,
        effectiveFrom: params.effectiveFrom,
      },
    })

    return salary
  })
}

export async function getEmployeeById(id: string, includeHistory: boolean) {
  if (includeHistory) {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        salary: true,
        salaryHistory: {
          orderBy: [
            { effectiveFrom: 'desc' },
            { createdAt: 'desc' },
          ],
        },
      },
    })
  }

  return prisma.employee.findUnique({
    where: { id },
    include: {
      salary: true,
    },
  })
}
