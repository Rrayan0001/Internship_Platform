import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ProfileForm from './ProfileForm'
import { UserProfile } from '@/lib/supabase/types'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profileRaw } = await supabase.from('users').select('*').eq('id', user.id).single()
  const profile = profileRaw as UserProfile | null

  const navUser = profile || {
    id: user.id,
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
    role: 'student' as const,
    email: user.email || '',
    phone: null, degree: null, field_of_study: null,
    current_status: null, city: null, legal_name: null, created_at: '',
  }

  return (
    <div className="min-h-screen bg-[var(--background-soft)]">
      <Navbar user={navUser as UserProfile} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--brand)] tracking-tight">My Profile</h1>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">Manage your personal details and account security.</p>
        </div>
        <ProfileForm profile={navUser as UserProfile} userEmail={user.email ?? ''} />
      </main>
    </div>
  )
}
