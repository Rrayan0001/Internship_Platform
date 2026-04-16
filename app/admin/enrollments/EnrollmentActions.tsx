'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function EnrollmentActions({ enrollmentId }: { enrollmentId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  async function handle(action: 'approved' | 'rejected') {
    setLoading(action === 'approved' ? 'approve' : 'reject')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('enrollments')
      .update({
        status: action,
        ...(action === 'approved' ? { approved_at: new Date().toISOString() } : {}),
      })
      .eq('id', enrollmentId)
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handle('approved')}
        disabled={!!loading}
        className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
      >
        {loading === 'approve' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
        Approve
      </button>
      <button
        onClick={() => handle('rejected')}
        disabled={!!loading}
        className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
      >
        {loading === 'reject' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
        Reject
      </button>
    </div>
  )
}
