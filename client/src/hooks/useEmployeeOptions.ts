import { useEffect, useState } from 'react'
import { getEmployeeOptions } from '../services/employeeApi'
import type { EmployeeOptionsResponse } from '../types/employee'

export function useEmployeeOptions() {
  const [options, setOptions] = useState<EmployeeOptionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    async function loadOptions() {
      try {
        const response = await getEmployeeOptions()
        if (active) {
          setOptions(response)
          setError(false)
        }
      } catch {
        if (active) {
          setError(true)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadOptions()

    return () => {
      active = false
    }
  }, [])

  return { options, loading, error }
}
