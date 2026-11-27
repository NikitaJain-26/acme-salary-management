import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import {
  getEmployeeDetails,
  updateEmployeeSalary,
  type EmployeeDetails as EmployeeDetailsData,
} from '../services/employeeApi'

function formatCurrency(amount: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100)
}

function EmployeeDetails() {
  const { user } = useAuth()
  const { id } = useParams()
  const [employee, setEmployee] = useState<EmployeeDetailsData | null>(null)
  const [includeHistory, setIncludeHistory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!id) {
      return
    }

    let active = true

    getEmployeeDetails(id, includeHistory)
      .then((response) => {
        if (active) {
          setEmployee(response.employee)
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load employee details. Please try again.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [id, includeHistory])

  function loadSalaryHistory() {
    setLoading(true)
    setError('')
    setIncludeHistory(true)
  }

  async function submitSalaryUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!id || !employee) {
      return
    }

    const formData = new FormData(event.currentTarget)
    const amountMajor = Number(formData.get('amount'))
    const currencyCode = String(formData.get('currencyCode') || '')
    const effectiveFrom = String(formData.get('effectiveFrom') || '')
    const reason = String(formData.get('reason') || '').trim()

    if (
      !Number.isFinite(amountMajor) ||
      amountMajor <= 0 ||
      !currencyCode ||
      !effectiveFrom
    ) {
      setUpdateError('Enter a positive amount, currency, and effective date.')
      setUpdateSuccess('')
      return
    }

    setUpdating(true)
    setUpdateError('')
    setUpdateSuccess('')

    try {
      await updateEmployeeSalary(id, {
        amount: Math.round(amountMajor * 100),
        currencyCode,
        effectiveFrom,
        reason: reason || undefined,
      })

      const refreshed = await getEmployeeDetails(id, includeHistory)
      setEmployee(refreshed.employee)
      setUpdateSuccess('Salary updated successfully.')
    } catch {
      setUpdateError('Could not update salary. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div>
      <Link
        className="mb-6 inline-block text-sm font-medium text-blue-700 hover:underline"
        to="/employees"
      >
        Back to employees
      </Link>

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500" role="status">
          Loading employee details...
        </p>
      ) : error ? (
        <p className="py-12 text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : employee ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {employee.employeeNumber}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 font-semibold text-slate-900">
                Employee information
              </h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-slate-500">Email</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {employee.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Job title</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {employee.jobTitle}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Department</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {employee.department}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Country</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {employee.countryCode}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Status</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {employee.status}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Hire date</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {new Date(employee.hireDate).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 font-semibold text-slate-900">
                Current salary
              </h2>
              {employee.salary ? (
                <>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(
                      employee.salary.amount,
                      employee.salary.currencyCode,
                    )}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Effective from{' '}
                    {new Date(
                      employee.salary.effectiveFrom,
                    ).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  No current salary record.
                </p>
              )}

              {user?.role === 'ADMIN' && (
              <form className="mt-5 grid gap-3" onSubmit={submitSalaryUpdate}>
                <label className="text-sm font-medium text-slate-700">
                  Amount
                  <input
                    aria-label="Salary amount"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                    defaultValue={
                      employee.salary
                        ? (employee.salary.amount / 100).toFixed(2)
                        : ''
                    }
                    min="0.01"
                    name="amount"
                    step="0.01"
                    type="number"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Currency
                  <select
                    aria-label="Salary currency"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                    defaultValue={employee.salary?.currencyCode || ''}
                    name="currencyCode"
                  >
                    <option value="">Select currency</option>
                    {['INR', 'USD', 'GBP', 'EUR', 'CAD', 'AUD', 'SGD', 'AED'].map(
                      (currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Effective date
                  <input
                    aria-label="Salary effective date"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    name="effectiveFrom"
                    type="date"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Reason
                  <input
                    aria-label="Salary update reason"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                    name="reason"
                    placeholder="Optional"
                    type="text"
                  />
                </label>

                {updateError && (
                  <p className="text-sm text-red-600" role="alert">
                    {updateError}
                  </p>
                )}
                {updateSuccess && (
                  <p className="text-sm text-green-700" role="status">
                    {updateSuccess}
                  </p>
                )}

                <button
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={updating}
                  type="submit"
                >
                  {updating ? 'Updating...' : 'Update salary'}
                </button>
              </form>
              )}
            </section>
          </div>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">Salary history</h2>
                <p className="mt-1 text-sm text-slate-500">
                  History is loaded only when requested.
                </p>
              </div>
              {!includeHistory && (
                <button
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  disabled={loading}
                  onClick={loadSalaryHistory}
                  type="button"
                >
                  Load salary history
                </button>
              )}
            </div>

            {includeHistory && (
              employee.salaryHistory?.length ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Effective from</th>
                        <th className="px-4 py-3">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {employee.salaryHistory.map((record) => (
                        <tr key={record.id}>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {formatCurrency(record.amount, record.currencyCode)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {new Date(
                              record.effectiveFrom,
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {record.reason || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No salary history records.
                </p>
              )
            )}
          </section>
        </>
      ) : null}
    </div>
  )
}

export default EmployeeDetails
