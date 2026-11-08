/** UI-002: Auth layout — login page without sidebar/navbar */
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8">
        <Outlet />
      </div>
    </div>
  )
}

