/** UI-005: Route guards — private, permission-aware */
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage'

/** Redirects to /login if not authenticated */
export function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <Outlet />
}

/** Renders children only if user has required permission */
export function PermissionGate({
  permission,
  children,
  fallback,
}: {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasPermission } = useAuth()
  if (!hasPermission(permission)) return fallback ?? null
  return <>{children}</>
}


/**
 * Route-level guard: shows the Forbidden page when the user lacks the
 * permission (e.g. opening /roles directly by URL). The backend still enforces
 * every API call; this only avoids rendering screens that cannot work.
 */
export function RequirePermission({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { hasPermission } = useAuth()
  if (!hasPermission(permission)) return <ForbiddenPage />
  return <>{children}</>
}


/**
 * Explicit workspace boundary for the UI. Backend middleware remains the
 * security boundary; this prevents platform administrators from navigating
 * into tenant operational screens and vice versa.
 */
export function RequireWorkspace({
  workspace,
  children,
}: {
  workspace: 'platform' | 'partner'
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const role = user?.role?.toLowerCase() ?? ''
  const isPlatform = role === 'admin' || role === 'super_admin'

  if (workspace === 'platform' && !isPlatform) {
    return <Navigate to="/forbidden" replace />
  }
  if (workspace === 'partner' && isPlatform) {
    return <Navigate to="/forbidden" replace />
  }
  return <>{children}</>
}
