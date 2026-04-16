import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserProfile } from './types'

/**
 * Server-side helper: gets the current user's profile and ensures they are an admin.
 * Redirects to login or dashboard if not authenticated or not admin.
 */
export async function requireAdmin(): Promise<{ supabase: Awaited<ReturnType<typeof createClient>>; profile: UserProfile }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Use raw fetch to avoid type inference issues with the generated client
  const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
  const profile = data as UserProfile | null

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return { supabase, profile }
}
