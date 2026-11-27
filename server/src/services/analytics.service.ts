import prisma from '../config/database.js'

interface SalaryRow {
  amount: number
  currencyCode: string
  employee: {
    countryCode: string
    department: string
  }
}

interface SalaryGroup {
  currencyCode: string
  employeeCount: number
  payroll: number
  minSalary: number
  maxSalary: number
}

function addSalary(
  groups: Map<string, SalaryGroup>,
  key: string,
  salary: SalaryRow,
) {
  const group = groups.get(key) ?? {
    currencyCode: salary.currencyCode,
    employeeCount: 0,
    payroll: 0,
    minSalary: salary.amount,
    maxSalary: salary.amount,
  }

  group.employeeCount += 1
  group.payroll += salary.amount
  group.minSalary = Math.min(group.minSalary, salary.amount)
  group.maxSalary = Math.max(group.maxSalary, salary.amount)
  groups.set(key, group)
}

function toSalaryGroups(groups: Map<string, SalaryGroup>, label: string) {
  return Array.from(groups, ([key, group]) => {
    const [groupName, currencyCode] = key.split('\u0000')
    return {
      [label]: groupName === currencyCode ? undefined : groupName,
      currencyCode,
      employeeCount: group.employeeCount,
      totalPayroll: group.payroll,
      averageSalary: Math.round(group.payroll / group.employeeCount),
      lowestSalary: group.minSalary,
      highestSalary: group.maxSalary,
    }
  }).sort((a, b) => String(a[label] ?? '').localeCompare(String(b[label] ?? '')) ||
    String(a.currencyCode).localeCompare(String(b.currencyCode)))
}

export async function getSalaryAnalytics() {
  const [totalEmployees, countryGroups, departmentGroups, salaries] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.groupBy({
      by: ['countryCode'],
      _count: { _all: true },
      orderBy: { countryCode: 'asc' },
    }),
    prisma.employee.groupBy({
      by: ['department'],
      _count: { _all: true },
      orderBy: { department: 'asc' },
    }),
    prisma.salary.findMany({
      select: {
        amount: true,
        currencyCode: true,
        employee: { select: { countryCode: true, department: true } },
      },
    }),
  ])

  const byCurrency = new Map<string, SalaryGroup>()
  const byCountryCurrency = new Map<string, SalaryGroup>()
  const byDepartmentCurrency = new Map<string, SalaryGroup>()
  const employeeCountryCounts = new Map(
    countryGroups.map(({ countryCode, _count }) => [countryCode, _count._all]),
  )
  const employeeDepartmentCounts = new Map(
    departmentGroups.map(({ department, _count }) => [department, _count._all]),
  )

  for (const salary of salaries) {
    const row: SalaryRow = salary
    addSalary(
      byCurrency,
      `${salary.currencyCode}\u0000${salary.currencyCode}`,
      row,
    )
    addSalary(
      byCountryCurrency,
      `${salary.employee.countryCode}\u0000${salary.currencyCode}`,
      row,
    )
    addSalary(
      byDepartmentCurrency,
      `${salary.employee.department}\u0000${salary.currencyCode}`,
      row,
    )
  }

  return {
    summary: {
      totalEmployees,
      salaryRecords: salaries.length,
      countryCount: employeeCountryCounts.size,
      departmentCount: employeeDepartmentCounts.size,
    },
    employeesByCountry: Array.from(employeeCountryCounts, ([countryCode, count]) => ({
      countryCode,
      count,
    })),
    employeesByDepartment: Array.from(employeeDepartmentCounts, ([department, count]) => ({
      department,
      count,
    })),
    salaryByCurrency: toSalaryGroups(byCurrency, 'currencyCode'),
    salaryByCountryCurrency: toSalaryGroups(byCountryCurrency, 'countryCode'),
    salaryByDepartmentCurrency: toSalaryGroups(byDepartmentCurrency, 'department'),
  }
}
