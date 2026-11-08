import { useState, useEffect, useCallback } from 'react'
import { Plus, Eye, CheckCircle2, AlertOctagon, RotateCcw } from 'lucide-react'
import {
  PageHeader,
  Button,
  Input,
  DataTable,
  StatusBadge,
  Pagination,
  ConfirmDialog,
  useToast,
} from '@/components/ui'
import { PermissionGate } from '@/features/auth/RouteGuard'
import {
  fetchPartners,
  registerPartner,
  verifyPartner,
  suspendPartner,
  reactivatePartner,
} from '@/features/m3/api'
import type { Partner, RegisterPartnerData } from '@/features/m3/types'
import { PartnerRegisterModal } from './PartnerRegisterModal'
import { PartnerVerifyModal } from './PartnerVerifyModal'
import { PartnerSuspendModal } from './PartnerSuspendModal'
import { PartnerDetailModal } from './PartnerDetailModal'

function usePartners() {
  const { toast } = useToast()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchPartners({ page, per_page: 10, search, status: status || undefined })
      setPartners(res.data); setTotalPages(res.meta?.total_pages ?? 1)
    } catch { toast('error', 'Gagal memuat data mitra') }
    finally { setLoading(false) }
  }, [page, search, status, toast])

  useEffect(() => { loadData() }, [loadData])
  return { partners, loading, search, setSearch, status, setStatus, page, setPage, totalPages, loadData }
}

function getBadgeVariant(status: string) {
  if (status === 'terverifikasi') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'ditangguhkan') return 'danger'
  return 'neutral'
}

interface ActionHandlers {
  onDetail: (p: Partner) => void
  onVerify: (p: Partner) => void
  onSuspend: (p: Partner) => void
  onReactivate: (p: Partner) => void
}

function PartnerActions({ p, h }: { p: Partner; h: ActionHandlers }) {
  return (
    <div className="flex justify-end gap-1.5">
      <Button size="sm" variant="secondary" onClick={() => h.onDetail(p)} title="Detail"><Eye size={14} /></Button>
      {p.status === 'pending' && (
        <PermissionGate permission="m3.partners.verify">
          <Button size="sm" variant="primary" onClick={() => h.onVerify(p)} title="Verifikasi"><CheckCircle2 size={14} /></Button>
        </PermissionGate>
      )}
      {p.status === 'terverifikasi' && (
        <PermissionGate permission="m3.partners.suspend">
          <Button size="sm" variant="danger" onClick={() => h.onSuspend(p)} title="Tangguhkan"><AlertOctagon size={14} /></Button>
        </PermissionGate>
      )}
      {p.status === 'ditangguhkan' && (
        <PermissionGate permission="m3.partners.suspend">
          <Button size="sm" variant="secondary" onClick={() => h.onReactivate(p)} title="Aktifkan Kembali"><RotateCcw size={14} /></Button>
        </PermissionGate>
      )}
    </div>
  )
}

function getPartnerColumns(h: ActionHandlers) {
  return [
    {
      key: 'company', header: 'Perusahaan & Kontak',
      render: (p: Partner) => <div><p className="font-medium text-dark-100">{p.company_name}</p><p className="text-xs text-dark-400">PIC: {p.contact_person}</p></div>,
    },
    {
      key: 'contact', header: 'Email & Telepon',
      render: (p: Partner) => <div className="text-xs text-dark-300"><p>{p.email}</p><p className="text-dark-500">{p.phone}</p></div>,
    },
    {
      key: 'status', header: 'Status',
      render: (p: Partner) => <StatusBadge label={p.status.toUpperCase()} variant={getBadgeVariant(p.status)} />,
    },
    {
      key: 'actions', header: 'Aksi', className: 'text-right',
      render: (p: Partner) => <PartnerActions p={p} h={h} />,
    },
  ]
}

