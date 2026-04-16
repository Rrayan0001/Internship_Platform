'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Enrollment } from '@/lib/supabase/types'
import { User } from '@supabase/supabase-js'

interface EnrolButtonProps {
  courseId: string
  enrollment: Enrollment | null
  user: User | null
}

export default function EnrolButton({ courseId, enrollment, user }: EnrolButtonProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [localEnrollment, setLocalEnrollment] = useState(enrollment)

  async function handleEnrol() {
    if (!user) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('enrollments')
      .insert({ user_id: user.id, course_id: courseId, status: 'pending', certificate_status: 'not_eligible' })
      .select()
      .single()

    if (!error && data) {
      setLocalEnrollment(data)
    }
    setLoading(false)
  }

  if (localEnrollment?.status === 'approved') {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-5 py-3 rounded-lg text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
          Enrolled — Access Granted
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-[var(--accent)] text-[#10261f] font-semibold px-5 py-3 rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  if (localEnrollment?.status === 'pending') {
    return (
      <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-200 px-5 py-3 rounded-lg text-sm font-medium w-fit">
        <Clock className="w-4 h-4" />
        Enrolment Request Pending — Awaiting Admin Approval
      </div>
    )
  }

  if (localEnrollment?.status === 'rejected') {
    return (
      <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 px-5 py-3 rounded-lg text-sm font-medium w-fit">
        <XCircle className="w-4 h-4" />
        Enrolment Rejected — Contact support
      </div>
    )
  }

  return (
    <button
      onClick={handleEnrol}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-[var(--accent)] text-[#10261f] font-semibold px-6 py-3 rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm disabled:opacity-60"
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {user ? 'Request Enrolment' : 'Log in to Enrol'}
    </button>
  )
}
