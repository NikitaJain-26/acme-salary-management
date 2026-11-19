import {
  Users,
  Globe,
  Building2,
  Wallet,
} from 'lucide-react'

import StatCard from '../components/dashboard/StatCard'
import DepartmentChart from '../components/dashboard/DepartmentChart'
import CountryChart from '../components/dashboard/CountryChart'

function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard Overview
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your workforce.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Employees"
          value="10,000"
          description="Across all countries"
          icon={Users}
        />

        <StatCard
          title="Countries"
          value="8"
          description="Employee locations"
          icon={Globe}
        />

        <StatCard
          title="Departments"
          value="12"
          description="Across the organization"
          icon={Building2}
        />

        <StatCard
          title="Salary Records"
          value="10,000"
          description="Employee salary records"
          icon={Wallet}
        />
      </div>
    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
  <DepartmentChart />
  <CountryChart />
</div>
    </div>
  )
}

export default Dashboard