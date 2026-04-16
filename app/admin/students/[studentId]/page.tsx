import { requireAdmin } from '@/lib/supabase/helpers'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import GradingPanel from './GradingPanel'
import CertificateActions from './CertificateActions'
import { ArrowLeft, Video, FileText, CheckCircle2, Clock, XCircle, Award } from 'lucide-react'
import { UserProfile } from '@/lib/supabase/types'

export default async function StudentJourneyPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params
  const { supabase, profile } = await requireAdmin()

  const { data: studentRaw } = await supabase.from('users').select('*').eq('id', studentId).single()
  const student = studentRaw as UserProfile | null
  if (!student) notFound()

  const { data: enrollmentsRaw } = await supabase
    .from('enrollments')
    .select(`*, courses(*)`)
    .eq('user_id', studentId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrollments = enrollmentsRaw as any[]

  return (
    <div className="min-h-screen bg-[var(--background-soft)]">
      <Navbar user={profile} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--brand)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Link>

        {/* Student info */}
        <div className="bg-white border border-[var(--border)] rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-[var(--brand)] rounded-full flex items-center justify-center text-[#f3d4b8] font-bold text-xl flex-shrink-0">
              {student.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[var(--brand)]">{student.name}</h1>
              <div className="text-sm text-[var(--foreground-muted)]">{student.email}</div>
              {student.phone && <div className="text-sm text-[var(--foreground-subtle)]">{student.phone}</div>}
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-[var(--foreground-subtle)]">
                {student.degree && <span>Degree: {student.degree}</span>}
                {student.field_of_study && <span>Field: {student.field_of_study}</span>}
                {student.current_status && <span>Status: {student.current_status}</span>}
                {student.city && <span>City: {student.city}</span>}
                <span>Joined: {new Date(student.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {enrollments?.map((enrollment: {
          id: string
          status: string
          certificate_status: string
          user_id: string
          courses: { id: string; title: string; domain: string } | null
        }) => (
          <EnrollmentJourney
            key={enrollment.id}
            enrollment={enrollment}
            course={enrollment.courses}
            studentId={studentId}
          />
        ))}

        {!enrollments?.length && (
          <div className="text-center py-12 text-[var(--foreground-subtle)]">No course enrolments found</div>
        )}
      </main>
    </div>
  )
}

async function EnrollmentJourney({
  enrollment,
  course,
  studentId,
}: {
  enrollment: { id: string; status: string; certificate_status: string; user_id: string }
  course: { id: string; title: string; domain: string } | null
  studentId: string
}) {
  const { supabase } = await requireAdmin()

  const { data: weeksRaw } = await supabase
    .from('course_weeks')
    .select(`*, week_videos(*), week_assignments(*)`)
    .eq('course_id', course?.id ?? '')
    .order('week_number')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const weeks = weeksRaw as any[]

  const { data: videoProgressRaw } = await supabase
    .from('video_progress')
    .select('*')
    .eq('enrollment_id', enrollment.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoProgress = videoProgressRaw as any[]

  const { data: submissionsRaw } = await supabase
    .from('submissions')
    .select(`*, week_assignments(type, prompt, max_score)`)
    .eq('enrollment_id', enrollment.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submissions = submissionsRaw as any[]

  const totalVideos = weeks?.reduce((acc: number, w: { week_videos?: { length: number } }) => acc + (w.week_videos?.length ?? 0), 0) ?? 0
  const watchedVideos = videoProgress?.filter((p: { watched: boolean }) => p.watched).length ?? 0
  const totalAssignments = weeks?.reduce((acc: number, w: { week_assignments?: { length: number } }) => acc + (w.week_assignments?.length ?? 0), 0) ?? 0
  const submittedAssignments = submissions?.length ?? 0

  const scores = submissions?.map((s: { auto_score?: number; manual_score?: number }) => s.auto_score ?? s.manual_score ?? 0) ?? []
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0

  const statusColors: Record<string, string> = {
    pending: 'bg-[var(--warning-soft)] text-[var(--warning)]',
    approved: 'bg-[var(--success-soft)] text-[var(--success)]',
    rejected: 'bg-[var(--error-soft)] text-[var(--error)]',
  }

  // suppress unused variable warning
  void studentId

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl mb-6 overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[var(--brand)]">{course?.title}</h2>
          <span className="text-xs text-[var(--foreground-subtle)]">{course?.domain}</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[enrollment.status] ?? 'bg-[var(--background-soft)] text-[var(--foreground-muted)]'}`}>
          {enrollment.status}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[var(--border)]">
        {[
          { label: 'Videos Watched', value: `${watchedVideos}/${totalVideos}`, icon: Video },
          { label: 'Assignments', value: `${submittedAssignments}/${totalAssignments}`, icon: FileText },
          { label: 'Avg Score', value: `${avgScore}%`, icon: CheckCircle2 },
          { label: 'Certificate', value: enrollment.certificate_status.replace('_', ' '), icon: Award },
        ].map((stat, i) => (
          <div key={stat.label} className={`px-4 sm:px-5 py-4 text-center ${i % 2 === 0 ? 'border-r border-[var(--border)]' : ''} ${i < 2 ? 'border-b sm:border-b-0 border-[var(--border)]' : ''} sm:border-r sm:last:border-r-0`}>
            <div className="font-bold text-[var(--brand)] text-sm sm:text-base">{stat.value}</div>
            <div className="text-xs text-[var(--foreground-subtle)] mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Week-by-Week Breakdown</h3>
        <div className="space-y-3">
          {weeks?.map((week: {
            id: string
            week_number: number
            title: string
            week_videos: { id: string }[]
            week_assignments: { id: string }[]
          }) => {
            const weekVideos = week.week_videos ?? []
            const weekAssignments = week.week_assignments ?? []
            const weekWatched = videoProgress?.filter((p: { video_id: string; watched: boolean }) =>
              weekVideos.some((v) => v.id === p.video_id) && p.watched
            ).length ?? 0
            const weekSubs = submissions?.filter((s: { assignment_id: string }) =>
              weekAssignments.some((a: { id: string }) => a.id === s.assignment_id)
            ) ?? []

            return (
              <div key={week.id} className="bg-[var(--background-soft)] border border-[var(--border)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Week {week.week_number}: {week.title}
                  </span>
                  <span className="text-xs text-[var(--foreground-subtle)]">
                    {weekWatched}/{weekVideos.length} videos
                  </span>
                </div>

                {weekSubs.map((sub: {
                  id: string
                  assignment_id: string
                  auto_score?: number
                  manual_score?: number
                  admin_feedback?: string
                  response?: string
                  file_url?: string
                  week_assignments?: { type: string; max_score: number }
                }) => {
                  const assignment = sub.week_assignments
                  return (
                    <div key={sub.id} className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-[var(--foreground-muted)] capitalize">
                          {assignment?.type?.replace('_', ' ')}
                        </span>
                        {sub.auto_score != null && (
                          <span className="text-xs text-[var(--success)] font-medium">
                            Auto: {sub.auto_score}/{assignment?.max_score}
                          </span>
                        )}
                        {sub.manual_score != null && (
                          <span className="text-xs text-[var(--info)] font-medium">
                            Manual: {sub.manual_score}/{assignment?.max_score}
                          </span>
                        )}
                        {sub.auto_score == null && sub.manual_score == null && (
                          <span className="text-xs text-[var(--foreground-subtle)] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending review
                          </span>
                        )}
                      </div>

                      {(assignment?.type === 'dev_task' || assignment?.type === 'case_study' || assignment?.type === 'short_answer') && sub.manual_score == null && (
                        <GradingPanel
                          submissionId={sub.id}
                          maxScore={assignment?.max_score ?? 100}
                          response={sub.response ?? null}
                          fileUrl={sub.file_url ?? null}
                        />
                      )}
                    </div>
                  )
                })}

                {weekSubs.length === 0 && (
                  <div className="text-xs text-[var(--foreground-subtle)] flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> No submission yet
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <CertificateActions
            enrollmentId={enrollment.id}
            certificateStatus={enrollment.certificate_status}
            studentName={enrollment.user_id}
          />
        </div>
      </div>
    </div>
  )
}
