import type { EmployeeSortField, EmployeeStatus } from '../constants/employee'

export type { EmployeeSortField, EmployeeStatus } from '../constants/employee'

export interface EmployeeListParams {
  page?: number
  limit?: number
  search?: string
  country?: string
  department?: string
  status?: EmployeeStatus
  sortBy?: EmployeeSortField
  sortOrder?: 'asc' | 'desc'
}

export interface EmployeeSalary {
  id: string
  employeeId: string
  amount: number
  currencyCode: string
  effectiveFrom: string
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: string
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  countryCode: string
  department: string
  jobTitle: string
  status: EmployeeStatus
  hireDate: string
  createdAt: string
  updatedAt: string
  salary: EmployeeSalary | null
}

export interface SalaryHistoryRecord extends EmployeeSalary {
  reason: string | null
}

export interface EmployeeDetails extends Employee {
  salaryHistory?: SalaryHistoryRecord[]
}

export interface EmployeeListResponse {
  success: true
  employees: Employee[]
  totalEmployees: number
  currentPage: number
  totalPages: number
  pageSize: number
}

export interface EmployeeDetailsResponse {
  success: true
  employee: EmployeeDetails
}

export interface SalaryUpdateParams {
  amount: number
  currencyCode: string
  effectiveFrom: string
  reason?: string
}

export interface SalaryUpdateResponse {
  success: true
  salary: EmployeeSalary
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
  hireDate: string
  salary?: {
    amount: number
    currencyCode: string
    effectiveFrom: string
  }
}

export interface SalaryAnalyticsGroup {
  currencyCode: string
  employeeCount: number
  totalPayroll: number
  averageSalary: number
  lowestSalary: number
  highestSalary: number
  countryCode?: string
  department?: string
}

export interface SalaryAnalytics {
  summary: {
    totalEmployees: number
    salaryRecords: number
    countryCount: number
    departmentCount: number
  }
  employeesByCountry: Array<{ countryCode: string; count: number }>
  employeesByDepartment: Array<{ department: string; count: number }>
  salaryByCurrency: SalaryAnalyticsGroup[]
  salaryByCountryCurrency: SalaryAnalyticsGroup[]
  salaryByDepartmentCurrency: SalaryAnalyticsGroup[]
}
