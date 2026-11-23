import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import type { ReactNode } from 'react'

function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <Header />

        <section className="p-8">
          {children}
        </section>
      </main>
    </div>
  )
}

export default MainLayout