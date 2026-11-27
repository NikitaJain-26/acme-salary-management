import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  EMPLOYEE_STATUS_OPTIONS,
  isEmployeeStatus,
  type EmployeeStatus,
} from '../constants/employee'
import { createEmployee } from '../services/employeeApi'
import { useTranslation } from 'react-i18next'
import { useEmployeeOptions } from '../hooks/useEmployeeOptions'

const employeeStatusTranslationKeys: Record<
  EmployeeStatus,
  'employees.active' | 'employees.inactive'
> = {
  ACTIVE: 'employees.active',
  INACTIVE: 'employees.inactive',
}

function CreateEmployee() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const {
    options,
    loading: optionsLoading,
    error: optionsError,
  } = useEmployeeOptions()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const salaryValue = String(formData.get('salary') || '')
    const statusValue = formData.get('status')
    const country = options?.countries.find(
      ({ code }) => code === formData.get('countryCode'),
    )

    if (!country) {
      setError(
        options
          ? t('createEmployee.countryError')
          : t('createEmployee.optionsLoadError'),
      )
      return
    }

    if (
      salaryValue &&
      (!Number.isFinite(Number(salaryValue)) || Number(salaryValue) <= 0)
    ) {
      setError(t('createEmployee.salaryError'))
      return
    }

    setSaving(true)
    setError('')

    try {
      const { employee } = await createEmployee({
        employeeNumber: String(formData.get('employeeNumber') || ''),
        firstName: String(formData.get('firstName') || ''),
        lastName: String(formData.get('lastName') || ''),
        email: String(formData.get('email') || ''),
        countryCode: country.code,
        department: String(formData.get('department') || ''),
        jobTitle: String(formData.get('jobTitle') || ''),
        status: isEmployeeStatus(statusValue) ? statusValue : 'ACTIVE',
        hireDate: String(formData.get('hireDate') || ''),
        ...(salaryValue
          ? {
              salary: {
                amount: Math.round(Number(salaryValue) * 100),
                currencyCode: country.currency,
                effectiveFrom: String(formData.get('effectiveFrom') || ''),
              },
            }
          : {}),
      })
      navigate(`/employees/${encodeURIComponent(employee.id)}`)
    } catch (requestError) {
      const message =
        typeof requestError === 'object' &&
        requestError !== null &&
        'response' in requestError &&
        requestError.response &&
        typeof requestError.response === 'object' &&
        'data' in requestError.response &&
        requestError.response.data &&
        typeof requestError.response.data === 'object' &&
        'message' in requestError.response.data
          ? String(requestError.response.data.message)
          : t('createEmployee.createError')
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Link className="mb-5 inline-block text-sm font-medium text-blue-700 hover:underline" to="/employees">
        {t('common.backToEmployees')}
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('createEmployee.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('createEmployee.description')}
        </p>
      </div>

      <form className="grid gap-6" onSubmit={submit}>
        <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            {t('createEmployee.employeeNumber')}
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" maxLength={32} name="employeeNumber" required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t('common.email')}
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" name="email" required type="email" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t('createEmployee.firstName')}
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" maxLength={100} name="firstName" required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t('createEmployee.lastName')}
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" maxLength={100} name="lastName" required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t('common.country')}
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" defaultValue="" disabled={!options} name="countryCode" required>
              <option disabled value="">{t('createEmployee.selectCountry')}</option>
              {options?.countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t('common.department')}
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" defaultValue="" disabled={!options} name="department" required>
              <option disabled value="">{t('createEmployee.selectDepartment')}</option>
              {options?.departments.map((department) => <option key={department}>{department}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t('createEmployee.jobTitle')}
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" maxLength={100} name="jobTitle" required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t('createEmployee.hireDate')}
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" name="hireDate" required type="date" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t('createEmployee.employmentStatus')}
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" name="status">
              {EMPLOYEE_STATUS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {t(employeeStatusTranslationKeys[value])}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="font-semibold text-slate-900">{t('createEmployee.initialSalary')}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t('createEmployee.salaryNote')}
            </p>
          </div>
          <label className="text-sm font-medium text-slate-700">
            {t('createEmployee.annualSalary')}
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" min="0.01" name="salary" placeholder={t('createEmployee.salaryPlaceholder')} step="0.01" type="number" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t('createEmployee.salaryEffectiveDate')}
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" defaultValue={new Date().toISOString().slice(0, 10)} name="effectiveFrom" type="date" />
          </label>
        </section>

        {optionsLoading && (
          <p className="text-sm text-slate-500" role="status">
            {t('createEmployee.optionsLoading')}
          </p>
        )}
        {optionsError && (
          <p className="text-sm text-red-600" role="alert">
            {t('createEmployee.optionsLoadError')}
          </p>
        )}
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex gap-3">
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50" disabled={saving || optionsLoading || !options} type="submit">
            {saving ? t('common.saving') : t('createEmployee.create')}
          </button>
          <Link className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50" to="/employees">
            {t('common.cancel')}
          </Link>
        </div>
      </form>
    </div>
  )
}

export default CreateEmployee
