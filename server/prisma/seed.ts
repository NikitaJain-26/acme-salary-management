
import { randomUUID } from 'node:crypto'
import process from 'node:process'
import prisma from '../src/config/database.js'

const BATCH_SIZE = 500
const TOTAL_EMPLOYEES = 10_000

const countries = [
  { code: 'IN', currency: 'INR', minSalary: 400_000, maxSalary: 2_500_000 },
  { code: 'US', currency: 'USD', minSalary: 50_000, maxSalary: 180_000 },
  { code: 'GB', currency: 'GBP', minSalary: 30_000, maxSalary: 120_000 },
  { code: 'DE', currency: 'EUR', minSalary: 35_000, maxSalary: 110_000 },
  { code: 'CA', currency: 'CAD', minSalary: 45_000, maxSalary: 150_000 },
  { code: 'AU', currency: 'AUD', minSalary: 50_000, maxSalary: 160_000 },
  { code: 'SG', currency: 'SGD', minSalary: 45_000, maxSalary: 160_000 },
  { code: 'AE', currency: 'AED', minSalary: 60_000, maxSalary: 240_000 },
]

const departments = [
  'Engineering',
  'Human Resources',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Customer Support',
  'Legal',
  'Product',
  'Data & Analytics',
  'IT',
  'Administration',
]

const firstNames = [
  'Aarav', 'Priya', 'Rahul', 'Ananya', 'John',
  'Emma', 'David', 'Olivia', 'Michael', 'Sophia',
  'Daniel', 'Isabella', 'Arjun', 'Mia', 'James',
  'Aisha', 'Noah', 'Emily', 'Lucas', 'Meera',
]

const lastNames = [
  'Sharma', 'Patel', 'Jain', 'Verma', 'Smith',
  'Johnson', 'Brown', 'Wilson', 'Taylor', 'Martin',
  'Lee', 'Clark', 'Kumar', 'Singh', 'Anderson',
]

const jobTitles: Record<string, string[]> = {
  Engineering: ['Software Engineer', 'Senior Developer', 'Tech Lead'],
  'Human Resources': ['HR Executive', 'HR Manager', 'Recruiter'],
  Finance: ['Financial Analyst', 'Accountant', 'Finance Manager'],
  Marketing: ['Marketing Executive', 'Marketing Manager', 'SEO Specialist'],
  Sales: ['Sales Executive', 'Sales Manager', 'Account Manager'],
  Operations: ['Operations Executive', 'Operations Manager'],
  'Customer Support': ['Support Executive', 'Support Manager'],
  Legal: ['Legal Associate', 'Legal Manager'],
  Product: ['Product Analyst', 'Product Manager'],
  'Data & Analytics': ['Data Analyst', 'Data Engineer'],
  IT: ['IT Support Engineer', 'IT Manager'],
  Administration: ['Admin Executive', 'Office Manager'],
}

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(startYear: number, endYear: number) {
  const start = new Date(startYear, 0, 1).getTime()
  const end = new Date(endYear, 11, 31).getTime()

  return new Date(randomNumber(start, end))
}

async function seedEmployees() {
  console.log('Clearing existing employee data...')

  await prisma.salaryHistory.deleteMany()
  await prisma.salary.deleteMany()
  await prisma.employee.deleteMany()

  console.log('Generating 10,000 employees...')

  const employees = Array.from({ length: TOTAL_EMPLOYEES }, (_, index) => {
    const country = countries[index % countries.length]
    const department = departments[randomNumber(0, departments.length - 1)]
    const firstName = firstNames[randomNumber(0, firstNames.length - 1)]
    const lastName = lastNames[randomNumber(0, lastNames.length - 1)]
    const hireDate = randomDate(2015, 2026)

    const salaryAmount =
      randomNumber(country.minSalary, country.maxSalary) * 100

    const isInactive = Math.random() < 0.05

    return {
      id: randomUUID(),
      employeeNumber: `EMP${String(index + 1).padStart(5, '0')}`,
      firstName,
      lastName,
      email: `employee${index + 1}@acme.com`,
      countryCode: country.code,
      department,
      jobTitle: jobTitles[department][
        randomNumber(0, jobTitles[department].length - 1)
      ],
      status: isInactive ? 'INACTIVE' : 'ACTIVE',
      hireDate,
      salary: {
        amount: salaryAmount,
        currencyCode: country.currency,
        effectiveFrom: hireDate,
      },
    }
  })

  for (let i = 0; i < employees.length; i += BATCH_SIZE) {
    const batch = employees.slice(i, i + BATCH_SIZE)

    await prisma.employee.createMany({
      data: batch.map(({ salary, ...employee }) => employee),
    })

    await prisma.salary.createMany({
      data: batch.map((employee) => ({
        employeeId: employee.id,
        ...employee.salary,
      })),
    })

    await prisma.salaryHistory.createMany({
      data: batch.map((employee) => ({
        employeeId: employee.id,
        ...employee.salary,
        reason: 'Initial salary record',
      })),
    })

    console.log(`Inserted ${Math.min(i + BATCH_SIZE, TOTAL_EMPLOYEES)} employees`)
  }

  console.log('Seed completed successfully!')
}

seedEmployees()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
