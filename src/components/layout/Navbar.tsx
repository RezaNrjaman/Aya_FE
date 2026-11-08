/** UI-002: App Navbar — height 56px, glass panel */
import { useState } from 'react'
import { Menu, LogOut, User, KeyRound } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { ChangePasswordModal } from '@/features/auth/ChangePasswordModal'

interface NavbarProps {
  onToggleSidebar: () => void
}

function NavBrand({ onToggle }: { onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onToggle} className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition">
        <Menu size={20} />
      </button>
      <h1 className="font-heading text-lg font-bold text-brand-400">Araya Hub</h1>
    </div>
  )
}

function NavActions({ onOpenPwd }: { onOpenPwd: () => void }) {
  const { user, logout } = useAuth()
  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-2 text-sm text-dark-300">
        <User size={16} />
        <span>{user?.name ?? 'User'}</span>
      </div>
      <button onClick={onOpenPwd} className="p-2 rounded-lg hover:bg-white/10 transition text-dark-400 hover:text-dark-100" title="Ubah Password">
        <KeyRound size={16} />
      </button>
      <button onClick={logout} className="p-2 rounded-lg hover:bg-white/10 transition text-dark-400 hover:text-danger" title="Keluar">
        <LogOut size={18} />
      </button>
    </div>
  )
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const [pwdOpen, setPwdOpen] = useState(false)
  return (
    <>
      <header className="glass-panel fixed top-0 left-0 right-0 z-50 flex h-[56px] items-center justify-between px-4 lg:px-6">
        <NavBrand onToggle={onToggleSidebar} />
        <NavActions onOpenPwd={() => setPwdOpen(true)} />
      </header>
      <ChangePasswordModal open={pwdOpen} onClose={() => setPwdOpen(false)} />
    </>
  )
}
