/** UI-002: Sidebar — width 240px desktop, drawer on mobile */
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/features/auth/AuthContext'
import { NAV_GROUPS, type NavGroup, type NavItem } from './nav-items'

function SidebarMobileHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 lg:hidden">
      <span className="font-heading text-sm font-semibold text-dark-300">Menu</span>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
        <X size={18} />
      </button>
    </div>
  )
}

function SidebarLink({ item, onClose }: { item: NavItem; onClose: () => void }) {
  return (
    <NavLink
      to={item.path}
      onClick={onClose}
      className={({ isActive }) => clsx(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
        isActive
          ? 'bg-brand-600/20 text-brand-400 font-medium'
          : 'text-dark-300 hover:bg-white/5 hover:text-dark-100',
      )}
    >
      <item.icon size={18} />
      <span>{item.label}</span>
    </NavLink>
  )
}

function NavGroupSection({
  group,
  onClose,
}: {
  group: NavGroup
  onClose: () => void
}) {
  const { hasPermission } = useAuth()
  const visible = group.items.filter(
    (item) => !item.permission || hasPermission(item.permission),
  )
  if (visible.length === 0) return null
  return (
    <div>
      <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-dark-500">
        {group.title}
      </p>
      {visible.map((item) => (
        <SidebarLink key={item.path} item={item} onClose={onClose} />
      ))}
    </div>
  )
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside className={clsx(
        'fixed top-[56px] left-0 z-40 h-[calc(100vh-56px)] w-[240px] glass-panel overflow-y-auto transition-transform duration-200',
        'lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>
        <SidebarMobileHeader onClose={onClose} />
        <nav className="px-3 pb-6 space-y-5">
          {NAV_GROUPS.map((g) => <NavGroupSection key={g.title} group={g} onClose={onClose} />)}
        </nav>
      </aside>
    </>
  )
}
