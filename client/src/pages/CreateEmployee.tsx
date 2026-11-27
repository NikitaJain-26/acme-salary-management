import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createEmployee } from '../services/employeeApi'

const departments = [
  'Engineering',
  'Human Resources',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Customer Support',
  'Legal',
  'Product',
  'Data & Analytics',
  'IT',
  'Administration',
]

const countries = [
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'SG', name: 'Singapore', currency: 'SGD' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED' },
]

function CreateEmployee() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const salaryValue = String(formData.get('salary') || '')
    const country = countries.find(
      ({ code }) => code === formData.get('countryCode'),
    )

    if (!country) {
      setError('Select a valid country.')
      return
    }

    if (
      salaryValue &&
      (!Number.isFinite(Number(salaryValue)) || Number(salaryValue) <= 0)
    ) {
      setError('Initial salary must be a positive amount.')
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
        status: formData.get('status') === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
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
          : 'Could not create employee. Please check the details and try again.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Link className="mb-5 inline-block text-sm font-medium text-blue-700 hover:underline" to="/employees">
        Back to employees
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Add employee</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add employee details and, optionally, their initial salary record.
        </p>
      </div>

      <form className="grid gap-6" onSubmit={submit}>
        <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Employee number
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" maxLength={32} name="employeeNumber" required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Email
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" name="email" required type="email" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            First name
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" maxLength={100} name="firstName" required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Last name
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" maxLength={100} name="lastName" required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Country
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" defaultValue="" name="countryCode" required>
              <option disabled value="">Select country</option>
              {countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Department
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" defaultValue="" name="department" required>
              <option disabled value="">Select department</option>
              {departments.map((department) => <option key={department}>{department}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Job title
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" maxLength={100} name="jobTitle" required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Hire date
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" name="hireDate" required type="date" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Employment status
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" name="status">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>
        </section>

        <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="font-semibold text-slate-900">Initial salary (optional)</h2>
            <p className="mt-1 text-sm text-slate-500">
              Currency follows the selected country. Salary history is created automatically.
            </p>
          </div>
          <label className="text-sm font-medium text-slate-700">
            Annual salary
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" min="0.01" name="salary" placeholder="Leave blank to add later" step="0.01" type="number" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Salary effective date
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" defaultValue={new Date().toISOString().slice(0, 10)} name="effectiveFrom" type="date" />
          </label>
        </section>

        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex gap-3">
          <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50" disabled={saving} type="submit">
            {saving ? 'Saving...' : 'Create employee'}
          </button>
          <Link className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50" to="/employees">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

export default CreateEmployee
