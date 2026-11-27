export const EMPLOYEE_STATUSES = ['ACTIVE', 'INACTIVE'] as const
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number]

export const EMPLOYEE_STATUS_OPTIONS = [
  'ACTIVE',
  'INACTIVE',
] as const satisfies readonly EmployeeStatus[]

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
  { value: 'createdAt', labelKey: 'employees.sortRecentlyAdded' },
  { value: 'firstName', labelKey: 'employees.sortFirstName' },
  { value: 'lastName', labelKey: 'employees.sortLastName' },
  { value: 'employeeNumber', labelKey: 'employees.sortEmployeeNumber' },
  { value: 'countryCode', labelKey: 'employees.sortCountry' },
  { value: 'department', labelKey: 'employees.sortDepartment' },
  { value: 'status', labelKey: 'employees.sortStatus' },
  { value: 'hireDate', labelKey: 'employees.sortHireDate' },
  { value: 'salaryAmount', labelKey: 'employees.sortSalary' },
] as const satisfies readonly {
  value: EmployeeSortField | 'createdAt'
  labelKey: string
}[]
export type EmployeeDirectorySortField =
  (typeof EMPLOYEE_DIRECTORY_SORT_OPTIONS)[number]['value']
