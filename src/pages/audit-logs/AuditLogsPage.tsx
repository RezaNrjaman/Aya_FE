import { useState, useEffect, useCallback } from 'react'
import { Eye } from 'lucide-react'
import { PageHeader, DataTable, Pagination, Button, StatusBadge, useToast } from '@/components/ui'
import { fetchAuditLogs } from '@/features/m1/api'
import type { AuditLog } from '@/features/m1/types'
import { AuditDetailModal } from './AuditDetailModal'

function useAuditLogs() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchAuditLogs({ page, per_page: 15 })
      setLogs(res.data)
      setTotalPages(res.meta?.total_pages ?? 1)
    } catch {
      toast('error', 'Gagal memuat riwayat audit log')
    } finally {
      setLoading(false)
    }
  }, [page, toast])

  useEffect(() => { loadData() }, [loadData])
  return { logs, loading, page, setPage, totalPages }
}

function getBaseColumns() {
  return [
    {
      key: 'created_at',
      header: 'Waktu',
      render: (l: AuditLog) => (
        <span className="text-xs text-dark-300 font-mono">{new Date(l.created_at).toLocaleString('id-ID')}</span>
      ),
    },
    { key: 'actor', header: 'Aktor', render: (l: AuditLog) => <span className="text-xs font-medium text-dark-200">{l.user_name || 'Sistem'}</span> },
    { key: 'action', header: 'Aksi', render: (l: AuditLog) => <StatusBadge label={l.action} variant="info" /> },
    {
      key: 'target',
      header: 'Target Objek',
      render: (l: AuditLog) => <span className="text-xs text-dark-400 font-mono">{l.entity_type} #{l.entity_id || '—'}</span>,
    },
  ]
}

function getAuditColumns(onSelect: (l: AuditLog) => void) {
  const base = getBaseColumns()
  const actionCol = {
    key: 'actions',
    header: 'Detail',
    className: 'text-right',
    render: (l: AuditLog) => (
      <Button size="sm" variant="secondary" onClick={() => onSelect(l)} title="Lihat Detail">
        <Eye size={14} />
      </Button>
    ),
  }
  return [...base, actionCol]
}

export function AuditLogsPage() {
  const { logs, loading, page, setPage, totalPages } = useAuditLogs()
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const columns = getAuditColumns(setSelectedLog)

  return (
    <div className="space-y-4">
      <PageHeader title="Audit Log Sistem" description="Pelacakan menyeluruh atas setiap aksi dan otorisasi" />
      <DataTable columns={columns} data={logs} keyExtractor={(l) => String(l.id)} loading={loading} emptyMessage="Belum ada catatan aktivitas sistem." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  )
}
