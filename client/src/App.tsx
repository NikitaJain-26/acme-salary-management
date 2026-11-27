import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { useAuth } from './auth/useAuth'
import Dashboard from './pages/Dashboard'
import EmployeeDirectory from './pages/EmployeeDirectory'
import EmployeeDetails from './pages/EmployeeDetails'
import Analytics from './pages/Analytics'
import CreateEmployee from './pages/CreateEmployee'
import Login from './pages/Login'
import MainLayout from './layouts/MainLayout'
import Users from './pages/Users'
import Account from './pages/Account'
import { useTranslation } from 'react-i18next'

function ApplicationRoutes() {
  const { user, loading } = useAuth()
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500" role="status">
        {t('app.checkingSignIn')}
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route element={<Login />} path="*" />
      </Routes>
    )
  }

  return (
    <MainLayout>
      <Routes>
        <Route element={<Dashboard />} path="/" />
        <Route element={<Analytics />} path="/analytics" />
        <Route element={<Account />} path="/account" />
        {user.role === 'ADMIN' && (
          <Route element={<CreateEmployee />} path="/employees/new" />
        )}
        <Route element={<EmployeeDetails />} path="/employees/:id" />
        <Route element={<EmployeeDirectory />} path="/employees" />
        {user.role === 'ADMIN' && (
          <Route element={<Users />} path="/users" />
        )}
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </MainLayout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ApplicationRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App