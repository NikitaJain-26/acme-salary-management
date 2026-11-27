import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import {
  EMPLOYEE_COUNTRIES,
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_DIRECTORY_SORT_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  isEmployeeStatus,
  type EmployeeStatus,
  type EmployeeDirectorySortField,
} from '../constants/employee'
import {
  getEmployees,
} from '../services/employeeApi'
import DataTable, { type DataTableColumn } from '../components/ui/DataTable'
import type {
  Employee,
  EmployeeListParams,
  EmployeeListResponse,
} from '../types/employee'
import { useTranslation } from 'react-i18next'

type DirectoryStatus = NonNullable<EmployeeListParams['status']> | ''
type DirectorySortField = EmployeeDirectorySortField
const employeeStatusTranslationKeys: Record<
  EmployeeStatus,
  'employees.active' | 'employees.inactive'
> = {
  ACTIVE: 'employees.active',
  INACTIVE: 'employees.inactive',
}

const pageSize = 10

function EmployeeDirectory() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [result, setResult] = useState<EmployeeListResponse | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    country: '',
    department: '',
    status: '' as DirectoryStatus,
    sortBy: 'createdAt' as DirectorySortField,
    sortOrder: 'desc' as 'asc' | 'desc',
  })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const params: EmployeeListParams = {
      page,
      limit: pageSize,
      search: filters.search || undefined,
      country: filters.country || undefined,
      department: filters.department || undefined,
      status: filters.status || undefined,
      sortBy:
        filters.sortBy === 'createdAt'
          ? undefined
          : filters.sortBy,
      sortOrder: filters.sortOrder,
    }

    getEmployees(params)
      .then((response) => {
        if (active) {
          setEmployees(response.employees)
          setResult(response)
        }
      })
      .catch(() => {
        if (active) {
          setError(t('employees.loadError'))
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
  }, [filters, page, t])

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const statusValue = String(formData.get('status') || '')
    const sortByValue = String(formData.get('sortBy') || 'createdAt')
    const sortOrderValue = String(formData.get('sortOrder') || 'desc')

    setFilters({
      search: searchInput.trim(),
      country: String(formData.get('country') || ''),
      department: String(formData.get('department') || ''),
      status: isEmployeeStatus(statusValue) ? statusValue : '',
      sortBy:
        EMPLOYEE_DIRECTORY_SORT_OPTIONS.find(
          ({ value }) => value === sortByValue,
        )?.value ?? 'createdAt',
      sortOrder: sortOrderValue === 'asc' ? 'asc' : 'desc',
    })
    setLoading(true)
    setError('')
    setPage(1)
  }

  const totalPages = result?.totalPages ?? 0
  const columns: DataTableColumn<Employee>[] = [
    {
      key: 'employee',
      header: t('employees.employee'),
      cellClassName: 'px-5 py-4',
      render: (employee) => (
        <>
          <Link
            className="font-medium text-blue-700 hover:underline"
            to={`/employees/${encodeURIComponent(employee.id)}`}
          >
            {employee.firstName} {employee.lastName}
          </Link>
          <p className="text-xs text-slate-500">
            {employee.employeeNumber} · {employee.email}
          </p>
        </>
      ),
    },
    { key: 'department', header: t('common.department'), render: (employee) => employee.department },
    { key: 'country', header: t('common.country'), render: (employee) => employee.countryCode },
    {
      key: 'status',
      header: t('common.status'),
      cellClassName: 'px-5 py-4',
      render: (employee) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            employee.status === 'ACTIVE'
              ? 'bg-green-50 text-green-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {t(employeeStatusTranslationKeys[employee.status])}
        </span>
      ),
    },
    {
      key: 'hireDate',
      header: t('employees.hireDate'),
      render: (employee) => new Date(employee.hireDate).toLocaleDateString(),
    },
    {
      key: 'salary',
      header: t('employees.salary'),
      render: (employee) =>
        employee.salary
          ? new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: employee.salary.currencyCode,
            }).format(employee.salary.amount / 100)
          : '—',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('employees.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('employees.description')}
        </p>
      </div>

      {user?.role === 'ADMIN' && (
        <div className="mb-4 flex justify-end">
          <Link className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" to="/employees/new">
            {t('employees.add')}
          </Link>
        </div>
      )}
      <form
        className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 xl:grid-cols-4"
        onSubmit={applyFilters}
      >
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          {t('employees.search')}
          <input
            aria-label={t('employees.searchAria')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t('employees.searchPlaceholder')}
            value={searchInput}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          {t('common.country')}
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
            defaultValue=""
            name="country"
          >
            <option value="">{t('employees.allCountries')}</option>
            {EMPLOYEE_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          {t('common.department')}
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
            defaultValue=""
            name="department"
          >
            <option value="">{t('employees.allDepartments')}</option>
            {EMPLOYEE_DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          {t('common.status')}
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
            defaultValue=""
            name="status"
          >
            <option value="">{t('employees.allStatuses')}</option>
            {EMPLOYEE_STATUS_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {t(employeeStatusTranslationKeys[value])}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          {t('employees.sortBy')}
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
            defaultValue="createdAt"
            name="sortBy"
          >
            {EMPLOYEE_DIRECTORY_SORT_OPTIONS.map(({ value, labelKey }) => (
              <option key={value} value={value}>
                {t(labelKey)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          {t('employees.direction')}
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
            defaultValue="desc"
            name="sortOrder"
          >
            <option value="asc">{t('employees.ascending')}</option>
            <option value="desc">{t('employees.descending')}</option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            type="submit"
          >
            {t('employees.applyFilters')}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">{t('employees.employeeList')}</h2>
          <p aria-live="polite" className="text-sm text-slate-500">
            {result ? t('employees.employeeCount', { count: result.totalEmployees }) : ''}
          </p>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500" role="status">
            {t('employees.loading')}
          </p>
        ) : error ? (
          <p className="p-8 text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : employees.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            {t('employees.empty')}
          </p>
        ) : (
          <DataTable
            columns={columns}
            getRowKey={(employee) => employee.id}
            rows={employees}
          />
        )}

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-500">
            {t('employees.page', {
              current: result?.currentPage ?? 1,
              total: Math.max(totalPages, 1),
            })}
          </p>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading || page <= 1}
              onClick={() => {
                setLoading(true)
                setPage((current) => current - 1)
              }}
              type="button"
            >
              {t('employees.previous')}
            </button>
            <button
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading || page >= totalPages}
              onClick={() => {
                setLoading(true)
                setPage((current) => current + 1)
              }}
              type="button"
            >
              {t('employees.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDirectory
