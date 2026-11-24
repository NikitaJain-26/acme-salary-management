import assert from 'node:assert/strict'
import { test } from 'node:test'

const baseUrl = 'http://localhost:5000'

async function request(path: string, options?: RequestInit) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const body = await response.json()
  return { response, body }
}

test('salary endpoint validates requests and unknown employees', async () => {
  const invalid = await request('/api/employees/not-found/salary', {
    method: 'PUT',
    body: JSON.stringify({
      amount: -1,
      currencyCode: 'USD',
      effectiveFrom: '2026-11-23',
    }),
  })

  assert.equal(invalid.response.status, 400)

  const unknown = await request('/api/employees/not-found/salary', {
    method: 'PUT',
    body: JSON.stringify({
      amount: 10000,
      currencyCode: 'USD',
      effectiveFrom: '2026-11-23',
      reason: 'Integration test',
    }),
  })

  assert.equal(unknown.response.status, 404)
})

test('salary update changes current salary and preserves history', async () => {
  const list = await request('/api/employees?page=1&limit=1')
  assert.equal(list.response.status, 200)

  const employee = list.body.employees[0]
  assert.ok(employee?.id)
  assert.ok(employee?.salary)

  const original = employee.salary
  const testAmount = original.amount + 1

  const beforeDetails = await request(
    `/api/employees/${employee.id}?includeHistory=true`,
  )
  const beforeHistory = beforeDetails.body.employee.salaryHistory as Array<{
    reason: string | null
  }>
  const previousReasonCount = beforeHistory.filter(
    (record) => record.reason === 'Previous salary before update',
  ).length

  try {
    const update = await request(`/api/employees/${employee.id}/salary`, {
      method: 'PUT',
      body: JSON.stringify({
        amount: testAmount,
        currencyCode: original.currencyCode,
        effectiveFrom: '2026-11-23',
        reason: 'Automated integration test',
      }),
    })

    assert.equal(update.response.status, 200)
    assert.equal(update.body.salary.amount, testAmount)

    const details = await request(
      `/api/employees/${employee.id}?includeHistory=true`,
    )

    assert.equal(details.response.status, 200)
    assert.equal(details.body.employee.salary.amount, testAmount)

    const history = details.body.employee.salaryHistory as Array<{
      amount: number
      reason: string | null
    }>

    assert.ok(history.some((record) => record.amount === testAmount))
    const previousReasonCountAfter = history.filter(
      (record) => record.reason === 'Previous salary before update',
    ).length
    assert.equal(previousReasonCountAfter, previousReasonCount)
  } finally {
    await request(`/api/employees/${employee.id}/salary`, {
      method: 'PUT',
      body: JSON.stringify({
        amount: original.amount,
        currencyCode: original.currencyCode,
        effectiveFrom: original.effectiveFrom,
        reason: 'Restore original salary after integration test',
      }),
    })
  }
})
