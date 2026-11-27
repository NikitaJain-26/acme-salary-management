import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import {
  EMPLOYEE_COUNTRIES,
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_DIRECTORY_SORT_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  isEmployeeStatus,
  type EmployeeDirectorySortField,
} from '../constants/employee'
import {
  getEmployees,
} from '../services/employeeApi'
import type {
  Employee,
  EmployeeListParams,
  EmployeeListResponse,
} from '../types/employee'

type DirectoryStatus = NonNullable<EmployeeListParams['status']> | ''
type DirectorySortField = EmployeeDirectorySortField

const pageSize = 10

function EmployeeDirectory() {
  const { user } = useAuth()
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
          setError('Could not load employees. Please try again.')
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
  }, [filters, page])

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
        <p className="mt-1 text-sm text-slate-500">
          Search and view your employee directory.
        </p>
      </div>

      {user?.role === 'ADMIN' && (
        <div className="mb-4 flex justify-end">
          <Link className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" to="/employees/new">
            Add employee
          </Link>
        </div>
      )}
      <form
        className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 xl:grid-cols-4"
        onSubmit={applyFilters}
      >
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Search
          <input
            aria-label="Search employees"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Name, employee number, or email"
            value={searchInput}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Country
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
            defaultValue=""
            name="country"
          >
            <option value="">All countries</option>
            {EMPLOYEE_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Department
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
            defaultValue=""
            name="department"
          >
            <option value="">All departments</option>
            {EMPLOYEE_DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Status
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
            defaultValue=""
            name="status"
          >
            <option value="">All statuses</option>
            {EMPLOYEE_STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Sort by
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
            defaultValue="createdAt"
            name="sortBy"
          >
            {EMPLOYEE_DIRECTORY_SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Direction
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
            defaultValue="desc"
            name="sortOrder"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            type="submit"
          >
            Apply filters
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Employee list</h2>
          <p aria-live="polite" className="text-sm text-slate-500">
            {result ? `${result.totalEmployees.toLocaleString()} employees` : ''}
          </p>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500" role="status">
            Loading employees...
          </p>
        ) : error ? (
          <p className="p-8 text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : employees.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No employees found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Country</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Hire date</th>
                  <th className="px-5 py-3">Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-5 py-4">
                      <Link
                        className="font-medium text-blue-700 hover:underline"
                        to={`/employees/${encodeURIComponent(employee.id)}`}
                      >
                        {employee.firstName} {employee.lastName}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {employee.employeeNumber} · {employee.email}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {employee.department}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {employee.countryCode}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          employee.status === 'ACTIVE'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(employee.hireDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {employee.salary
                        ? new Intl.NumberFormat(undefined, {
                            style: 'currency',
                            currency: employee.salary.currencyCode,
                          }).format(employee.salary.amount / 100)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-500">
            Page {result?.currentPage ?? 1} of {Math.max(totalPages, 1)}
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
              Previous
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
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDirectory
