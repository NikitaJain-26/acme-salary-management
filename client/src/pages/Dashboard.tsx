import { useEffect, useState } from 'react'
import {
  Users,
  Globe,
  Building2,
  Wallet,
} from 'lucide-react'

import StatCard from '../components/dashboard/StatCard'
import DepartmentChart from '../components/dashboard/DepartmentChart'
import CountryChart from '../components/dashboard/CountryChart'
import { getSalaryAnalytics } from '../services/employeeApi'
import type { SalaryAnalytics } from '../types/employee'

function Dashboard() {
  const [analytics, setAnalytics] = useState<SalaryAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getSalaryAnalytics()
      .then(setAnalytics)
      .catch(() => setError('Could not load dashboard data. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard Overview
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your workforce.
        </p>
      </div>

      {error && <p className="mb-5 text-sm text-red-600" role="alert">{error}</p>}
      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500" role="status">Loading dashboard...</p>
      ) : analytics ? (
        <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={analytics.summary.totalEmployees.toLocaleString()}
          description="Across all countries"
          icon={Users}
        />

        <StatCard
          title="Countries"
          value={analytics.summary.countryCount.toLocaleString()}
          description="Employee locations"
          icon={Globe}
        />

        <StatCard
          title="Departments"
          value={analytics.summary.departmentCount.toLocaleString()}
          description="Across the organization"
          icon={Building2}
        />

        <StatCard
          title="Salary Records"
          value={analytics.summary.salaryRecords.toLocaleString()}
          description="Employees with salary records"
          icon={Wallet}
        />
      </div>
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <DepartmentChart data={analytics.employeesByDepartment} />
            <CountryChart data={analytics.employeesByCountry} />
          </div>
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Payroll by currency</h2>
            <p className="mt-1 text-sm text-slate-500">
              Totals are shown separately in each currency; no currency conversion is applied.
            </p>
            {analytics.salaryByCurrency.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No salary records available.</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-3">
                {analytics.salaryByCurrency.map((group) => (
                  <div className="min-w-52 rounded-lg bg-slate-50 p-4" key={group.currencyCode}>
                    <p className="text-xs font-medium uppercase text-slate-500">{group.currencyCode}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {new Intl.NumberFormat(undefined, { style: 'currency', currency: group.currencyCode }).format(group.totalPayroll / 100)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{group.employeeCount.toLocaleString()} salary records</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  )
}

export default Dashboard