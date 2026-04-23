import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { BookOpen, Clock, CheckCircle2, ArrowRight, Award, AlertCircle, LayoutDashboard } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profileRaw } = await supabase.from('users').select('*').eq('id', user!.id).single()
  const profile = profileRaw as import('@/lib/supabase/types').UserProfile | null
  if (profile?.role === 'admin') redirect('/admin')

  // Fallback if the user row doesn't exist to ensure the logout button shows up
  const navUser = profile || {
    id: user!.id,
    name: user!.user_metadata?.full_name || user!.user_metadata?.name || user!.email?.split('@')[0] || 'Student',
    role: 'student',
    email: user!.email || ''
  } as any;

  const { data: enrollmentsRaw } = await supabase
    .from('enrollments')
    .select(`*, courses(*)`)
    .eq('user_id', user!.id)
    .order('requested_at', { ascending: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrollments = (enrollmentsRaw ?? []) as any[]

  const enrollmentIds = enrollments?.map((e: { id: string }) => e.id) ?? []
  const { data: progressData } = await supabase
    .from('video_progress')
    .select('enrollment_id, watched')
    .in('enrollment_id', enrollmentIds)

  const watchedByEnrollment: Record<string, number> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(progressData as any[] ?? []).forEach((p: { enrollment_id: string; watched: boolean }) => {
    if (p.watched) {
      watchedByEnrollment[p.enrollment_id] = (watchedByEnrollment[p.enrollment_id] ?? 0) + 1
    }
  })

  const approved = enrollments?.filter((e) => e.status === 'approved') ?? []
  const pending = enrollments?.filter((e) => e.status === 'pending') ?? []
  const certIssued = enrollments?.filter((e) => e.certificate_status === 'issued').length ?? 0
  const certEligible = enrollments?.filter(
    (e) => e.certificate_status === 'eligible' || e.certificate_status === 'requested'
  ).length ?? 0

  const domainColors: Record<string, string> = {
    'Data Science': '#15603a',
    'Frontend Development': '#3730a3',
    'Backend Development': '#8a3f1d',
  }

  const domainBg: Record<string, string> = {
    'Data Science': '#e8f5ee',
    'Frontend Development': '#eff3ff',
    'Backend Development': '#fef3e8',
  }

  return (
    <div className="min-h-screen bg-[var(--background-soft)] text-[var(--foreground)]">
      <Navbar user={navUser} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--foreground-subtle)] mb-2">
            <LayoutDashboard className="h-3.5 w-3.5" />
            My learning
          </div>
          <h1 className="text-3xl font-bold text-[var(--brand)] tracking-tight">
            Welcome back, {profile?.name?.split(' ')[0] ?? 'Learner'}
          </h1>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">Pick up where you left off.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Enrolled courses',
              value: approved.length,
              icon: BookOpen,
              color: 'text-[var(--brand)]',
              bg: '#e8f5ee',
            },
            {
              label: 'Pending approval',
              value: pending.length,
              icon: Clock,
              color: 'text-[var(--warning)]',
              bg: 'var(--warning-soft)',
            },
            {
              label: 'Certificates earned',
              value: certIssued,
              icon: Award,
              color: 'text-[var(--success)]',
              bg: 'var(--success-soft)',
            },
            {
              label: 'Cert eligible',
              value: certEligible,
              icon: CheckCircle2,
              color: 'text-[var(--info)]',
              bg: 'var(--info-soft)',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[var(--border)] rounded-xl p-4 flex items-center gap-3"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: stat.bg }}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--brand)] leading-none">{stat.value}</div>
                <div className="text-xs text-[var(--foreground-subtle)] mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending notice */}
        {pending.length > 0 && (
          <div className="bg-[var(--warning-soft)] border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[var(--warning)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {pending.length} enrolment{pending.length > 1 ? 's' : ''} awaiting admin approval
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                You&apos;ll get access as soon as an admin reviews your request.
              </p>
            </div>
          </div>
        )}

        {/* Course grid */}
        {approved.length > 0 ? (
          <div>
            <h2 className="text-lg font-semibold text-[var(--brand)] mb-5">My courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {approved.map((enrollment) => {
                const course = enrollment.courses as {
                  id: string
                  title: string
                  domain: string
                  duration: string
                  thumbnail_url: string | null
                } | null
                const watched = watchedByEnrollment[enrollment.id] ?? 0
                const certStatus = enrollment.certificate_status
                const badgeColor = domainColors[course?.domain ?? ''] ?? 'var(--brand)'
                const badgeBg = domainBg[course?.domain ?? ''] ?? '#f0f4f2'

                return (
                  <Link key={enrollment.id} href={`/dashboard/course/${enrollment.id}`} className="group block">
                    <article className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--brand)]/30 hover:shadow-[0_8px_30px_rgba(23,53,43,0.09)] transition-all duration-200">
                      {/* Thumbnail / colour header */}
                      <div className="h-32 overflow-hidden">
                        {course?.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: badgeBg }}
                          >
                            <BookOpen className="h-10 w-10 opacity-40" style={{ color: badgeColor }} />
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div
                          className="inline-flex text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
                          style={{ background: badgeBg, color: badgeColor }}
                        >
                          {course?.domain}
                        </div>
                        <h3 className="font-semibold text-[var(--brand)] leading-snug group-hover:text-[var(--brand-hover)] transition-colors line-clamp-2 mb-4">
                          {course?.title}
                        </h3>

                        {/* Progress bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-[var(--foreground-subtle)] mb-1.5">
                            <span>{watched} video{watched !== 1 ? 's' : ''} watched</span>
                          </div>
                          <div className="w-full bg-[var(--background-soft)] rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${Math.min((watched / 24) * 100, 100)}%`,
                                background: 'var(--brand)',
                              }}
                            />
                          </div>
                        </div>

                        {/* Certificate status */}
                        <div className="flex items-center justify-between">
                          <div>
                            {certStatus === 'issued' && (
                              <div className="flex items-center gap-1.5 text-xs text-[var(--success)] font-medium">
                                <Award className="h-3.5 w-3.5" /> Certificate issued
                              </div>
                            )}
                            {certStatus === 'eligible' && (
                              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--info)' }}>
                                <CheckCircle2 className="h-3.5 w-3.5" /> Eligible for certificate
                              </div>
                            )}
                            {certStatus === 'requested' && (
                              <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--warning)]">
                                <Clock className="h-3.5 w-3.5" /> Certificate requested
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-semibold text-[var(--brand)] group-hover:gap-2 transition-all">
                            Continue <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[var(--border)] rounded-2xl p-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-[var(--background-soft)] flex items-center justify-center mb-5">
              <BookOpen className="h-8 w-8 text-[var(--foreground-subtle)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--brand)] mb-2">No courses yet</h3>
            <p className="text-sm text-[var(--foreground-muted)] max-w-sm mx-auto mb-7">
              Browse programs and request enrolment to get started on your learning journey.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--brand)] text-[#fbf6ee] text-sm font-semibold hover:bg-[var(--brand-hover)] transition-colors"
            >
              Browse programs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
