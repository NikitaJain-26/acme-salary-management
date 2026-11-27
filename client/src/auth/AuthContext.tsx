import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { apiClient } from '../services/employeeApi'
import { AuthContext, type AuthUser } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refreshUser() {
    try {
      const response = await apiClient.get<{ user: AuthUser }>('/auth/me')
      setUser(response.data.user)
      setError('')
    } catch (requestError) {
      setUser(null)
      if (
        typeof requestError === 'object' &&
        requestError !== null &&
        'response' in requestError &&
        requestError.response &&
        typeof requestError.response === 'object' &&
        'status' in requestError.response &&
        requestError.response.status === 401
      ) {
        setError('')
        return
      }
      setError('Unable to connect to the authentication service.')
    }
  }

  useEffect(() => {
    let active = true
    apiClient.get<{ user: AuthUser }>('/auth/me')
      .then(({ data }) => {
        if (active) {
          setUser(data.user)
          setError('')
        }
      })
      .catch((requestError: unknown) => {
        if (!active) {
          return
        }
        setUser(null)
        if (
          typeof requestError === 'object' &&
          requestError !== null &&
          'response' in requestError &&
          requestError.response &&
          typeof requestError.response === 'object' &&
          'status' in requestError.response &&
          requestError.response.status === 401
        ) {
          setError('')
        } else {
          setError('Unable to connect to the authentication service.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  async function login(email: string, password: string) {
    const response = await apiClient.post<{ user: AuthUser }>('/auth/login', {
      email,
      password,
    })
    setUser(response.data.user)
    setError('')
  }

  async function logout() {
    await apiClient.post('/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}
