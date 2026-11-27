import type {
  EmployeeSortField,
  EmployeeStatus,
} from '../constants/employee.js'

export type SortOrder = 'asc' | 'desc'

export interface PaginationParams {
  page: number
  limit: number
  search?: string
  country?: string
  department?: string
  status?: string
  sortBy: EmployeeSortField | 'createdAt'
  sortOrder: SortOrder
}

export interface EmployeeCreateParams {
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  countryCode: string
  department: string
  jobTitle: string
  status: EmployeeStatus
  hireDate: Date
  salary?: {
    amount: number
    currencyCode: string
    effectiveFrom: Date
  }
}

export interface SalaryUpdateParams {
  amount: number
  currencyCode: string
  effectiveFrom: Date
  reason?: string
}
