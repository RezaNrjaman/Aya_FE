import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, ShoppingBag, Users, Package, Clock, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react'
import { PageHeader, DataTable, StatusBadge, useToast, Select, Input } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthContext'
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage'
import { fetchDashboardSummary, fetchAdminUnits } from '@/features/m2/api'
import { fetchPartners } from '@/features/m3/api'
import type { DashboardSummary, RecentOrder, BusinessUnit } from '@/features/m2/types'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function useDashboardLoader(selectedUnit: string, periodFrom: string, periodTo: string, onError: () => void) {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [units, setUnits] = useState<BusinessUnit[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const uId = selectedUnit ? parseInt(selectedUnit, 10) : undefined
      const [sum, active] = await Promise.all([
        fetchDashboardSummary({ unit_usaha_id: uId, from: periodFrom || undefined, to: periodTo || undefined }),
        fetchAdminUnits({ page: 1, per_page: 100, active_only: true })
          .then((res) => Array.isArray(res?.data) ? res.data : [])
          .catch(() => []),
      ])
      setData(sum); setUnits(active)
    } catch { onError() }
    finally { setLoading(false) }
  }, [selectedUnit, periodFrom, periodTo, onError])

  useEffect(() => { load() }, [load])
  return { data, units, loading }
}

function useDashboardData() {
  const { toast } = useToast()
  const [selectedUnit, setSelectedUnit] = useState('')
  const [periodFrom, setPeriodFrom] = useState('')
  const [periodTo, setPeriodTo] = useState('')
  const handleError = useCallback(() => toast('error', 'Gagal memuat ringkasan dashboard'), [toast])
  const { data, units, loading } = useDashboardLoader(selectedUnit, periodFrom, periodTo, handleError)
  return { data, units, selectedUnit, setSelectedUnit, periodFrom, setPeriodFrom, periodTo, setPeriodTo, loading }
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }) {
  return (
    <div className="glass-card p-4 flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs text-dark-500 uppercase tracking-wider">{label}</p>
        <p className="font-heading text-xl font-bold text-dark-100">{value}</p>
      </div>
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon size={20} />
      </div>
    </div>
  )
}

function MetricGrid({ data }: { data: DashboardSummary | null }) {
  const m = data?.metrics
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatCard label="Total Pendapatan" value={m ? formatRupiah(m.total_revenue) : 'Rp 0'} icon={DollarSign} color="bg-emerald-500/10 text-emerald-400" />
      <StatCard label="Total Pesanan" value={m?.total_orders ?? 0} icon={ShoppingBag} color="bg-brand-500/10 text-brand-400" />
      <StatCard label="Produk Aktif" value={m?.active_products ?? 0} icon={Package} color="bg-amber-500/10 text-amber-400" />
    </div>
  )
}

function getOrderColumns() {
  return [
    { key: 'order_no', header: 'No. Order', render: (o: RecentOrder) => <span className="font-mono text-xs text-brand-400 font-semibold">{o.order_no}</span> },
    { key: 'unit_name', header: 'Unit Usaha', render: (o: RecentOrder) => <span className="text-xs text-dark-200">{o.unit_name}</span> },
    { key: 'total_amount', header: 'Total Nilai', render: (o: RecentOrder) => <span className="text-xs font-semibold text-dark-100">{formatRupiah(o.total_amount)}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (o: RecentOrder) => {
        const v = o.status === 'selesai' ? 'success' : o.status === 'diproses' ? 'info' : 'warning'
        return <StatusBadge label={o.status.toUpperCase()} variant={v} />
      },
    },
    { key: 'created_at', header: 'Waktu', render: (o: RecentOrder) => <span className="text-xs text-dark-400 font-mono">{new Date(o.created_at).toLocaleString('id-ID')}</span> },
  ]
}

