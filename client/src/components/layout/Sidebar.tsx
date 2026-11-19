import {
  LayoutDashboard,
  Users,
  Wallet,
  ChartColumn,
  Settings,
} from 'lucide-react'

function Sidebar() {
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
        <div className="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-blue-600 font-medium">
          <LayoutDashboard size={20} />
          Dashboard
        </div>

        <div className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-600">
          <Users size={20} />
          Employees
        </div>

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