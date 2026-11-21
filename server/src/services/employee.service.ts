
import prisma from '../config/database.js'

interface PaginationParams {
  page: number
  limit: number
  search?: string
}

export async function getAllEmployees({ page, limit,search }: PaginationParams) {
  const skip = (page - 1) * limit
  const where = search
  ? {
      OR: [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { employeeNumber: { contains: search } },
        { email: { contains: search } },
      ],
    }
  : {}

  const [employees, totalEmployees] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip,
      take: limit,
      include: {
        salary: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
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
