import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import {
  getEmployeeDetails,
  updateEmployeeSalary,
} from '../services/employeeApi'
import type { EmployeeDetails as EmployeeDetailsData } from '../types/employee'
import DataTable, { type DataTableColumn } from '../components/ui/DataTable'
import { useTranslation } from 'react-i18next'
import type { EmployeeStatus } from '../constants/employee'

const employeeStatusTranslationKeys: Record<
  EmployeeStatus,
  'employees.active' | 'employees.inactive'
> = {
  ACTIVE: 'employees.active',
  INACTIVE: 'employees.inactive',
}
function formatCurrency(amount: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100)
}

function EmployeeDetails() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { id } = useParams()
  const [employee, setEmployee] = useState<EmployeeDetailsData | null>(null)
  const [includeHistory, setIncludeHistory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState('')
  const [updating, setUpdating] = useState(false)
  const salaryHistoryColumns: DataTableColumn<NonNullable<
    EmployeeDetailsData['salaryHistory']
  >[number]>[] = [
    {
      key: 'amount',
      header: t('employeeDetails.amount'),
      cellClassName: 'px-4 py-3 font-medium text-slate-900',
      render: (record) => formatCurrency(record.amount, record.currencyCode),
    },
    {
      key: 'effectiveFrom',
      header: t('employeeDetails.effectiveDate'),
      cellClassName: 'px-4 py-3 text-slate-600',
      render: (record) =>
        new Date(record.effectiveFrom).toLocaleDateString(),
    },
    {
      key: 'reason',
      header: t('employeeDetails.historyReason'),
      cellClassName: 'px-4 py-3 text-slate-600',
      render: (record) => record.reason || '—',
    },
  ]

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
          setError(t('employeeDetails.loadError'))
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
  }, [id, includeHistory, t])

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
      setUpdateError(t('employeeDetails.salaryValidation'))
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
      setUpdateSuccess(t('employeeDetails.salaryUpdateSuccess'))
    } catch {
      setUpdateError(t('employeeDetails.salaryUpdateError'))
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
        {t('common.backToEmployees')}
      </Link>

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500" role="status">
          {t('employeeDetails.loading')}
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
                {t('employeeDetails.information')}
              </h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-slate-500">{t('common.email')}</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {employee.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">{t('employeeDetails.jobTitle')}</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {employee.jobTitle}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">{t('common.department')}</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {employee.department}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">{t('common.country')}</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {employee.countryCode}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">{t('common.status')}</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {t(employeeStatusTranslationKeys[employee.status])}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">{t('employeeDetails.hireDate')}</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {new Date(employee.hireDate).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 font-semibold text-slate-900">
                {t('employeeDetails.currentSalary')}
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
                    {t('employeeDetails.effectiveFrom')}{' '}
                    {new Date(
                      employee.salary.effectiveFrom,
                    ).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  {t('employeeDetails.noCurrentSalary')}
                </p>
              )}

              {user?.role === 'ADMIN' && (
              <form className="mt-5 grid gap-3" onSubmit={submitSalaryUpdate}>
                <label className="text-sm font-medium text-slate-700">
                  {t('employeeDetails.amount')}
                  <input
                    aria-label={t('employeeDetails.salaryAmountAria')}
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
                  {t('employeeDetails.currency')}
                  <select
                    aria-label={t('employeeDetails.salaryCurrencyAria')}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                    defaultValue={employee.salary?.currencyCode || ''}
                    name="currencyCode"
                  >
                    <option value="">{t('employeeDetails.selectCurrency')}</option>
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
                  {t('employeeDetails.salaryEffectiveDate')}
                  <input
                    aria-label={t('employeeDetails.salaryDateAria')}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    name="effectiveFrom"
                    type="date"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  {t('employeeDetails.reason')}
                  <input
                    aria-label={t('employeeDetails.salaryReasonAria')}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                    name="reason"
                    placeholder={t('employeeDetails.optional')}
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
                  {updating ? t('employeeDetails.updatingSalary') : t('employeeDetails.updateSalary')}
                </button>
              </form>
              )}
            </section>
          </div>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">{t('employeeDetails.salaryHistory')}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t('employeeDetails.historyDescription')}
                </p>
              </div>
              {!includeHistory && (
                <button
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  disabled={loading}
                  onClick={loadSalaryHistory}
                  type="button"
                >
                  {t('employeeDetails.loadHistory')}
                </button>
              )}
            </div>

            {includeHistory && (
              employee.salaryHistory?.length ? (
                <div className="mt-4">
                  <DataTable
                    columns={salaryHistoryColumns}
                    getRowKey={(record) => record.id}
                    rows={employee.salaryHistory}
                  />
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  {t('employeeDetails.noHistory')}
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
