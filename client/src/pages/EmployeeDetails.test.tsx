import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import EmployeeDetails from './EmployeeDetails'
import {
  getEmployeeDetails,
  type EmployeeDetailsResponse,
} from '../services/employeeApi'

jest.mock('../services/employeeApi', () => ({
  getEmployeeDetails: jest.fn(),
}))

const mockedGetEmployeeDetails = jest.mocked(getEmployeeDetails)

const employeeResponse: EmployeeDetailsResponse = {
  success: true,
  employee: {
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
    salary: {
      id: 'salary-1',
      employeeId: 'employee-1',
      amount: 8000000,
      currencyCode: 'INR',
      effectiveFrom: '2022-01-15T00:00:00.000Z',
      createdAt: '2022-01-15T00:00:00.000Z',
      updatedAt: '2022-01-15T00:00:00.000Z',
    },
  },
}

function renderEmployeeDetails() {
  return render(
    <MemoryRouter initialEntries={['/employees/employee-1']}>
      <Routes>
        <Route
          element={<EmployeeDetails />}
          path="/employees/:id"
        />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  mockedGetEmployeeDetails.mockReset()
})

describe('EmployeeDetails', () => {
  it('loads employee information and current salary without history by default', async () => {
    mockedGetEmployeeDetails.mockResolvedValue(employeeResponse)

    renderEmployeeDetails()

    expect(await screen.findByText('Priya Sharma')).toBeTruthy()
    expect(screen.getByText('Current salary')).toBeTruthy()
    expect(mockedGetEmployeeDetails).toHaveBeenCalledWith(
      'employee-1',
      false,
    )
    expect(screen.queryByText('Annual adjustment')).toBeNull()
  })

  it('requests and displays salary history only when requested', async () => {
    mockedGetEmployeeDetails.mockImplementation(async (_id, includeHistory) => ({
      ...employeeResponse,
      employee: {
        ...employeeResponse.employee,
        salaryHistory: includeHistory
          ? [
              {
                id: 'history-1',
                employeeId: 'employee-1',
                amount: 7500000,
                currencyCode: 'INR',
                effectiveFrom: '2021-01-15T00:00:00.000Z',
                createdAt: '2021-01-15T00:00:00.000Z',
                updatedAt: '2021-01-15T00:00:00.000Z',
                reason: 'Annual adjustment',
              },
            ]
          : undefined,
      },
    }))

    renderEmployeeDetails()
    await screen.findByText('Priya Sharma')
    fireEvent.click(screen.getByRole('button', { name: 'Load salary history' }))

    expect(await screen.findByText('Annual adjustment')).toBeTruthy()
    await waitFor(() => {
      expect(mockedGetEmployeeDetails).toHaveBeenLastCalledWith(
        'employee-1',
        true,
      )
    })
  })

  it('shows an error when the employee details request fails', async () => {
    mockedGetEmployeeDetails.mockRejectedValue(new Error('Not found'))

    renderEmployeeDetails()

    expect(await screen.findByRole('alert')).toBeTruthy()
  })
})
