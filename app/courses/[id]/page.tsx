import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import EnrolButton from './EnrolButton'
import { notFound, redirect } from 'next/navigation'
import { Clock, Users, BookOpen, CheckCircle2, Video, FileText, ChevronDown } from 'lucide-react'

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: courseRaw, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()
  const course = courseRaw as import('@/lib/supabase/types').Course | null

  if (courseError) {
    console.error('[CourseDetailPage] Failed to fetch course:', id, courseError)
  }

  if (!course) {
    // RLS may be blocking anon reads — redirect to home with a message rather than 404
    redirect(`/?error=course_not_found&id=${id}`)
  }

  const { data: weeksRaw } = await supabase
    .from('course_weeks')
    .select(`*, week_videos(*), week_assignments(*)`)
    .eq('course_id', id)
    .order('week_number')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const weeks = weeksRaw as any[]

  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  let navUser = null
  let enrollment = null

  if (user) {
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
    profile = data
    
    // Fallback if the user row doesn't exist
    navUser = profile || {
      id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
      role: 'student',
      email: user.email || ''
    }

    const { data: enr } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', id)
      .single()
    enrollment = enr
  }

  const totalVideos = weeks?.reduce((acc, w) => acc + (w.week_videos?.length ?? 0), 0) ?? 0

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-soft)]">
      <Navbar user={navUser} />

      {/* Hero */}
      <div className="bg-[var(--brand)] text-white py-10 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1 rounded-full mb-4 sm:mb-5 uppercase tracking-wide">
            {course.domain}
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 max-w-3xl leading-tight">{course.title}</h1>
          <p className="text-white/70 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl leading-7">{course.description}</p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-white/60 mb-6 sm:mb-8">
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{course.instructor_name}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{course.duration}</span>
            <span className="flex items-center gap-1.5"><Video className="w-4 h-4" />{totalVideos} videos</span>
            <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" />8 weekly assessments</span>
          </div>

          <EnrolButton courseId={id} enrollment={enrollment} user={user} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left: Syllabus */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-[var(--brand)]">Course Syllabus</h2>

            {weeks && weeks.length > 0 ? (
              <div className="space-y-3">
                {weeks.map((week) => (
                  <details key={week.id} className="bg-white rounded-xl border border-[var(--border)] group">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-[var(--brand)] text-[#f3d4b8] text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {week.week_number}
                        </span>
                        <div>
                          <div className="font-medium text-[var(--foreground)]">Week {week.week_number}: {week.title}</div>
                          <div className="text-xs text-[var(--foreground-subtle)] mt-0.5">
                            {week.week_videos?.length ?? 0} videos · {week.week_assignments?.length ?? 0} assignment
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-[var(--foreground-subtle)] group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-5 pb-4 border-t border-[var(--border)] pt-3 space-y-2">
                      {week.week_videos?.map((video: { id: string; title: string; duration_seconds: number | null }) => (
                        <div key={video.id} className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                          <Video className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
                          <span>{video.title}</span>
                          {video.duration_seconds && (
                            <span className="text-[var(--foreground-subtle)] ml-auto">{Math.round(video.duration_seconds / 60)}m</span>
                          )}
                        </div>
                      ))}
                      {week.week_assignments?.map((assignment: { id: string; type: string; prompt: string }) => (
                        <div key={assignment.id} className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                          <FileText className="w-4 h-4 text-[var(--foreground-subtle)] flex-shrink-0" />
                          <span className="capitalize">{assignment.type.replace('_', ' ')} Assessment</span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[var(--border)] p-8 text-center text-[var(--foreground-subtle)]">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                Syllabus coming soon
              </div>
            )}
          </div>

          {/* Right: Instructor + What you learn */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
              <h3 className="font-semibold text-[var(--brand)] mb-4">Your Instructor</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-[var(--brand)] rounded-full flex items-center justify-center text-[#f3d4b8] font-bold text-lg">
                  {course.instructor_name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-[var(--foreground)]">{course.instructor_name}</div>
                  <div className="text-xs text-[var(--foreground-subtle)]">{course.domain} Expert</div>
                </div>
              </div>
              <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">{course.instructor_bio}</p>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
              <h3 className="font-semibold text-[var(--brand)] mb-4">What you&apos;ll get</h3>
              <ul className="space-y-2.5">
                {[
                  '8 weeks of structured content',
                  `${totalVideos} video lessons`,
                  'Weekly assessments',
                  'Admin feedback on submissions',
                  'Professional certificate',
                  'Lifetime access to material',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                    <CheckCircle2 className="w-4 h-4 text-[var(--success)] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
