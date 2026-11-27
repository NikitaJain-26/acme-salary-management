import { useEffect, useState } from 'react'
import {
  getSalaryAnalytics,
  type SalaryAnalytics,
  type SalaryAnalyticsGroup,
} from '../services/employeeApi'

function formatCurrency(amount: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100)
}

function SalaryGroupTable({
  title,
  nameLabel,
  groups,
  nameField,
}: {
  title: string
  nameLabel: string
  groups: SalaryAnalyticsGroup[]
  nameField: 'countryCode' | 'department'
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">
          Salary comparisons stay within the same currency.
        </p>
      </div>
      {groups.length === 0 ? (
        <p className="p-5 text-sm text-slate-500">No salary records available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">{nameLabel}</th>
                <th className="px-5 py-3">Currency</th>
                <th className="px-5 py-3">Employees</th>
                <th className="px-5 py-3">Average salary</th>
                <th className="px-5 py-3">Lowest</th>
                <th className="px-5 py-3">Highest</th>
                <th className="px-5 py-3">Total payroll</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map((group) => (
                <tr key={`${group[nameField]}-${group.currencyCode}`}>
                  <td className="px-5 py-3 font-medium text-slate-900">{group[nameField]}</td>
                  <td className="px-5 py-3 text-slate-600">{group.currencyCode}</td>
                  <td className="px-5 py-3 text-slate-600">{group.employeeCount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-slate-600">{formatCurrency(group.averageSalary, group.currencyCode)}</td>
                  <td className="px-5 py-3 text-slate-600">{formatCurrency(group.lowestSalary, group.currencyCode)}</td>
                  <td className="px-5 py-3 text-slate-600">{formatCurrency(group.highestSalary, group.currencyCode)}</td>
                  <td className="px-5 py-3 text-slate-600">{formatCurrency(group.totalPayroll, group.currencyCode)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function Analytics() {
  const [analytics, setAnalytics] = useState<SalaryAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getSalaryAnalytics()
      .then(setAnalytics)
      .catch(() => setError('Could not load salary insights. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Salary insights</h1>
        <p className="mt-1 text-sm text-slate-500">
          Compare average, lowest, highest, and total payroll without combining currencies.
        </p>
      </div>

      {error && <p className="mb-5 text-sm text-red-600" role="alert">{error}</p>}
      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500" role="status">Loading salary insights...</p>
      ) : analytics ? (
        <div className="grid gap-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Organization salary ranges by currency</h2>
            {analytics.salaryByCurrency.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No salary records available.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {analytics.salaryByCurrency.map((group) => (
                  <article className="rounded-lg bg-slate-50 p-4" key={group.currencyCode}>
                    <p className="text-xs font-medium uppercase text-slate-500">{group.currencyCode}</p>
                    <dl className="mt-3 grid gap-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">Average</dt>
                        <dd className="font-medium text-slate-900">{formatCurrency(group.averageSalary, group.currencyCode)}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">Lowest</dt>
                        <dd className="font-medium text-slate-900">{formatCurrency(group.lowestSalary, group.currencyCode)}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">Highest</dt>
                        <dd className="font-medium text-slate-900">{formatCurrency(group.highestSalary, group.currencyCode)}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">Total payroll</dt>
                        <dd className="font-medium text-slate-900">{formatCurrency(group.totalPayroll, group.currencyCode)}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </section>

          <SalaryGroupTable
            groups={analytics.salaryByCountryCurrency}
            nameField="countryCode"
            nameLabel="Country"
            title="Salary by country"
          />
          <SalaryGroupTable
            groups={analytics.salaryByDepartmentCurrency}
            nameField="department"
            nameLabel="Department"
            title="Salary by department"
          />
        </div>
      ) : null}
    </div>
  )
}

export default Analytics
