import { requireAdmin } from '@/lib/supabase/helpers'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import CourseContentManager from './CourseContentManager'
import { ArrowLeft } from 'lucide-react'
import { Course } from '@/lib/supabase/types'

export default async function AdminCourseManagePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const { supabase, profile } = await requireAdmin()

  const { data: courseRaw } = await supabase.from('courses').select('*').eq('id', courseId).single()
  const course = courseRaw as Course | null
  if (!course) notFound()

  const { data: weeksRaw } = await supabase
    .from('course_weeks')
    .select(`*, week_videos(*), week_assignments(*)`)
    .eq('course_id', courseId)
    .order('week_number')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const weeks = weeksRaw as any[]

  return (
    <div className="min-h-screen bg-[var(--background-soft)]">
      <Navbar user={profile} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--brand)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--brand)]">{course.title}</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">{course.domain} · {course.duration}</p>
        </div>
        <CourseContentManager courseId={courseId} weeks={weeks ?? []} />
      </main>
    </div>
  )
}
