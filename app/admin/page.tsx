import { requireAdmin } from '@/lib/supabase/helpers'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import EnrollmentActions from './enrollments/EnrollmentActions'
import { Users, BookOpen, Clock, Award, ChevronRight, ShieldCheck } from 'lucide-react'

export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireAdmin()

  const [
    { count: totalStudents },
    { count: pendingCount },
    { count: certRequests },
    { count: totalCourses },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('certificate_status', 'requested'),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
  ])

  const { data: pendingEnrollmentsRaw } = await supabase
    .from('enrollments')
    .select(`*, users(name, email), courses(title, domain)`)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false })
    .limit(10)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingEnrollments = pendingEnrollmentsRaw as any[]

  const { data: recentStudentsRaw } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false })
    .limit(8)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentStudents = recentStudentsRaw as any[]

  return (
    <div className="min-h-screen bg-[var(--background-soft)] text-[var(--foreground)]">
      <Navbar user={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--foreground-subtle)] mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin panel
            </div>
            <h1 className="text-3xl font-bold text-[var(--brand)] tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Manage students, courses, and certificates.
            </p>
          </div>
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--brand)] text-[#fbf6ee] text-sm font-semibold hover:bg-[var(--brand-hover)] transition-colors shrink-0"
          >
            <BookOpen className="h-4 w-4" />
            Add course
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total students',
              value: totalStudents ?? 0,
              icon: Users,
              bg: '#e8f5ee',
              color: 'var(--brand)',
            },
            {
              label: 'Total courses',
              value: totalCourses ?? 0,
              icon: BookOpen,
              bg: '#eff3ff',
              color: '#3730a3',
            },
            {
              label: 'Pending approvals',
              value: pendingCount ?? 0,
              icon: Clock,
              bg: 'var(--warning-soft)',
              color: 'var(--warning)',
              urgent: (pendingCount ?? 0) > 0,
            },
            {
              label: 'Cert requests',
              value: certRequests ?? 0,
              icon: Award,
              bg: 'var(--success-soft)',
              color: 'var(--success)',
              urgent: (certRequests ?? 0) > 0,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-white border rounded-xl p-4 flex items-center gap-3 ${
                stat.urgent ? 'border-amber-300' : 'border-[var(--border)]'
              }`}
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: stat.bg }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--brand)] leading-none">{stat.value}</div>
                <div className="text-xs text-[var(--foreground-subtle)] mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main widgets */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Enrolment queue */}
          <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="font-semibold text-[var(--brand)]">Enrolment queue</h2>
              <Link
                href="/admin/enrollments"
                className="text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
              >
                View all →
              </Link>
            </div>
            {pendingEnrollments?.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {pendingEnrollments.map(
                  (enr: {
                    id: string
                    users: { name: string } | null
                    courses: { title: string } | null
                  }) => (
                    <div key={enr.id} className="px-6 py-3.5 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[var(--brand)] text-[#fbf6ee] text-sm font-bold flex items-center justify-center shrink-0">
                        {enr.users?.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--foreground)] truncate">
                          {enr.users?.name}
                        </div>
                        <div className="text-xs text-[var(--foreground-subtle)] truncate">
                          {enr.courses?.title}
                        </div>
                      </div>
                      <EnrollmentActions enrollmentId={enr.id} />
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-sm text-[var(--foreground-subtle)]">
                No pending enrolments
              </div>
            )}
          </div>

          {/* Recent students */}
          <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="font-semibold text-[var(--brand)]">Recent students</h2>
              <Link
                href="/admin/students"
                className="text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
              >
                View all →
              </Link>
            </div>
            {recentStudents?.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {recentStudents.map(
                  (student: { id: string; name: string; email: string }) => (
                    <Link
                      key={student.id}
                      href={`/admin/students/${student.id}`}
                      className="px-6 py-3.5 flex items-center gap-3 hover:bg-[var(--background-soft)] transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-bold flex items-center justify-center shrink-0">
                        {student.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--foreground)]">{student.name}</div>
                        <div className="text-xs text-[var(--foreground-subtle)] truncate">{student.email}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--foreground-subtle)]" />
                    </Link>
                  )
                )}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-sm text-[var(--foreground-subtle)]">
                No students yet
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'All enrollments', href: '/admin/enrollments', icon: Users },
            { label: 'All students', href: '/admin/students', icon: Users },
            { label: 'Manage courses', href: '/admin/courses', icon: BookOpen },
            { label: 'Certificates', href: '/admin/certificates', icon: Award },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="bg-white border border-[var(--border)] rounded-xl p-4 flex items-center gap-3 hover:border-[var(--brand)]/30 hover:shadow-[0_4px_16px_rgba(23,53,43,0.07)] transition-all"
            >
              <link.icon className="h-5 w-5 text-[var(--brand)] shrink-0" />
              <span className="text-sm font-medium text-[var(--foreground)] flex-1">{link.label}</span>
              <ChevronRight className="h-4 w-4 text-[var(--foreground-subtle)]" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
