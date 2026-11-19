import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import Dashboard from '../pages/Dashboard'

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <Header />

        <section className="p-8">
          <Dashboard />
        </section>
      </main>
    </div>
  )
}

export default MainLayout