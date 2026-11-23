import { AxiosHeaders, type AxiosAdapter } from 'axios'
import {
  afterEach,
  describe,
  expect,
  it,
} from '@jest/globals'
import {
  apiClient,
  getEmployeeDetails,
  getEmployees,
  type EmployeeDetailsResponse,
  type EmployeeListParams,
  type EmployeeListResponse,
} from './employeeApi'
import type { InternalAxiosRequestConfig } from 'axios'

const originalAdapter = apiClient.defaults.adapter
let capturedConfig: InternalAxiosRequestConfig | undefined

const response: EmployeeListResponse = {
  success: true,
  employees: [],
  totalEmployees: 0,
  currentPage: 1,
  totalPages: 0,
  pageSize: 5,
}

const employeeDetailsResponse: EmployeeDetailsResponse = {
  success: true,
  employee: {
    id: 'employee/1',
    employeeNumber: 'EMP00001',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@acme.com',
    countryCode: 'IN',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    status: 'ACTIVE',
    hireDate: '2022-01-15T00:00:00.000Z',
    createdAt: '2022-01-15T00:00:00.000Z',
    updatedAt: '2022-01-15T00:00:00.000Z',
    salary: null,
    salaryHistory: [],
  },
}

afterEach(() => {
  apiClient.defaults.adapter = originalAdapter
  capturedConfig = undefined
})

describe('getEmployees', () => {
  it('sends search, filters, sorting, and pagination to the API', async () => {
    const params: EmployeeListParams = {
      page: 2,
      limit: 5,
      search: 'sharma',
      country: 'IN',
      department: 'Engineering',
      status: 'ACTIVE',
      sortBy: 'lastName',
      sortOrder: 'asc',
    }

    const adapter: AxiosAdapter = async (config) => {
      capturedConfig = config
      return {
        data: response,
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config,
      }
    }
    apiClient.defaults.adapter = adapter

    await expect(getEmployees(params)).resolves.toEqual(response)

    expect(capturedConfig?.url).toBe('/employees')
    expect(capturedConfig?.params).toEqual(params)
  })

  it('surfaces request failures to the caller', async () => {
    const adapter: AxiosAdapter = async () => {
      throw new Error('API unavailable')
    }
    apiClient.defaults.adapter = adapter

    await expect(getEmployees()).rejects.toThrow('API unavailable')
  })

  it('requests employee details with optional salary history', async () => {
    let requestUrl: string | undefined
    let requestParams: unknown
    const adapter: AxiosAdapter = async (config) => {
      requestUrl = config.url
      requestParams = config.params

      return {
        data: employeeDetailsResponse,
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config,
      }
    }
    apiClient.defaults.adapter = adapter

    await expect(getEmployeeDetails('employee/1', true)).resolves.toEqual(
      employeeDetailsResponse,
    )

    expect(requestUrl).toBe('/employees/employee%2F1')
    expect(requestParams).toEqual({ includeHistory: true })
  })
})
