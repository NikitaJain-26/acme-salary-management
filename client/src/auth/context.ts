import { createContext } from 'react'


export type UserRole = 'ADMIN' | 'VIEWER'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  error: string
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
