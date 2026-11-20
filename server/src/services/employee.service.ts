
import prisma from '../config/database.js'

export async function getAllEmployees() {
  const employees = await prisma.employee.findMany({
    include: {
      salary: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return employees
}
