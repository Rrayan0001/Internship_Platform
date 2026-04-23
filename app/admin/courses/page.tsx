import { requireAdmin } from '@/lib/supabase/helpers'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { ArrowLeft, Plus, BookOpen, Edit } from 'lucide-react'

const domainBg: Record<string, string> = {
  'Data Science': '#e8f5ee',
  'Frontend Development': '#eff3ff',
  'Backend Development': '#fef3e8',
}
const domainText: Record<string, string> = {
  'Data Science': '#15603a',
  'Frontend Development': '#3730a3',
  'Backend Development': '#8a3f1d',
}

export default async function AdminCoursesPage() {
  const { supabase, profile } = await requireAdmin()

  const { data: coursesRaw } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courses = coursesRaw as any[]

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

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[var(--brand)]">Courses</h1>
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--brand)] text-[#fbf6ee] text-sm font-semibold rounded-lg hover:bg-[var(--brand-hover)] transition-colors"
          >
            <Plus className="w-4 h-4" /> New Course
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses?.map((course: { id: string; title: string; domain: string; duration: string; instructor_name: string; thumbnail_url: string | null }) => {
            const bg = domainBg[course.domain] ?? '#f0f4f2'
            const text = domainText[course.domain] ?? 'var(--brand)'
            return (
              <div key={course.id} className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--brand)]/30 hover:shadow-[0_8px_24px_rgba(23,53,43,0.08)] transition-all">
                <div className="h-32 flex items-center justify-center" style={{ background: bg }}>
                  {course.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-10 h-10 opacity-30" style={{ color: text }} />
                  )}
                </div>
                <div className="p-4">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: bg, color: text }}
                  >
                    {course.domain}
                  </span>
                  <h3 className="font-semibold text-[var(--brand)] mt-2 mb-1 leading-snug">{course.title}</h3>
                  <p className="text-xs text-[var(--foreground-subtle)] mb-3">{course.instructor_name} · {course.duration}</p>
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Manage Content
                  </Link>
                </div>
              </div>
            )
          })}
          {!courses?.length && (
            <div className="col-span-3 text-center py-16 text-[var(--foreground-subtle)]">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No courses yet. Create your first one.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
