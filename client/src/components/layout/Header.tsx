import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { useTranslation } from 'react-i18next'

function Header() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const title = location.pathname.startsWith('/employees/')
    ? t('navigation.employeeDetails')
    : location.pathname === '/employees'
      ? t('navigation.employees')
      : location.pathname === '/analytics'
        ? t('navigation.analytics')
        : location.pathname === '/users'
          ? t('navigation.hrAccounts')
      : location.pathname === '/account'
        ? t('navigation.myAccount')
      : t('navigation.dashboard')

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
              {user?.role === 'ADMIN' ? t('common.administrator') : t('navigation.readOnly')}
            </p>
          </div>
          <button
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              void logout().catch(() => window.alert(t('navigation.signOutError')))
            }}
            type="button"
          >
            {t('navigation.signOut')}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header