
import prisma from '../config/database.js'

export const employeeSortFields = [
  'firstName',
  'lastName',
  'employeeNumber',
  'countryCode',
  'department',
  'status',
  'hireDate',
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
      orderBy: { [sortBy]: sortOrder },
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
