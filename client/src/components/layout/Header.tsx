import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

function Header() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const title = location.pathname.startsWith('/employees/')
    ? 'Employee details'
    : location.pathname === '/employees'
      ? 'Employees'
      : location.pathname === '/analytics'
        ? 'Analytics'
        : location.pathname === '/users'
          ? 'HR accounts'
      : location.pathname === '/account'
        ? 'My account'
      : 'Dashboard'

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
      {/* Page title */}
      <h2 className="text-lg font-semibold text-slate-800">
        {title}
      </h2>

      <div className="flex items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {user?.name.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <Link className="text-sm font-medium text-slate-800 hover:underline" to="/account">
              {user?.name}
            </Link>
            <p className="text-xs text-slate-500">
              {user?.role === 'ADMIN' ? 'Administrator' : 'Read only'}
            </p>
          </div>
          <button
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              void logout().catch(() => window.alert('Could not sign out. Please try again.'))
            }}
            type="button"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header