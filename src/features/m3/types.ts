/** M3: Partner Management types */

export type PartnerStatus = 'pending' | 'terverifikasi' | 'ditolak' | 'ditangguhkan'

export interface Partner {
  id: number
  user_id?: number
  company_name: string
  contact_person: string
  email: string
  phone: string
  address?: string
  status: PartnerStatus
  registration_code?: string
  rejection_reason?: string
  suspension_reason?: string
  verified_at?: string
  verified_by?: string
  created_at: string
  updated_at: string
}

export interface StatusHistory {
  id: number
  partner_id: number
  from_status: string
  to_status: string
  reason?: string
  changed_by?: string
  created_at: string
}

export interface PartnerDetail {
  partner: Partner
  histories: StatusHistory[]
}

export interface RegisterPartnerData {
  company_name: string
  contact_person: string
  email: string
  phone: string
  address?: string
}

/** Minimal public status payload, addressed by registration code (ARY-002). */
export interface PublicPartnerStatus {
  partner_id: number
  company_name: string
  status: PartnerStatus
  rejection_reason?: string
  suspension_reason?: string
  /** Only present while the account has never been activated. */
  activation_token?: string
}

export interface ActivateAccountData {
  token: string
  password: string
}

