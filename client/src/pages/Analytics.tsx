import { useEffect, useState } from 'react'
import {
  getSalaryAnalytics,
} from '../services/employeeApi'
import type { SalaryAnalytics, SalaryAnalyticsGroup } from '../types/employee'
import DataTable, { type DataTableColumn } from '../components/ui/DataTable'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const columns: DataTableColumn<SalaryAnalyticsGroup>[] = [
    {
      key: 'name',
      header: nameLabel,
      render: (group) => group[nameField],
      cellClassName: 'px-5 py-3 font-medium text-slate-900',
    },
    {
      key: 'currency',
      header: t('analytics.currency'),
      render: (group) => group.currencyCode,
    },
    {
      key: 'employees',
      header: t('analytics.employees'),
      render: (group) => group.employeeCount.toLocaleString(),
    },
    {
      key: 'average',
      header: t('analytics.average'),
      render: (group) => formatCurrency(group.averageSalary, group.currencyCode),
    },
    {
      key: 'lowest',
      header: t('analytics.lowest'),
      render: (group) => formatCurrency(group.lowestSalary, group.currencyCode),
    },
    {
      key: 'highest',
      header: t('analytics.highest'),
      render: (group) => formatCurrency(group.highestSalary, group.currencyCode),
    },
    {
      key: 'payroll',
      header: t('analytics.totalPayroll'),
      render: (group) => formatCurrency(group.totalPayroll, group.currencyCode),
    },
  ]

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">
          {t('analytics.comparisonNote')}
        </p>
      </div>
      {groups.length === 0 ? (
        <p className="p-5 text-sm text-slate-500">{t('analytics.noRecords')}</p>
      ) : (
        <DataTable
          columns={columns}
          getRowKey={(group) => `${group[nameField]}-${group.currencyCode}`}
          rows={groups}
          virtualizeAfter={20}
        />
      )}
    </section>
  )
}

function Analytics() {
  const { t } = useTranslation()
  const [analytics, setAnalytics] = useState<SalaryAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setAnalytics(await getSalaryAnalytics())
      } catch {
        setError(t('analytics.loadError'))
      } finally {
        setLoading(false)
      }
    }

    void loadAnalytics()
  }, [t])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('analytics.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('analytics.description')}
        </p>
      </div>

      {error && <p className="mb-5 text-sm text-red-600" role="alert">{error}</p>}
      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500" role="status">{t('analytics.loading')}</p>
      ) : analytics ? (
        <div className="grid gap-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">{t('analytics.currencyComparisons')}</h2>
            {analytics.salaryByCurrency.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">{t('analytics.noRecords')}</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {analytics.salaryByCurrency.map((group) => (
                  <article className="rounded-lg bg-slate-50 p-4" key={group.currencyCode}>
                    <p className="text-xs font-medium uppercase text-slate-500">{group.currencyCode}</p>
                    <dl className="mt-3 grid gap-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">{t('analytics.average')}</dt>
                        <dd className="font-medium text-slate-900">{formatCurrency(group.averageSalary, group.currencyCode)}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">{t('analytics.lowest')}</dt>
                        <dd className="font-medium text-slate-900">{formatCurrency(group.lowestSalary, group.currencyCode)}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">{t('analytics.highest')}</dt>
                        <dd className="font-medium text-slate-900">{formatCurrency(group.highestSalary, group.currencyCode)}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">{t('analytics.totalPayroll')}</dt>
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
            nameLabel={t('common.country')}
            title={t('analytics.salaryByCountry')}
          />
          <SalaryGroupTable
            groups={analytics.salaryByDepartmentCurrency}
            nameField="department"
            nameLabel={t('common.department')}
            title={t('analytics.salaryByDepartment')}
          />
        </div>
      ) : null}
    </div>
  )
}

export default Analytics
