export const EMPLOYEE_STATUSES = ['ACTIVE', 'INACTIVE'] as const
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number]

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
