
import prisma from '../config/database.js'

interface PaginationParams {
  page: number
  limit: number
  search?: string
  country?: string
  department?: string
  status?: string
}

export async function getAllEmployees({
  page,
  limit,
  search,
  country,
  department,
  status,
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
