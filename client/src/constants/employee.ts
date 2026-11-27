export const EMPLOYEE_STATUSES = ['ACTIVE', 'INACTIVE'] as const
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number]

export const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
] as const satisfies readonly { value: EmployeeStatus; label: string }[]

export function isEmployeeStatus(value: unknown): value is EmployeeStatus {
  return EMPLOYEE_STATUSES.some((status) => status === value)
}

export const EMPLOYEE_SORT_FIELDS = [
  'firstName',
  'lastName',
  'employeeNumber',
  'countryCode',
  'department',
  'status',
  'hireDate',
  'salaryAmount',
] as const
export type EmployeeSortField = (typeof EMPLOYEE_SORT_FIELDS)[number]

export const EMPLOYEE_DIRECTORY_SORT_OPTIONS = [
  { value: 'createdAt', label: 'Recently added' },
  { value: 'firstName', label: 'First name' },
  { value: 'lastName', label: 'Last name' },
  { value: 'employeeNumber', label: 'Employee number' },
  { value: 'countryCode', label: 'Country' },
  { value: 'department', label: 'Department' },
  { value: 'status', label: 'Status' },
  { value: 'hireDate', label: 'Hire date' },
  { value: 'salaryAmount', label: 'Salary' },
] as const satisfies readonly {
  value: EmployeeSortField | 'createdAt'
  label: string
}[]
export type EmployeeDirectorySortField =
  (typeof EMPLOYEE_DIRECTORY_SORT_OPTIONS)[number]['value']

export const EMPLOYEE_DEPARTMENTS = [
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
] as const

export const EMPLOYEE_COUNTRIES = [
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'SG', name: 'Singapore', currency: 'SGD' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED' },
] as const

export type EmployeeCountry = (typeof EMPLOYEE_COUNTRIES)[number]
export type EmployeeCountryCode = EmployeeCountry['code']
