import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Button, Input, DataTable, Pagination, useToast } from '@/components/ui'
import { PermissionGate } from '@/features/auth/RouteGuard'
import { fetchCustomers, createCustomer } from '@/features/m4/api'
import type { Customer } from '@/features/m4/types'
import { CustomerFormModal } from './CustomerFormModal'

function useCustomers() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchCustomers({ page, per_page: 10, search })
      setCustomers(res.data); setTotalPages(res.meta?.total_pages ?? 1)
    } catch { toast('error', 'Gagal memuat pelanggan') }
    finally { setLoading(false) }
  }, [page, search, toast])

  useEffect(() => { loadData() }, [loadData])
  return { customers, loading, search, setSearch, page, setPage, totalPages, loadData }
}

function getCustomerColumns() {
  return [
    { key: 'name', header: 'Nama Pelanggan', render: (c: Customer) => <span className="font-medium text-dark-100">{c.name}</span> },
    { key: 'email', header: 'Email', render: (c: Customer) => <span className="text-xs text-dark-300">{c.email}</span> },
    { key: 'phone', header: 'Telepon', render: (c: Customer) => <span className="text-xs text-dark-400">{c.phone || '—'}</span> },
    { key: 'address', header: 'Alamat', render: (c: Customer) => <span className="text-xs text-dark-400 truncate max-w-xs block">{c.address || '—'}</span> },
  ]
}

export function CustomersPage() {
  const { toast } = useToast()
  const { customers, loading, search, setSearch, page, setPage, totalPages, loadData } = useCustomers()
  const [modalOpen, setModalOpen] = useState(false)
  const columns = getCustomerColumns()

  const handleCreate = async (d: { name: string; email: string; phone?: string; address?: string }) => {
    await createCustomer(d); toast('success', 'Pelanggan berhasil ditambahkan'); loadData()
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Daftar Pelanggan"
        description="Basis data klien dan kontak penagihan transaksi"
        actions={<PermissionGate permission="m4.customers.manage"><Button onClick={() => setModalOpen(true)}><Plus size={16} /> Tambah Pelanggan</Button></PermissionGate>}
      />
      <div className="max-w-xs"><Input placeholder="Cari pelanggan..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} /></div>
      <DataTable columns={columns} data={customers} keyExtractor={(c) => String(c.id)} loading={loading} emptyMessage="Belum ada data pelanggan." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <CustomerFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
    </div>
  )
}