function StatusTabs({ current, onChange }: { current: string; onChange: (s: string) => void }) {
  const tabs = [
    { key: '', label: 'Semua' }, { key: 'pending', label: 'Pending' },
    { key: 'terverifikasi', label: 'Terverifikasi' }, { key: 'ditangguhkan', label: 'Ditangguhkan' },
    { key: 'ditolak', label: 'Ditolak' },
  ]
  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {tabs.map((t) => (
        <button
          key={t.key} onClick={() => onChange(t.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${current === t.key ? 'bg-brand-600 text-white' : 'glass-input text-dark-300 hover:text-dark-100'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function usePartnerActions(reload: () => void) {
  const { toast } = useToast()
  const handleRegister = async (d: RegisterPartnerData) => {
    await registerPartner(d); toast('success', 'Pendaftaran mitra berhasil diajukan'); reload()
  }
  const handleVerify = async (id: number, act: 'approve' | 'reject', r?: string) => {
    await verifyPartner(id, act, r)
    toast('success', act === 'approve' ? 'Mitra berhasil disetujui' : 'Pendaftaran mitra ditolak')
    reload()
  }
  const handleSuspend = async (id: number, r: string) => {
    await suspendPartner(id, r); toast('success', 'Mitra berhasil ditangguhkan'); reload()
  }
  const handleReactivate = async (id: number) => {
    await reactivatePartner(id); toast('success', 'Mitra berhasil diaktifkan kembali'); reload()
  }
  return { handleRegister, handleVerify, handleSuspend, handleReactivate }
}

interface ModalsState {
  regOpen: boolean; setRegOpen: (v: boolean) => void
  detailP: Partner | null; setDetailP: (p: Partner | null) => void
  verifyP: Partner | null; setVerifyP: (p: Partner | null) => void
  suspendP: Partner | null; setSuspendP: (p: Partner | null) => void
  reactivateP: Partner | null; setReactivateP: (p: Partner | null) => void
}

function PartnerModals({ s, a }: { s: ModalsState; a: ReturnType<typeof usePartnerActions> }) {
  return (
    <>
      <PartnerRegisterModal open={s.regOpen} onClose={() => s.setRegOpen(false)} onSubmit={a.handleRegister} />
      <PartnerDetailModal partner={s.detailP} onClose={() => s.setDetailP(null)} />
      <PartnerVerifyModal partner={s.verifyP} onClose={() => s.setVerifyP(null)} onVerify={a.handleVerify} />
      <PartnerSuspendModal partner={s.suspendP} onClose={() => s.setSuspendP(null)} onSuspend={a.handleSuspend} />
      <ConfirmDialog
        open={s.reactivateP !== null}
        title="Aktifkan Kembali Mitra"
        message={`Apakah Anda yakin ingin mengaktifkan kembali mitra ${s.reactivateP?.company_name}?`}
        confirmLabel="Aktifkan"
        onConfirm={async () => { if (s.reactivateP) await a.handleReactivate(s.reactivateP.id); s.setReactivateP(null) }}
        onCancel={() => s.setReactivateP(null)}
      />
    </>
  )
}

function PartnerToolbar({ status, onStatus, search, onSearch }: { status: string; onStatus: (s: string) => void; search: string; onSearch: (q: string) => void }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <StatusTabs current={status} onChange={onStatus} />
      <div className="w-full sm:w-64"><Input placeholder="Cari nama atau email..." value={search} onChange={(e) => onSearch(e.target.value)} /></div>
    </div>
  )
}

export function PartnersPage() {
  const { partners, loading, search, setSearch, status, setStatus, page, setPage, totalPages, loadData } = usePartners()
  const actions = usePartnerActions(loadData)
  const [regOpen, setRegOpen] = useState(false)
  const [detailP, setDetailP] = useState<Partner | null>(null)
  const [verifyP, setVerifyP] = useState<Partner | null>(null)
  const [suspendP, setSuspendP] = useState<Partner | null>(null)
  const [reactivateP, setReactivateP] = useState<Partner | null>(null)
  const columns = getPartnerColumns({ onDetail: setDetailP, onVerify: setVerifyP, onSuspend: setSuspendP, onReactivate: setReactivateP })

  return (
    <div className="space-y-4">
      <PageHeader title="Manajemen Mitra Bisnis" description="Kelola pendaftaran, verifikasi, dan status aktif mitra" actions={<Button onClick={() => setRegOpen(true)}><Plus size={16} /> Daftar Mitra Baru</Button>} />
      <PartnerToolbar status={status} onStatus={(s) => { setStatus(s); setPage(1) }} search={search} onSearch={(q) => { setSearch(q); setPage(1) }} />
      <DataTable columns={columns} data={partners} keyExtractor={(p) => String(p.id)} loading={loading} emptyMessage="Belum ada data mitra." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <PartnerModals s={{ regOpen, setRegOpen, detailP, setDetailP, verifyP, setVerifyP, suspendP, setSuspendP, reactivateP, setReactivateP }} a={actions} />
    </div>
  )
}
