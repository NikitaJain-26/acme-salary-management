import { AxiosHeaders, type AxiosAdapter } from 'axios'
import {
  afterEach,
  describe,
  expect,
  it,
} from '@jest/globals'
import {
  apiClient,
  getEmployees,
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
})
