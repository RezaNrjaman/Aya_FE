/** UI-005 & M5-001: Application Router — public customer portal + private app */
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout, AuthLayout, PortalLayout } from '@/components/layout'
import { PrivateRoute } from '@/features/auth/RouteGuard'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { RolesPage } from '@/pages/roles/RolesPage'
import { BusinessUnitsPage } from '@/pages/business-units/BusinessUnitsPage'
import { PartnersPage } from '@/pages/partners/PartnersPage'
import { ProductsPage } from '@/pages/products/ProductsPage'
import { CustomersPage } from '@/pages/customers/CustomersPage'
import { QuotationsPage } from '@/pages/quotations/QuotationsPage'
import { InvoicesPage } from '@/pages/invoices/InvoicesPage'
import { OrdersPage } from '@/pages/orders/OrdersPage'
import { CatalogPage } from '@/pages/catalog/CatalogPage'
import { CartPage } from '@/pages/cart/CartPage'
import { PublicPartnerRegisterPage } from '@/pages/partners/PublicPartnerRegisterPage'
import { PublicPartnerStatusPage } from '@/pages/partners/PublicPartnerStatusPage'
import { AuditLogsPage } from '@/pages/audit-logs/AuditLogsPage'
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage'
import { NotFoundPage } from '@/pages/errors/NotFoundPage'

export const router = createBrowserRouter([
  /* Public: Customer Portal Shell */
  {
    element: <PortalLayout />,
    children: [
      { path: '/', element: <Navigate to="/catalog" replace /> },
      { path: '/catalog', element: <CatalogPage /> },
      { path: '/cart', element: <CartPage /> },
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
          { path: '/users', element: <UsersPage /> },
          { path: '/roles', element: <RolesPage /> },
          /* M2 */
          { path: '/business-units', element: <BusinessUnitsPage /> },
          /* M3 */
          { path: '/partners', element: <PartnersPage /> },
          /* M4 */
          { path: '/products', element: <ProductsPage /> },
          { path: '/customers', element: <CustomersPage /> },
          { path: '/quotations', element: <QuotationsPage /> },
          { path: '/invoices', element: <InvoicesPage /> },
          { path: '/orders', element: <OrdersPage /> },
          /* System */
          { path: '/audit-logs', element: <AuditLogsPage /> },
          { path: '/forbidden', element: <ForbiddenPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
  /* Fallback */
  { path: '*', element: <Navigate to="/catalog" replace /> },
])
