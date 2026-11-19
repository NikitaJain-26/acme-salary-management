import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <Header />

        {/* Page content */}
        <section className="p-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome to ACME
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your employees and salary information in one place.
          </p>
        </section>
      </main>
    </div>
  )
}

export default MainLayout