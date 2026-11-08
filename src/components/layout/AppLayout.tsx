/** UI-002: App Layout — navbar + sidebar + content container */
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-[56px] lg:pl-[240px]">
        <div className="mx-auto max-w-[1280px] p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

