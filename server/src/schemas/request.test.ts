import assert from 'node:assert/strict'
import test from 'node:test'
import {
  changePasswordRequestSchema,
  createUserRequestSchema,
  updateUserRoleRequestSchema,
} from './auth.js'
import { employeeCreateRequestSchema, employeeSalaryUpdateRequestSchema } from './employee.js'

test('auth request schemas validate and normalize input', () => {
  const createUser = createUserRequestSchema.safeParse({
    name: '  Admin User ',
    email: ' ADMIN@ACME.COM ',
    password: 'a-secure-password',
    role: 'ADMIN',
  })

  assert.equal(createUser.success, true)
  if (createUser.success) {
    assert.deepEqual(createUser.data, {
      name: 'Admin User',
      email: 'admin@acme.com',
      password: 'a-secure-password',
      role: 'ADMIN',
    })
  }

  assert.equal(updateUserRoleRequestSchema.safeParse({ role: 'INVALID' }).success, false)
  assert.equal(changePasswordRequestSchema.safeParse({
    currentPassword: 'current-password',
    newPassword: 'short',
  }).success, false)
})

test('employee request schemas validate and normalize employee and salary data', () => {
  const employee = employeeCreateRequestSchema.safeParse({
    employeeNumber: ' EMP-1 ',
    firstName: ' Ada ',
    lastName: ' Lovelace ',
    email: ' ADA@EXAMPLE.COM ',
    countryCode: 'in',
    department: 'Engineering',
    jobTitle: 'Engineer',
    hireDate: '2024-01-02',
    salary: {
      amount: 125000,
      currencyCode: 'inr',
      effectiveFrom: '2024-01-02',
    },
  })

  assert.equal(employee.success, true)
  if (employee.success) {
    assert.equal(employee.data.status, 'ACTIVE')
    assert.equal(employee.data.email, 'ada@example.com')
    assert.equal(employee.data.countryCode, 'IN')
    assert.deepEqual(employee.data.salary, {
      amount: 125000,
      currencyCode: 'INR',
      effectiveFrom: '2024-01-02',
    })
  }

  assert.equal(employeeCreateRequestSchema.safeParse({
    employeeNumber: '',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    countryCode: 'IN',
    department: 'Engineering',
    jobTitle: 'Engineer',
    hireDate: '2024-01-02',
  }).success, false)

  assert.equal(employeeSalaryUpdateRequestSchema.safeParse({
    amount: 100,
    currencyCode: 'USD',
    effectiveFrom: 'not-a-date',
  }).success, false)

  const unsupportedDepartment = employeeCreateRequestSchema.safeParse({
    employeeNumber: 'EMP-2',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada2@example.com',
    countryCode: 'IN',
    department: 'Research',
    jobTitle: 'Engineer',
    hireDate: '2024-01-02',
  })
  assert.equal(unsupportedDepartment.success, false)

  const unsupportedCountry = employeeCreateRequestSchema.safeParse({
    employeeNumber: 'EMP-3',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada3@example.com',
    countryCode: 'FR',
    department: 'Engineering',
    jobTitle: 'Engineer',
    hireDate: '2024-01-02',
  })
  assert.equal(unsupportedCountry.success, false)

  const mismatchedCurrency = employeeCreateRequestSchema.safeParse({
    employeeNumber: 'EMP-4',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada4@example.com',
    countryCode: 'IN',
    department: 'Engineering',
    jobTitle: 'Engineer',
    hireDate: '2024-01-02',
    salary: {
      amount: 125000,
      currencyCode: 'USD',
      effectiveFrom: '2024-01-02',
    },
  })
  assert.equal(mismatchedCurrency.success, false)
})
