import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { getEmployeeOptions } from '../services/employeeApi'
import type { EmployeeOptionsResponse } from '../types/employee'
import { useEmployeeOptions } from './useEmployeeOptions'

jest.mock('../services/employeeApi', () => ({
  getEmployeeOptions: jest.fn(),
}))

const mockedGetEmployeeOptions = jest.mocked(getEmployeeOptions)
const options: EmployeeOptionsResponse = {
  success: true,
  departments: ['Engineering', 'Finance'],
  countries: [{ code: 'IN', name: 'India', currency: 'INR' }],
}

afterEach(() => {
  mockedGetEmployeeOptions.mockReset()
})

describe('useEmployeeOptions', () => {
  it('starts in a loading state and exposes options after a successful request', async () => {
    mockedGetEmployeeOptions.mockResolvedValue(options)

    const { result } = renderHook(() => useEmployeeOptions())

    expect(result.current).toEqual({
      options: null,
      loading: true,
      error: false,
    })

    await waitFor(() => {
      expect(result.current).toEqual({
        options,
        loading: false,
        error: false,
      })
    })
    expect(mockedGetEmployeeOptions).toHaveBeenCalledTimes(1)
  })

  it('sets the error state and finishes loading when the request fails', async () => {
    mockedGetEmployeeOptions.mockRejectedValue(new Error('API unavailable'))

    const { result } = renderHook(() => useEmployeeOptions())

    await waitFor(() => {
      expect(result.current).toEqual({
        options: null,
        loading: false,
        error: true,
      })
    })
  })

  it('does not update state when the request resolves after unmount', async () => {
    let resolveOptions: (value: EmployeeOptionsResponse) => void = () => {}
    mockedGetEmployeeOptions.mockReturnValue(
      new Promise((resolve) => {
        resolveOptions = resolve
      }),
    )

    const { unmount } = renderHook(() => useEmployeeOptions())
    unmount()

    await act(async () => {
      resolveOptions(options)
    })

    expect(mockedGetEmployeeOptions).toHaveBeenCalledTimes(1)
  })
})
