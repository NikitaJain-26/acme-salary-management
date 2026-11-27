import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext, type AuthContextValue } from '../auth/context'
import '../i18n'
import EmployeeDirectory from './EmployeeDirectory'
import {
  getEmployees,
} from '../services/employeeApi'
import type { EmployeeListResponse } from '../types/employee'

jest.mock('../services/employeeApi', () => ({
  getEmployees: jest.fn(),
}))

const mockedGetEmployees = jest.mocked(getEmployees)
const authValue: AuthContextValue = {
  user: {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
  },
  loading: false,
  error: '',
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
}

function renderEmployeeDirectory() {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <EmployeeDirectory />
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

const employeesResponse: EmployeeListResponse = {
  success: true,
  employees: [
    {
      id: 'employee-1',
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
    },
  ],
  totalEmployees: 1,
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
}

afterEach(() => {
  mockedGetEmployees.mockReset()
})

describe('EmployeeDirectory', () => {
  it('loads and displays employees from the API', async () => {
    mockedGetEmployees.mockResolvedValue(employeesResponse)

    renderEmployeeDirectory()

    expect(await screen.findByText('Priya Sharma')).toBeTruthy()
    expect(mockedGetEmployees).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    )
  })

  it('sends search and selected filters to the API', async () => {
    mockedGetEmployees.mockResolvedValue(employeesResponse)

    renderEmployeeDirectory()
    await screen.findByText('Priya Sharma')

    fireEvent.change(screen.getByLabelText('Search employees'), {
      target: { value: 'Sharma' },
    })
    fireEvent.change(screen.getByLabelText('Country'), {
      target: { value: 'IN' },
    })
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'ACTIVE' },
    })
    fireEvent.change(screen.getByLabelText('Department'), {
      target: { value: 'Engineering' },
    })
    fireEvent.change(screen.getByLabelText('Sort by'), {
      target: { value: 'lastName' },
    })
    fireEvent.change(screen.getByLabelText('Direction'), {
      target: { value: 'asc' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }))

    await waitFor(() => {
      expect(mockedGetEmployees).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: 'Sharma',
          country: 'IN',
          department: 'Engineering',
          status: 'ACTIVE',
          sortBy: 'lastName',
          sortOrder: 'asc',
          page: 1,
          limit: 10,
        }),
      )
    })

  })

  it('requests the next server-side page', async () => {
    mockedGetEmployees.mockResolvedValue({
      ...employeesResponse,
      totalEmployees: 11,
      totalPages: 2,
    })

    renderEmployeeDirectory()
    await screen.findByText('Priya Sharma')
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() => {
      expect(mockedGetEmployees).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2, limit: 10 }),
      )
    })
  })

  it('shows an error when the API request fails', async () => {
    mockedGetEmployees.mockRejectedValue(new Error('API unavailable'))

    renderEmployeeDirectory()

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not load employees. Please try again.',
    )
  })
})
