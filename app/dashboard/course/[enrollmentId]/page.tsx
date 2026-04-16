import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CoursePlayer from './CoursePlayer'
import { UserProfile } from '@/lib/supabase/types'

export default async function CourseLearnPage({ params }: { params: Promise<{ enrollmentId: string }> }) {
  const { enrollmentId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profileRaw } = await supabase.from('users').select('*').eq('id', user!.id).single()
  const profile = profileRaw as UserProfile | null

  // Verify enrollment belongs to this user and is approved
  const { data: enrollmentRaw } = await supabase
    .from('enrollments')
    .select(`*, courses(*)`)
    .eq('id', enrollmentId)
    .eq('user_id', user!.id)
    .single()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrollment = enrollmentRaw as any

  if (!enrollment || enrollment.status !== 'approved') notFound()

  const course = enrollment.courses as { id: string; title: string; domain: string }

  // Load all weeks with videos and assignments
  const { data: weeksRaw } = await supabase
    .from('course_weeks')
    .select(`*, week_videos(*), week_assignments(*)`)
    .eq('course_id', course.id)
    .order('week_number')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const weeks = (weeksRaw ?? []) as any[]

  // Load student's video progress
  const { data: vpRaw } = await supabase
    .from('video_progress')
    .select('*')
    .eq('user_id', user!.id)
    .eq('enrollment_id', enrollmentId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoProgress = (vpRaw ?? []) as any[]

  // Load student's submissions
  const { data: submissionsRaw } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', user!.id)
    .eq('enrollment_id', enrollmentId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submissions = (submissionsRaw ?? []) as any[]

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-soft)]">
      <Navbar user={profile} />
      <CoursePlayer
        enrollment={enrollment}
        course={course}
        weeks={weeks}
        videoProgress={videoProgress}
        submissions={submissions}
        userId={user!.id}
      />
    </div>
  )
}
