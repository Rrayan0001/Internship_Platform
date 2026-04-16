import { requireAdmin } from '@/lib/supabase/helpers'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import EnrollmentActions from './EnrollmentActions'
import { ArrowLeft } from 'lucide-react'

export default async function AdminEnrollmentsPage() {
  const { supabase, profile } = await requireAdmin()

  const { data: enrollmentsRaw } = await supabase
    .from('enrollments')
    .select(`*, users(name, email), courses(title, domain)`)
    .order('requested_at', { ascending: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrollments = enrollmentsRaw as any[]

  const statusColors: Record<string, string> = {
    pending: 'bg-[var(--warning-soft)] text-[var(--warning)]',
    approved: 'bg-[var(--success-soft)] text-[var(--success)]',
    rejected: 'bg-[var(--error-soft)] text-[var(--error)]',
  }

  return (
    <div className="min-h-screen bg-[var(--background-soft)]">
      <Navbar user={profile} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--brand)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[var(--brand)] mb-6">All Enrolments</h1>

        {/* Mobile card layout */}
        <div className="sm:hidden space-y-3">
          {enrollments?.map((enr: {
            id: string
            status: string
            requested_at: string
            users: { id?: string; name: string; email: string } | null
            courses: { title: string; domain: string } | null
          }) => (
            <div key={enr.id} className="bg-white border border-[var(--border)] rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-[var(--foreground)]">{enr.users?.name}</div>
                  <div className="text-xs text-[var(--foreground-subtle)]">{enr.users?.email}</div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${statusColors[enr.status] ?? 'bg-[var(--background-soft)] text-[var(--foreground-muted)]'}`}>
                  {enr.status}
                </span>
              </div>
              <div className="border-t border-[var(--border)] pt-3">
                <div className="font-medium text-sm text-[var(--foreground)]">{enr.courses?.title}</div>
                <div className="text-xs text-[var(--foreground-subtle)]">{enr.courses?.domain}</div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--foreground-muted)]">{new Date(enr.requested_at).toLocaleDateString()}</span>
                <div>
                  {enr.status === 'pending' && <EnrollmentActions enrollmentId={enr.id} />}
                  {enr.status !== 'pending' && enr.users?.id && (
                    <Link href={`/admin/students/${enr.users.id}`} className="text-xs font-medium text-[var(--brand)] hover:text-[var(--brand-hover)]">
                      View Journey →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--background-soft)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-[var(--foreground-muted)] text-xs uppercase tracking-wide">Student</th>
                  <th className="text-left px-5 py-3 font-semibold text-[var(--foreground-muted)] text-xs uppercase tracking-wide">Course</th>
                  <th className="text-left px-5 py-3 font-semibold text-[var(--foreground-muted)] text-xs uppercase tracking-wide">Requested</th>
                  <th className="text-left px-5 py-3 font-semibold text-[var(--foreground-muted)] text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-[var(--foreground-muted)] text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {enrollments?.map((enr: {
                  id: string
                  status: string
                  requested_at: string
                  users: { id?: string; name: string; email: string } | null
                  courses: { title: string; domain: string } | null
                }) => (
                  <tr key={enr.id} className="hover:bg-[var(--background-soft)] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[var(--foreground)]">{enr.users?.name}</div>
                      <div className="text-xs text-[var(--foreground-subtle)]">{enr.users?.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[var(--foreground)]">{enr.courses?.title}</div>
                      <div className="text-xs text-[var(--foreground-subtle)]">{enr.courses?.domain}</div>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--foreground-muted)]">
                      {new Date(enr.requested_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[enr.status] ?? 'bg-[var(--background-soft)] text-[var(--foreground-muted)]'}`}>
                        {enr.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {enr.status === 'pending' && <EnrollmentActions enrollmentId={enr.id} />}
                      {enr.status !== 'pending' && enr.users?.id && (
                        <Link
                          href={`/admin/students/${enr.users.id}`}
                          className="text-xs font-medium text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors"
                        >
                          View Journey
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
