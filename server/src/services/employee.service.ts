
import prisma from '../config/database.js'

interface PaginationParams {
  page: number
  limit: number
}

export async function getAllEmployees({ page, limit }: PaginationParams) {
  const skip = (page - 1) * limit

  const [employees, totalEmployees] = await Promise.all([
    prisma.employee.findMany({
      skip,
      take: limit,
      include: {
        salary: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),

    prisma.employee.count(),
  ])

  return {
    employees,
    totalEmployees,
    currentPage: page,
    totalPages: Math.ceil(totalEmployees / limit),
    pageSize: limit,
  }
}
