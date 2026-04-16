import { requireAdmin } from '@/lib/supabase/helpers'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { UserProfile } from '@/lib/supabase/types'

export default async function AdminStudentsPage() {
  const { supabase, profile } = await requireAdmin()

  const { data: studentsRaw } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false })
  const students = studentsRaw as UserProfile[]

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
        <h1 className="text-2xl font-bold text-[var(--brand)] mb-6">
          All Students ({students?.length ?? 0})
        </h1>

        <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="divide-y divide-[var(--border)]">
            {students?.map((student) => (
              <Link
                key={student.id}
                href={`/admin/students/${student.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--background-soft)] transition-colors"
              >
                <div className="w-10 h-10 bg-[var(--brand)] rounded-full flex items-center justify-center text-[#f3d4b8] font-bold text-sm flex-shrink-0">
                  {student.name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--foreground)]">{student.name}</div>
                  <div className="text-sm text-[var(--foreground-subtle)] truncate">{student.email}</div>
                </div>
                <div className="hidden sm:block text-xs text-[var(--foreground-subtle)]">
                  {new Date(student.created_at).toLocaleDateString()}
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--foreground-subtle)] shrink-0" />
              </Link>
            ))}
            {!students?.length && (
              <div className="px-5 py-12 text-center text-[var(--foreground-subtle)]">No students yet</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