function PartnerDashboardPage() {
  const { user } = useAuth()
  const {
    data, units, selectedUnit, setSelectedUnit, periodFrom, setPeriodFrom,
    periodTo, setPeriodTo, loading,
  } = useDashboardData()
  const safeUnits = Array.isArray(units) ? units : []
  const unitOptions = [{ value: '', label: 'Semua Unit Usaha' }, ...safeUnits.map((u) => ({ value: String(u.id), label: u.name }))]
  const columns = getOrderColumns()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader title={`Selamat datang, ${user?.name ?? 'User'}`} description="Ringkasan operasional bisnis dan transaksi terkini" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:max-w-3xl">
          <Select label="Unit Usaha" value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} options={unitOptions} placeholder="Filter Unit Usaha" />
          <Input type="date" label="Dari Tanggal" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
          <Input type="date" label="Sampai Tanggal" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
        </div>
      </div>
      <MetricGrid data={data} />
      <div className="space-y-3">
        <h3 className="font-heading text-base font-semibold text-dark-100 flex items-center gap-2">
          <Clock size={16} className="text-brand-400" /> Pesanan & Transaksi Terkini
        </h3>
        <DataTable columns={columns} data={data?.recent_orders ?? []} keyExtractor={(o) => o.order_no} loading={loading} emptyMessage="Belum ada transaksi pada periode ini." />
      </div>
    </div>
  )
}


interface PlatformPartnerMetrics {
  total: number
  pending: number
  verified: number
  suspended: number
}

function usePlatformPartnerMetrics() {
  const { toast } = useToast()
  const [metrics, setMetrics] = useState<PlatformPartnerMetrics>({ total: 0, pending: 0, verified: 0, suspended: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const [all, pending, verified, suspended] = await Promise.all([
          fetchPartners({ page: 1, per_page: 1 }),
          fetchPartners({ page: 1, per_page: 1, status: 'pending' }),
          fetchPartners({ page: 1, per_page: 1, status: 'terverifikasi' }),
          fetchPartners({ page: 1, per_page: 1, status: 'ditangguhkan' }),
        ])
        if (alive) setMetrics({
          total: all.meta?.total ?? 0,
          pending: pending.meta?.total ?? 0,
          verified: verified.meta?.total ?? 0,
          suspended: suspended.meta?.total ?? 0,
        })
      } catch {
        if (alive) toast('error', 'Gagal memuat ringkasan Partner')
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => { alive = false }
  }, [toast])

  return { metrics, loading }
}

function PlatformDashboardPage() {
  const { metrics, loading } = usePlatformPartnerMetrics()
  const cards = [
    { label: 'Total Partner', value: metrics.total, icon: Users, color: 'bg-brand-500/10 text-brand-400' },
    { label: 'Menunggu Verifikasi', value: metrics.pending, icon: Clock, color: 'bg-amber-500/10 text-amber-400' },
    { label: 'Terverifikasi', value: metrics.verified, icon: ShieldCheck, color: 'bg-emerald-500/10 text-emerald-400' },
    { label: 'Ditangguhkan', value: metrics.suspended, icon: AlertTriangle, color: 'bg-rose-500/10 text-rose-400' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Platform" description="Ringkasan pendaftaran dan status Partner Araya Business Hub." />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-dark-500 uppercase tracking-wider">{label}</p>
              <p className="font-heading text-xl font-bold text-dark-100">{loading ? '…' : value}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${color}`}><Icon size={20} /></div>
          </div>
        ))}
      </div>
      <Link to="/partners" className="glass-card p-5 flex items-center justify-between gap-3 hover:border-brand-500/40 transition">
        <div>
          <h3 className="font-heading font-semibold text-dark-100">Kelola Verifikasi Partner</h3>
          <p className="text-xs text-dark-400 mt-1">Periksa pengajuan baru, alasan penolakan, dan status penangguhan.</p>
        </div>
        <ArrowRight size={18} className="text-brand-400 shrink-0" />
      </Link>
    </div>
  )
}

export function DashboardPage() {
  const { user, hasPermission } = useAuth()
  if (user?.role === 'admin' || user?.role === 'super_admin') {
    return hasPermission('m3.partners.read') ? <PlatformDashboardPage /> : <ForbiddenPage />
  }
  return hasPermission('m2.dashboard.read') ? <PartnerDashboardPage /> : <ForbiddenPage />
}
