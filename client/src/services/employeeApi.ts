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

export interface EmployeeListResponse {
  success: true
  employees: Employee[]
  totalEmployees: number
  currentPage: number
  totalPages: number
  pageSize: number
}

export const apiClient = axios.create({
  baseURL: '/api',
})

export async function getEmployees(
  params: EmployeeListParams = {},
): Promise<EmployeeListResponse> {
  const response = await apiClient.get<EmployeeListResponse>('/employees', {
    params,
  })

  return response.data
}
