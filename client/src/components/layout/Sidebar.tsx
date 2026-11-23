import {
  LayoutDashboard,
  Users,
  Wallet,
  ChartColumn,
  Settings,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

function Sidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 ${
      isActive
        ? 'bg-blue-50 font-medium text-blue-600'
        : 'text-slate-600 hover:bg-slate-50'
    }`

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 p-5">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-blue-600">
          ACME
        </h1>
        <p className="text-xs text-slate-500">
          Salary Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        <NavLink className={linkClass} to="/">
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink className={linkClass} to="/employees">
          <Users size={20} />
          Employees
        </NavLink>

        <div className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-600">
          <Wallet size={20} />
          Salary Management
        </div>

        <div className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-600">
          <ChartColumn size={20} />
          Analytics
        </div>

        <div className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-600">
          <Settings size={20} />
          Settings
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar