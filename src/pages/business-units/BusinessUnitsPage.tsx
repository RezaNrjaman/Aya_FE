import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, CheckCircle, Ban } from 'lucide-react'
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
  fetchAdminUnits,
  createUnit,
  updateUnit,
  deactivateUnit,
  activateUnit,
} from '@/features/m2/api'
import type { BusinessUnit, CreateUnitData } from '@/features/m2/types'
import { UnitFormModal } from './UnitFormModal'

function useBusinessUnits() {
  const { toast } = useToast()
  const [units, setUnits] = useState<BusinessUnit[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchAdminUnits({ page, per_page: 10, search })
      setUnits(res.data)
      setTotalPages(res.meta?.total_pages ?? 1)
    } catch {
      toast('error', 'Gagal memuat data unit usaha')
    } finally {
      setLoading(false)
    }
  }, [page, search, toast])

  useEffect(() => { loadData() }, [loadData])
  return { units, loading, search, setSearch, page, setPage, totalPages, loadData }
}

function UnitActionButtons({ u, onEdit, onToggle }: { u: BusinessUnit; onEdit: (u: BusinessUnit) => void; onToggle: (u: BusinessUnit) => void }) {
  return (
    <div className="flex justify-end gap-2">
      <PermissionGate permission="m2.business_units.update">
        <Button size="sm" variant="secondary" onClick={() => onEdit(u)} title="Edit"><Edit2 size={14} /></Button>
        <Button size="sm" variant={u.is_active ? 'danger' : 'secondary'} onClick={() => onToggle(u)} title={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
          {u.is_active ? <Ban size={14} /> : <CheckCircle size={14} className="text-success" />}
        </Button>
      </PermissionGate>
    </div>
  )
}

function getUnitColumns(onEdit: (u: BusinessUnit) => void, onToggle: (u: BusinessUnit) => void) {
  return [
    {
      key: 'name', header: 'Unit Usaha',
      render: (u: BusinessUnit) => <div><p className="font-medium text-dark-100">{u.name}</p><p className="text-xs text-dark-400">{u.description || 'Unit usaha Partner'}</p></div>,
    },
    {
      key: 'status', header: 'Status',
      render: (u: BusinessUnit) => <StatusBadge label={u.is_active ? 'Aktif' : 'Nonaktif'} variant={u.is_active ? 'success' : 'neutral'} />,
    },
    {
      key: 'actions', header: 'Aksi', className: 'text-right',
      render: (u: BusinessUnit) => <UnitActionButtons u={u} onEdit={onEdit} onToggle={onToggle} />,
    },
  ]
}

function useUnitActions(reload: () => void) {
  const { toast } = useToast()
  const handleSave = async (editId: number | null, data: CreateUnitData) => {
    if (editId) { await updateUnit(editId, data); toast('success', 'Unit usaha diperbarui') }
    else { await createUnit(data); toast('success', 'Unit usaha berhasil dibuat') }
    reload()
  }
  const handleToggle = async (unit: BusinessUnit | null) => {
    if (!unit) return
    try {
      if (unit.is_active) { await deactivateUnit(unit.id); toast('success', 'Unit usaha dinonaktifkan') }
      else { await activateUnit(unit.id); toast('success', 'Unit usaha diaktifkan') }
      reload()
    } catch {
      toast('error', 'Gagal mengubah status unit usaha')
    }
  }
  return { handleSave, handleToggle }
}

interface UnitModalsProps {
  modalOpen: boolean; selectedUnit: BusinessUnit | null; setModalOpen: (v: boolean) => void; handleSave: (id: number | null, d: CreateUnitData) => Promise<void>
  toggleTarget: BusinessUnit | null; setToggleTarget: (u: BusinessUnit | null) => void; handleToggle: (u: BusinessUnit | null) => Promise<void>
}

function UnitModals({ modalOpen, selectedUnit, setModalOpen, handleSave, toggleTarget, setToggleTarget, handleToggle }: UnitModalsProps) {
  return (
    <>
      <UnitFormModal open={modalOpen} initial={selectedUnit} onClose={() => setModalOpen(false)} onSubmit={(d) => handleSave(selectedUnit?.id ?? null, d)} />
      <ConfirmDialog
        open={toggleTarget !== null}
        title={toggleTarget?.is_active ? 'Nonaktifkan Unit Usaha' : 'Aktifkan Unit Usaha'}
        message={`Apakah Anda yakin ingin ${toggleTarget?.is_active ? 'menonaktifkan' : 'mengaktifkan'} ${toggleTarget?.name}?`}
        confirmLabel={toggleTarget?.is_active ? 'Nonaktifkan' : 'Aktifkan'}
        confirmVariant={toggleTarget?.is_active ? 'danger' : 'primary'}
        onConfirm={async () => { await handleToggle(toggleTarget); setToggleTarget(null) }}
        onCancel={() => setToggleTarget(null)}
      />
    </>
  )
}

export function BusinessUnitsPage() {
  const { units, loading, search, setSearch, page, setPage, totalPages, loadData } = useBusinessUnits()
  const { handleSave, handleToggle } = useUnitActions(loadData)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<BusinessUnit | null>(null)
  const [toggleTarget, setToggleTarget] = useState<BusinessUnit | null>(null)
  const columns = getUnitColumns((u) => { setSelectedUnit(u); setModalOpen(true) }, setToggleTarget)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Unit Usaha"
        description="Kelola nama dan deskripsi unit usaha perusahaan."
        actions={<PermissionGate permission="m2.business_units.create"><Button onClick={() => { setSelectedUnit(null); setModalOpen(true) }}><Plus size={16} /> Tambah Unit Usaha</Button></PermissionGate>}
      />
      <div className="max-w-xs"><Input placeholder="Cari unit usaha..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} /></div>
      <DataTable columns={columns} data={units} keyExtractor={(u) => String(u.id)} loading={loading} emptyMessage="Belum ada unit usaha terdaftar." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <UnitModals modalOpen={modalOpen} selectedUnit={selectedUnit} setModalOpen={setModalOpen} handleSave={handleSave} toggleTarget={toggleTarget} setToggleTarget={setToggleTarget} handleToggle={handleToggle} />
    </div>
  )
}
