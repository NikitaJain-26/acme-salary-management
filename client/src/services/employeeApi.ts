import axios from 'axios'
import type {
  Employee,
  EmployeeCreateParams,
  EmployeeDetailsResponse,
  EmployeeListParams,
  EmployeeListResponse,
  SalaryAnalytics,
  SalaryUpdateParams,
  SalaryUpdateResponse,
} from '../types/employee'

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

export async function createEmployee(
  params: EmployeeCreateParams,
): Promise<{ success: true; employee: Employee }> {
  const response = await apiClient.post('/employees', params)
  return response.data
}

export async function getSalaryAnalytics(): Promise<SalaryAnalytics> {
  const response = await apiClient.get<SalaryAnalytics & { success: true }>(
    '/analytics',
  )
  return response.data
}

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
