import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { enrollmentId } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Get enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*, courses(id)')
    .eq('id', enrollmentId)
    .single()

  if (!enrollment) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

  const courseId = enrollment.courses.id

  // Get all weeks and their videos + assignments
  const { data: weeks } = await supabase
    .from('course_weeks')
    .select('*, week_videos(*), week_assignments(*)')
    .eq('course_id', courseId)

  const totalVideos = weeks?.reduce((a: number, w: any) => a + w.week_videos.length, 0) ?? 0
  const totalAssignments = weeks?.reduce((a: number, w: any) => a + w.week_assignments.length, 0) ?? 0

  // Check video progress
  const { data: progress } = await supabase
    .from('video_progress')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .eq('watched', true)

  // Check submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('enrollment_id', enrollmentId)

  const watchedCount = progress?.length ?? 0
  const submittedCount = submissions?.length ?? 0
  const scores = submissions?.map((s: any) => s.auto_score ?? s.manual_score ?? 0) ?? []
  const avgScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0

  const reasons: string[] = []
  if (watchedCount < totalVideos) reasons.push(`${watchedCount}/${totalVideos} videos watched`)
  if (submittedCount < totalAssignments) reasons.push(`${submittedCount}/${totalAssignments} assignments submitted`)
  if (avgScore < 60) reasons.push(`Average score ${Math.round(avgScore)}% (need 60%)`)

  const eligible = reasons.length === 0

  if (eligible) {
    await supabase
      .from('enrollments')
      .update({ certificate_status: 'eligible' })
      .eq('id', enrollmentId)
  }

  return new Response(JSON.stringify({ eligible, reasons }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
