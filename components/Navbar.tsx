'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/lib/supabase/types'
import { LayoutDashboard, LogOut, ShieldCheck, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

type NavbarUser = Pick<UserProfile, 'name' | 'role'> | {
  id?: string
  email?: string
  name?: string | null
  role?: string | null
}

interface NavbarProps {
  user?: NavbarUser | null
  mode?: 'default' | 'hero'
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { label: 'Programs', href: '/' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--border)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link href={user?.role === 'admin' ? '/admin' : '/'} className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/margros-logo.png"
              alt="Margros"
              width={38}
              height={38}
              className="h-9 w-9 object-contain"
            />
            <span className="font-display text-xl leading-none tracking-[-0.03em] text-[var(--brand)]">
              Margros
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {user?.role !== 'admin' && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-[var(--brand)] bg-[var(--background-soft)]'
                    : 'text-[var(--foreground-muted)] hover:text-[var(--brand)] hover:bg-[var(--background-soft)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--brand)] hover:bg-[var(--background-soft)] transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--brand)] hover:bg-[var(--background-soft)] transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                )}

                <div className="h-5 w-px bg-[var(--border)] mx-1" />

                <Link
                  href={user.role === 'admin' ? '/admin/profile' : '/dashboard/profile'}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--background-soft)] border border-[var(--border)] hover:border-[var(--brand)]/30 transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-[var(--brand)] text-[#fbf6ee] text-xs font-bold flex items-center justify-center">
                    {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)] max-w-[120px] truncate">
                    {user.name}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--error)] hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--brand)] hover:bg-[var(--background-soft)] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--accent)] text-[#10261f] hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md text-[var(--foreground-muted)] hover:bg-[var(--background-soft)]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-white px-4 py-4 space-y-1">
          {user?.role !== 'admin' && navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-[var(--brand)] bg-[var(--background-soft)]'
                  : 'text-[var(--foreground-muted)] hover:text-[var(--brand)] hover:bg-[var(--background-soft)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[var(--border)] mt-3 space-y-1">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--brand)] hover:bg-[var(--background-soft)]"
                  >
                    <ShieldCheck className="h-4 w-4" /> Admin
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--brand)] hover:bg-[var(--background-soft)]"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--error)] hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--brand)] hover:bg-[var(--background-soft)]"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-center bg-[var(--accent)] text-[#10261f] hover:bg-[var(--accent-hover)]"
                >
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
