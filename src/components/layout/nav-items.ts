/** UI-005: Role-aware navigation — platform and tenant workspaces stay separate. */
import {
  LayoutDashboard,
  Building2,
  Layers,
  Network,
  Users,
  Handshake,
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

const platformDashboard: NavItem = { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'm3.partners.read' }
const partnerDashboard: NavItem = { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'm2.dashboard.read' }

const platformGroups: NavGroup[] = [
  {
    title: 'Platform',
    items: [
      platformDashboard,
      { label: 'Verifikasi Partner', path: '/partners', icon: Handshake, permission: 'm3.partners.read' },
    ],
  },
]

const partnerGroups: NavGroup[] = [
  { title: 'Utama', items: [partnerDashboard] },
  {
    title: 'Manajemen',
    items: [
      { label: 'Unit Usaha', path: '/business-units', icon: Building2, permission: 'm2.business_units.read' },
      { label: 'Kategori', path: '/categories', icon: Layers, permission: 'm2.categories.read' },
      { label: 'Divisi', path: '/divisions', icon: Network, permission: 'm2.divisions.read' },
      { label: 'Role & Hak Akses', path: '/roles', icon: Shield, permission: 'm1.roles.read' },
      { label: 'Pengguna', path: '/users', icon: Users, permission: 'm1.users.read' },
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
      { label: 'Lihat Katalog Publik', path: '/catalog', icon: Store },
      { label: 'Permintaan Layanan', path: '/service-requests', icon: ClipboardList, permission: 'm5.services.manage' },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { label: 'Audit Log Perusahaan', path: '/audit-logs', icon: ScrollText, permission: 'm1.audit.read' },
    ],
  },
]

export function getNavGroups(isPlatformAdmin: boolean): NavGroup[] {
  return isPlatformAdmin ? platformGroups : partnerGroups
}
