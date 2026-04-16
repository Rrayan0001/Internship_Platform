'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Award, Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  enrollmentId: string
  certificateStatus: string
  studentName: string
  legalName?: string
}

export default function CertificateActions({ enrollmentId, certificateStatus, studentName, legalName }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(certificateStatus)

  // suppress unused variable
  void studentName

  async function handleIssueCertificate() {
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('enrollments')
      .update({ certificate_status: 'issued', certificate_issued_at: new Date().toISOString() })
      .eq('id', enrollmentId)
    setStatus('issued')
    setLoading(false)
    router.refresh()
  }

  async function handleMarkEligible() {
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('enrollments')
      .update({ certificate_status: 'eligible' })
      .eq('id', enrollmentId)
    setStatus('eligible')
    setLoading(false)
    router.refresh()
  }

  if (status === 'issued') {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--success)] font-medium">
        <Award className="w-4 h-4" />
        Certificate Issued
        {legalName && <span className="text-[var(--foreground-subtle)] font-normal">— {legalName}</span>}
      </div>
    )
  }

  if (status === 'requested') {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-[var(--foreground-muted)] font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--brand)]" />
          Student requested certificate
          {legalName && <span className="text-[var(--foreground-subtle)] font-normal">as &quot;{legalName}&quot;</span>}
        </div>
        <button
          onClick={handleIssueCertificate}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-[var(--success)] text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
          Issue Certificate
        </button>
      </div>
    )
  }

  if (status === 'eligible') {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] font-medium">
        <CheckCircle2 className="w-4 h-4 text-[var(--brand)]" />
        Eligible — awaiting student request
      </div>
    )
  }

  return (
    <button
      onClick={handleMarkEligible}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors disabled:opacity-50"
    >
      {loading && <Loader2 className="w-3 h-3 animate-spin" />}
      Manually mark as eligible
    </button>
  )
}
