import { requireAdmin } from '@/lib/supabase/helpers'
import Navbar from '@/components/Navbar'
import ProfileForm from '@/app/dashboard/profile/ProfileForm'

export default async function AdminProfilePage() {
  const { supabase, profile } = await requireAdmin()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[var(--background-soft)]">
      <Navbar user={profile} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--brand)] tracking-tight">My Profile</h1>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">Manage your personal details and account security.</p>
        </div>
        <ProfileForm profile={profile} userEmail={user?.email ?? ''} />
      </main>
    </div>
  )
}
