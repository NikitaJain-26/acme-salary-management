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
import { useTranslation } from 'react-i18next'

function Dashboard() {
  const { t } = useTranslation()
  const [analytics, setAnalytics] = useState<SalaryAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getSalaryAnalytics()
      .then(setAnalytics)
      .catch(() => setError(t('dashboard.loadError')))
      .finally(() => setLoading(false))
  }, [t])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('dashboard.title')}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {t('dashboard.description')}
        </p>
      </div>

      {error && <p className="mb-5 text-sm text-red-600" role="alert">{error}</p>}
      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500" role="status">{t('dashboard.loading')}</p>
      ) : analytics ? (
        <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t('dashboard.totalEmployees')}
          value={analytics.summary.totalEmployees.toLocaleString()}
          description={t('dashboard.acrossAllCountries')}
          icon={Users}
        />

        <StatCard
          title={t('dashboard.countries')}
          value={analytics.summary.countryCount.toLocaleString()}
          description={t('dashboard.employeeLocations')}
          icon={Globe}
        />

        <StatCard
          title={t('dashboard.departments')}
          value={analytics.summary.departmentCount.toLocaleString()}
          description={t('dashboard.organizationWide')}
          icon={Building2}
        />

        <StatCard
          title={t('dashboard.salaryRecords')}
          value={analytics.summary.salaryRecords.toLocaleString()}
          description={t('dashboard.employeesWithSalaryRecords')}
          icon={Wallet}
        />
      </div>
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <DepartmentChart data={analytics.employeesByDepartment} />
            <CountryChart data={analytics.employeesByCountry} />
          </div>
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">{t('dashboard.payrollByCurrency')}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t('dashboard.currencyNote')}
            </p>
            {analytics.salaryByCurrency.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">{t('analytics.noRecords')}</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-3">
                {analytics.salaryByCurrency.map((group) => (
                  <div className="min-w-52 rounded-lg bg-slate-50 p-4" key={group.currencyCode}>
                    <p className="text-xs font-medium uppercase text-slate-500">{group.currencyCode}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {new Intl.NumberFormat(undefined, { style: 'currency', currency: group.currencyCode }).format(group.totalPayroll / 100)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{t('dashboard.salaryRecordCount', { count: group.employeeCount })}</p>
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