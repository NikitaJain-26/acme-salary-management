import { Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'

function Header() {
  const location = useLocation()
  const title = location.pathname === '/employees' ? 'Employees' : 'Dashboard'

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
      {/* Page title */}
      <h2 className="text-lg font-semibold text-slate-800">
        {title}
      </h2>

      {/* Right section */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <button className="text-slate-500 hover:text-slate-800">
          <Search size={20} />
        </button>

        {/* Notifications */}
        <button className="relative text-slate-500 hover:text-slate-800">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
            HR
          </div>

          <div>
            <p className="text-sm font-medium text-slate-800">
              HR Manager
            </p>
            <p className="text-xs text-slate-500">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header