import assert from 'node:assert/strict'
import { before, test } from 'node:test'

const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:5000'
let adminCookie = ''

async function request(
  path: string,
  options: RequestInit = {},
  cookie = adminCookie,
) {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (cookie) {
    headers.set('Cookie', cookie)
  }
  return fetch(`${baseUrl}${path}`, { ...options, headers })
}

before(async () => {
  const response = await request(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({
        email: process.env.TEST_ADMIN_EMAIL,
        password: process.env.TEST_ADMIN_PASSWORD,
      }),
    },
    '',
  )
  assert.equal(response.status, 200, 'Test administrator must be configured')
  adminCookie = response.headers.get('set-cookie')?.split(';')[0] ?? ''
  assert.ok(adminCookie)
})

test('requires a session to read employee data', async () => {
  const response = await request('/api/employees', {}, '')
  assert.equal(response.status, 401)
})

test('authenticated users can load supported employee options', async () => {
  const response = await request('/api/employees/options')
  assert.equal(response.status, 200)

  const options = await response.json() as {
    success: boolean
    departments: string[]
    countries: Array<{ code: string; name: string; currency: string }>
  }
  assert.equal(options.success, true)
  assert.ok(options.departments.includes('Engineering'))
  assert.ok(options.countries.some(
    ({ code, currency }) => code === 'IN' && currency === 'INR',
  ))
})

test('admin can create employees and analytics reflect their salary', async () => {
  const unique = `${Date.now()}`
  const employeePayload = {
    employeeNumber: `TEST${unique}`,
    firstName: 'Test',
    lastName: 'Employee',
    email: `test.${unique}@example.test`,
    countryCode: 'US',
    department: 'Engineering',
    jobTitle: 'Test Engineer',
    status: 'ACTIVE',
    hireDate: '2024-01-15',
    salary: {
      amount: 8_000_000,
      currencyCode: 'USD',
      effectiveFrom: '2024-01-15',
    },
  }

  const createdResponse = await request('/api/employees', {
    method: 'POST',
    body: JSON.stringify(employeePayload),
  })
  assert.equal(createdResponse.status, 201)
  const created = await createdResponse.json() as {
    employee: { id: string; salary: { amount: number } }
  }
  assert.equal(created.employee.salary.amount, 8_000_000)

  const duplicate = await request('/api/employees', {
    method: 'POST',
    body: JSON.stringify(employeePayload),
  })
  assert.equal(duplicate.status, 409)

  const analyticsResponse = await request('/api/analytics')
  assert.equal(analyticsResponse.status, 200)
  const analytics = await analyticsResponse.json() as {
    salaryByCurrency: Array<{ currencyCode: string; employeeCount: number }>
  }
  assert.ok(analytics.salaryByCurrency.some(
    (group) => group.currencyCode === 'USD' && group.employeeCount > 0,
  ))

  const invalidSalary = await request('/api/employees', {
    method: 'POST',
    body: JSON.stringify({
      ...employeePayload,
      employeeNumber: `TESTINVALID${unique}`,
      email: `invalid.${unique}@example.test`,
      salary: { ...employeePayload.salary, amount: -1 },
    }),
  })
  assert.equal(invalidSalary.status, 400)
})

test('viewer accounts can read but cannot change data or manage accounts', async () => {
  const unique = `${Date.now()}`
  const createUserResponse = await request('/api/auth/users', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test Viewer',
      email: `viewer.${unique}@example.test`,
      password: `Test-viewer-${unique}`,
      role: 'VIEWER',
    }),
  })
  assert.equal(createUserResponse.status, 201)

  const viewerLogin = await request(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({
        email: `viewer.${unique}@example.test`,
        password: `Test-viewer-${unique}`,
      }),
    },
    '',
  )
  assert.equal(viewerLogin.status, 200)
  const viewerCookie = viewerLogin.headers.get('set-cookie')?.split(';')[0] ?? ''
  assert.ok(viewerCookie)

  const employeeList = await request('/api/employees?limit=1', {}, viewerCookie)
  assert.equal(employeeList.status, 200)

  const createEmployee = await request(
    '/api/employees',
    {
      method: 'POST',
      body: JSON.stringify({
        employeeNumber: `VIEWER${unique}`,
        firstName: 'Viewer',
        lastName: 'Attempt',
        email: `viewer.attempt.${unique}@example.test`,
        countryCode: 'US',
        department: 'Engineering',
        jobTitle: 'Viewer',
        hireDate: '2024-01-15',
      }),
    },
    viewerCookie,
  )
  assert.equal(createEmployee.status, 403)

  const users = await request('/api/auth/users', {}, viewerCookie)
  assert.equal(users.status, 403)
})
