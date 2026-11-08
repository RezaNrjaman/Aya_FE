/** M5-001: Customer Portal Layout — public customer-facing shell */
import { Outlet, Link, useLocation } from 'react-router-dom'
import { ShoppingBag, Store, Shield, ArrowRight } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { useCart } from '@/features/m5/CartContext'

function PortalHeaderNav() {
  const loc = useLocation()
  const { itemCount } = useCart()
  const activeCls = 'text-brand-400 font-semibold'
  const defCls = 'text-dark-300 hover:text-dark-100 transition-colors'

  return (
    <nav className="flex items-center gap-6 text-sm">
      <Link to="/catalog" className={`flex items-center gap-1.5 ${loc.pathname === '/catalog' ? activeCls : defCls}`}>
        <Store size={16} /> Katalog Produk
      </Link>
      <Link to="/cart" className={`relative flex items-center gap-1.5 ${loc.pathname === '/cart' ? activeCls : defCls}`}>
        <ShoppingBag size={16} /> Keranjang
        {itemCount > 0 && (
          <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold bg-brand-500 text-white rounded-full">
            {itemCount}
          </span>
        )}
      </Link>
    </nav>
  )
}

function PortalHeaderAuth() {
  const { user } = useAuth()
  if (user) {
    return (
      <Link to="/dashboard" className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-lg border border-brand-500/20 transition-colors">
        <Shield size={14} /> Ke Dashboard <ArrowRight size={14} />
      </Link>
    )
  }
  return (
    <Link to="/login" className="text-xs font-semibold text-dark-300 hover:text-dark-100 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-glass-border transition-colors">
      Login Staff
    </Link>
  )
}

function PortalFooter() {
  return (
    <footer className="border-t border-glass-border/40 mt-16 py-8 text-center text-xs text-dark-400">
      <div className="max-w-6xl mx-auto px-4 space-y-2">
        <p className="font-heading font-semibold text-dark-200">Araya Business Hub Platform</p>
        <p>Ekosistem B2B terpadu — Unit Usaha, Pengadaan Jasa, Transaksi & E-Commerce Terintegrasi</p>
        <p className="text-dark-500 font-mono text-[11px] pt-2">© 2026 PT Araya Hub Indonesia. All rights reserved.</p>
      </div>
    </footer>
  )
}

export function PortalLayout() {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col text-dark-100">
      <header className="sticky top-0 z-40 border-b border-glass-border/60 bg-dark-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/catalog" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center font-heading font-bold text-brand-400">A</div>
            <span className="font-heading text-base font-bold tracking-tight text-dark-100">Araya <span className="text-brand-400">Portal</span></span>
          </Link>
          <PortalHeaderNav />
          <PortalHeaderAuth />
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      <PortalFooter />
    </div>
  )
}

