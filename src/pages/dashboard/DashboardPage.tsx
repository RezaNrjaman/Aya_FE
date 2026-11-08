import { useState, useEffect, useCallback } from 'react'
import { DollarSign, ShoppingBag, Users, Package, Clock } from 'lucide-react'
import { PageHeader, DataTable, StatusBadge, useToast, Select } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthContext'
import { fetchDashboardSummary, fetchActiveUnits } from '@/features/m2/api'
import type { DashboardSummary, RecentOrder, BusinessUnit } from '@/features/m2/types'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function useDashboardLoader(selectedUnit: string, onError: () => void) {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [units, setUnits] = useState<BusinessUnit[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const uId = selectedUnit ? parseInt(selectedUnit, 10) : undefined
      const [sum, active] = await Promise.all([fetchDashboardSummary({ unit_usaha_id: uId }), fetchActiveUnits().catch(() => [])])
      setData(sum); setUnits(active)
    } catch { onError() }
    finally { setLoading(false) }
  }, [selectedUnit, onError])

  useEffect(() => { load() }, [load])
  return { data, units, loading }
}

function useDashboardData() {
  const { toast } = useToast()
  const [selectedUnit, setSelectedUnit] = useState('')
  const handleError = useCallback(() => toast('error', 'Gagal memuat ringkasan dashboard'), [toast])
  const { data, units, loading } = useDashboardLoader(selectedUnit, handleError)
  return { data, units, selectedUnit, setSelectedUnit, loading }
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Total Pendapatan" value={m ? formatRupiah(m.total_revenue) : 'Rp 0'} icon={DollarSign} color="bg-emerald-500/10 text-emerald-400" />
      <StatCard label="Total Pesanan" value={m?.total_orders ?? 0} icon={ShoppingBag} color="bg-brand-500/10 text-brand-400" />
      <StatCard label="Mitra Aktif" value={m?.active_partners ?? 0} icon={Users} color="bg-indigo-500/10 text-indigo-400" />
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

export function DashboardPage() {
  const { user } = useAuth()
  const { data, units, selectedUnit, setSelectedUnit, loading } = useDashboardData()
  const unitOptions = [{ value: '', label: 'Semua Unit Usaha' }, ...units.map((u) => ({ value: String(u.id), label: u.name }))]
  const columns = getOrderColumns()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader title={`Selamat datang, ${user?.name ?? 'User'}`} description="Ringkasan operasional bisnis dan transaksi terkini" />
        <div className="w-56">
          <Select label="" value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} options={unitOptions} placeholder="Filter Unit Usaha" />
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
