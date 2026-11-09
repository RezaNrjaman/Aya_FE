/** M1: Shared helpers for access-rights screens (roles, permissions, scopes). */
import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { fetchRoles } from './api'
import { fetchActiveUnits } from '@/features/m2/api'
import type { Role } from './types'
import type { BusinessUnit } from '@/features/m2/types'
import { parseApiError } from '@/lib/api-error'

export const PERM_ROLES_READ = 'm1.roles.read'
export const PERM_ROLES_MANAGE = 'm1.roles.manage'

/** Role that always keeps access-management rights (enforced by the backend). */
export const PROTECTED_ROLE = 'admin'

export const MODULE_LABELS: Record<string, string> = {
  m1: 'M1 · Pengguna & Hak Akses',
  m2: 'M2 · Unit Usaha & Dashboard',
  m3: 'M3 · Mitra Bisnis',
  m4: 'M4 · Transaksi',
  m5: 'M5 · Portal Pelanggan',
}

export function moduleLabel(module: string): string {
  return MODULE_LABELS[module] ?? module.toUpperCase()
}

/** Returns the readable message from an API error (server message first). */
export function errorMessage(err: unknown, fallback: string): string {
  const msg = parseApiError(err).message
  return msg || fallback
}

/** Loads roles for dropdowns. Only roles the backend accepts (active) are options. */
export function useRoleOptions() {
  const { hasPermission } = useAuth()
  const canRead = hasPermission(PERM_ROLES_READ)
  const [roles, setRoles] = useState<Role[]>([])
  useEffect(() => {
    if (!canRead) return
    let alive = true
    fetchRoles().then((r) => { if (alive) setRoles(r) }).catch(() => {})
    return () => { alive = false }
  }, [canRead])
  const options = roles.filter((r) => r.is_active).map((r) => ({ value: r.name, label: `${r.display_name} (${r.name})` }))
  const labelOf = (name: string) => roles.find((r) => r.name === name)?.display_name ?? name
  return { roles, options, labelOf, canRead }
}

/** Loads active business units for the scope selector. */
export function useUnitOptions() {
  const [units, setUnits] = useState<BusinessUnit[]>([])
  useEffect(() => {
    let alive = true
    fetchActiveUnits().then((u) => { if (alive) setUnits(u ?? []) }).catch(() => {})
    return () => { alive = false }
  }, [])
  const options = [
    { value: '', label: 'Semua unit usaha (global)' },
    ...units.map((u) => ({ value: String(u.id), label: u.name })),
  ]
  const labelOf = (id?: number) => (id ? units.find((u) => u.id === id)?.name ?? `Unit #${id}` : 'Global')
  return { units, options, labelOf }
}
