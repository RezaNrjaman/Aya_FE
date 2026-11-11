/** UI-005 & M5-001: Application Router — public customer portal + private app */
import type { ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout, AuthLayout, PortalLayout } from '@/components/layout'
import { PrivateRoute, RequirePermission, RequireWorkspace } from '@/features/auth/RouteGuard'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { RolesPage } from '@/pages/roles/RolesPage'
import { BusinessUnitsPage } from '@/pages/business-units/BusinessUnitsPage'
import { CategoriesPage } from '@/pages/categories/CategoriesPage'
import { DivisionsPage } from '@/pages/divisions/DivisionsPage'
import { PartnersPage } from '@/pages/partners/PartnersPage'
import { ProductsPage } from '@/pages/products/ProductsPage'
import { CustomersPage } from '@/pages/customers/CustomersPage'
import { QuotationsPage } from '@/pages/quotations/QuotationsPage'
import { InvoicesPage } from '@/pages/invoices/InvoicesPage'
import { OrdersPage } from '@/pages/orders/OrdersPage'
import { CatalogPage } from '@/pages/catalog/CatalogPage'
import { CartPage } from '@/pages/cart/CartPage'
import { TrackOrderPage } from '@/pages/track-order/TrackOrderPage'
import { PublicPartnerRegisterPage } from '@/pages/partners/PublicPartnerRegisterPage'
import { PublicPartnerStatusPage } from '@/pages/partners/PublicPartnerStatusPage'
import { AuditLogsPage } from '@/pages/audit-logs/AuditLogsPage'
import { ServiceRequestsPage } from '@/pages/service-requests/ServiceRequestsPage'
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage'
import { NotFoundPage } from '@/pages/errors/NotFoundPage'

/** Wraps a page so direct URL access respects the same permission as the menu. */
function guard(permission: string, page: ReactNode) {
  return <RequirePermission permission={permission}>{page}</RequirePermission>
}

function partnerPage(permission: string, page: ReactNode) {
  return <RequireWorkspace workspace="partner">{guard(permission, page)}</RequireWorkspace>
}

function platformPage(permission: string, page: ReactNode) {
  return <RequireWorkspace workspace="platform">{guard(permission, page)}</RequireWorkspace>
}

export const router = createBrowserRouter([
  /* Public: Customer Portal Shell */
  {
    element: <PortalLayout />,
    children: [
      { path: '/', element: <Navigate to="/catalog" replace /> },
      { path: '/catalog', element: <CatalogPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/track-order', element: <TrackOrderPage /> },
      { path: '/partner/register', element: <PublicPartnerRegisterPage /> },
      { path: '/partner/status', element: <PublicPartnerStatusPage /> },
    ],
  },
  /* Public: Authentication */
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  /* Private: Internal Management Platform */
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          /* M1 */
          { path: '/users', element: partnerPage('m1.users.read', <UsersPage />) },
          { path: '/roles', element: partnerPage('m1.roles.read', <RolesPage />) },
          /* M2 */
          { path: '/business-units', element: partnerPage('m2.business_units.read', <BusinessUnitsPage />) },
          { path: '/categories', element: partnerPage('m2.categories.read', <CategoriesPage />) },
          { path: '/divisions', element: partnerPage('m2.divisions.read', <DivisionsPage />) },
          /* M3 */
          { path: '/partners', element: platformPage('m3.partners.read', <PartnersPage />) },
          /* M4 */
          { path: '/products', element: partnerPage('m4.products.read', <ProductsPage />) },
          { path: '/customers', element: partnerPage('m4.customers.manage', <CustomersPage />) },
          { path: '/quotations', element: partnerPage('m4.quotations.manage', <QuotationsPage />) },
          { path: '/invoices', element: partnerPage('m4.invoices.manage', <InvoicesPage />) },
          { path: '/orders', element: partnerPage('m4.orders.manage', <OrdersPage />) },
          { path: '/service-requests', element: partnerPage('m5.services.manage', <ServiceRequestsPage />) },
          /* System */
          { path: '/audit-logs', element: partnerPage('m1.audit.read', <AuditLogsPage />) },
          { path: '/forbidden', element: <ForbiddenPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
  /* Fallback */
  { path: '*', element: <Navigate to="/catalog" replace /> },
])
