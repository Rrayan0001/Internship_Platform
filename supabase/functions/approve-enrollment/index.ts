import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { enrollmentId, action } = await req.json() // action: 'approved' | 'rejected'
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const update: any = { status: action }
  if (action === 'approved') update.approved_at = new Date().toISOString()

  const { data: enrollment } = await supabase
    .from('enrollments')
    .update(update)
    .eq('id', enrollmentId)
    .select('*, users(email, name), courses(title)')
    .single()

  // Optionally send welcome email via Supabase Auth admin API or Resend
  // (wire up later — enrollment update is the critical part)

  return new Response(JSON.stringify({ success: true, enrollment }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
