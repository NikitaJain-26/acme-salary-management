export const EMPLOYEE_STATUSES = ['ACTIVE', 'INACTIVE'] as const
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number]

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

export function isEmployeeCountry(value: string): boolean {
  return EMPLOYEE_COUNTRIES.some(({ code }) => code === value)
}

export function isEmployeeDepartment(value: string): boolean {
  return EMPLOYEE_DEPARTMENTS.some((department) => department === value)
}

export function getEmployeeCountry(countryCode: string) {
  return EMPLOYEE_COUNTRIES.find(({ code }) => code === countryCode)
}

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
export type EmployeeSortField =
  | (typeof EMPLOYEE_SORT_FIELDS)[number]
  | 'createdAt'
