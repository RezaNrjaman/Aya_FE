/** UI-005: Nav items config — permission-aware menu */
import {
  LayoutDashboard,
  Building2,
  Network,
  Users,
  Handshake,
  ShoppingCart,
  FileText,
  Receipt,
  Package,
  ClipboardList,
  Shield,
  ScrollText,
  Store,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  permission?: string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Utama',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Manajemen',
    items: [
      { label: 'Unit Usaha', path: '/business-units', icon: Building2, permission: 'm2.business_units.read' },
      { label: 'Divisi', path: '/divisions', icon: Network, permission: 'm2.divisions.read' },
      { label: 'Partner', path: '/partners', icon: Handshake, permission: 'm3.partners.read' },
      { label: 'Pengguna', path: '/users', icon: Users, permission: 'm1.users.read' },
      { label: 'Roles', path: '/roles', icon: Shield, permission: 'm1.roles.read' },
    ],
  },
  {
    title: 'Transaksi',
    items: [
      { label: 'Produk', path: '/products', icon: Package, permission: 'm4.products.read' },
      { label: 'Pelanggan', path: '/customers', icon: Users, permission: 'm4.customers.manage' },
      { label: 'Quotation', path: '/quotations', icon: FileText, permission: 'm4.quotations.manage' },
      { label: 'Invoice', path: '/invoices', icon: Receipt, permission: 'm4.invoices.manage' },
      { label: 'Order', path: '/orders', icon: ClipboardList, permission: 'm4.orders.manage' },
    ],
  },
  {
    title: 'Portal',
    items: [
      { label: 'Katalog', path: '/catalog', icon: Store },
      { label: 'Keranjang', path: '/cart', icon: ShoppingCart },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { label: 'Audit Log', path: '/audit-logs', icon: ScrollText, permission: 'm1.audit.read' },
    ],
  },
]
