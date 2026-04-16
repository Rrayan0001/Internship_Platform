import { requireAdmin } from '@/lib/supabase/helpers'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import NewCourseForm from './NewCourseForm'
import { ArrowLeft } from 'lucide-react'

export default async function NewCoursePage() {
  const { profile } = await requireAdmin()

  return (
    <div className="min-h-screen bg-[var(--background-soft)]">
      <Navbar user={profile} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--brand)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
        <h1 className="text-2xl font-bold text-[var(--brand)] mb-8">Create New Course</h1>
        <NewCourseForm />
      </main>
    </div>
  )
}
