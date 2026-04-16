// Note: PDF generation in Deno — use a simple HTML-to-text approach or
// integrate with a PDF API (PDFMonkey, DocRaptor, etc.) for production.
// This stub marks the certificate as issued and stores metadata.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { enrollmentId } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*, users(name, legal_name, email), courses(title)')
    .eq('id', enrollmentId)
    .single()

  if (!enrollment) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  if (enrollment.certificate_status !== 'requested') {
    return new Response(JSON.stringify({ error: 'Certificate not requested' }), { status: 400 })
  }

  const student = enrollment.users
  const course = enrollment.courses
  const recipientName = student.legal_name || student.name

  // TODO: Generate actual PDF here using a PDF service
  // For now: mark as issued and return the enrollment
  await supabase
    .from('enrollments')
    .update({
      certificate_status: 'issued',
      certificate_issued_at: new Date().toISOString()
    })
    .eq('id', enrollmentId)

  return new Response(JSON.stringify({
    success: true,
    recipientName,
    courseName: course.title,
    issuedAt: new Date().toISOString()
  }), { headers: { 'Content-Type': 'application/json' } })
})
