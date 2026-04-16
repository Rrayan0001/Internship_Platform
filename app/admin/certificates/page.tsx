import { requireAdmin } from '@/lib/supabase/helpers'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import CertificateActions from '../students/[studentId]/CertificateActions'
import { ArrowLeft, Award, Clock, CheckCircle2 } from 'lucide-react'

export default async function AdminCertificatesPage() {
  const { supabase, profile } = await requireAdmin()

  const { data: requestedRaw } = await supabase
    .from('enrollments')
    .select(`*, users(id, name, email, legal_name), courses(title, domain)`)
    .in('certificate_status', ['requested', 'eligible', 'issued'])
    .order('requested_at', { ascending: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrollments = (requestedRaw ?? []) as any[]

  const requested = enrollments.filter((e: { certificate_status: string }) => e.certificate_status === 'requested')
  const eligible = enrollments.filter((e: { certificate_status: string }) => e.certificate_status === 'eligible')
  const issued = enrollments.filter((e: { certificate_status: string }) => e.certificate_status === 'issued')

  const statusConfig = {
    requested: {
      label: 'Awaiting Issuance',
      items: requested,
      icon: Clock,
      tagClass: 'bg-[var(--warning-soft)] text-[var(--warning)] border-amber-200',
    },
    eligible: {
      label: 'Eligible — Not Yet Requested',
      items: eligible,
      icon: CheckCircle2,
      tagClass: 'bg-[var(--info-soft)] text-[var(--info)] border-blue-200',
    },
    issued: {
      label: 'Issued',
      items: issued,
      icon: Award,
      tagClass: 'bg-[var(--success-soft)] text-[var(--success)] border-green-200',
    },
  }

  return (
    <div className="min-h-screen bg-[var(--background-soft)]">
      <Navbar user={profile} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--brand)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Award className="w-6 h-6 text-[var(--brand)]" />
          <h1 className="text-2xl font-bold text-[var(--brand)]">Certificates</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Pending Requests', value: requested.length, bg: 'var(--warning-soft)', color: 'var(--warning)' },
            { label: 'Eligible Students', value: eligible.length, bg: 'var(--info-soft)', color: 'var(--info)' },
            { label: 'Issued', value: issued.length, bg: 'var(--success-soft)', color: 'var(--success)' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[var(--border)] rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                <Award className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--brand)]">{s.value}</div>
                <div className="text-xs text-[var(--foreground-subtle)]">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {Object.entries(statusConfig).map(([key, section]) => (
          <div key={key} className="mb-8">
            <div className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border mb-4 ${section.tagClass}`}>
              <section.icon className="w-4 h-4" />
              {section.label} ({section.items.length})
            </div>

            {section.items.length > 0 ? (
              <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
                <div className="divide-y divide-[var(--border)]">
                  {section.items.map((enr: {
                    id: string
                    certificate_status: string
                    users?: { id: string; name: string; email: string; legal_name?: string }
                    courses?: { title: string; domain: string }
                  }) => (
                    <div key={enr.id} className="px-5 py-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-[var(--brand)] rounded-full flex items-center justify-center text-[#f3d4b8] font-bold flex-shrink-0">
                        {enr.users?.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[var(--foreground)]">{enr.users?.name}</div>
                        <div className="text-xs text-[var(--foreground-subtle)]">{enr.users?.email}</div>
                        <div className="text-xs text-[var(--brand)] mt-0.5 font-medium">{enr.courses?.title}</div>
                        {enr.users?.legal_name && (
                          <div className="text-xs text-[var(--foreground-subtle)] mt-0.5">
                            Legal name: <span className="font-medium text-[var(--foreground)]">{enr.users.legal_name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/students/${enr.users?.id}`}
                          className="text-xs font-medium text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors"
                        >
                          View Journey
                        </Link>
                        <CertificateActions
                          enrollmentId={enr.id}
                          certificateStatus={enr.certificate_status}
                          studentName={enr.users?.name ?? ''}
                          legalName={enr.users?.legal_name}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[var(--border)] rounded-xl px-5 py-8 text-center text-sm text-[var(--foreground-subtle)]">
                No students in this category
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  )
}
