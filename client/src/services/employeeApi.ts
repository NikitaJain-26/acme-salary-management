import axios from 'axios'

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE'

export type EmployeeSortField =
  | 'firstName'
  | 'lastName'
  | 'employeeNumber'
  | 'countryCode'
  | 'department'
  | 'status'
  | 'hireDate'

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

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

export async function getEmployees(
  params: EmployeeListParams = {},
): Promise<EmployeeListResponse> {
  const response = await apiClient.get<EmployeeListResponse>('/employees', {
    params,
  })

  return response.data
}

export async function updateEmployeeSalary(
  id: string,
  params: SalaryUpdateParams,
): Promise<SalaryUpdateResponse> {
  const response = await apiClient.put<SalaryUpdateResponse>(
    `/employees/${encodeURIComponent(id)}/salary`,
    params,
  )

  return response.data
}

export async function getEmployeeDetails(
  id: string,
  includeHistory = false,
): Promise<EmployeeDetailsResponse> {
  const response = await apiClient.get<EmployeeDetailsResponse>(
    `/employees/${encodeURIComponent(id)}`,
    {
      params: { includeHistory },
    },
  )

  return response.data
}
