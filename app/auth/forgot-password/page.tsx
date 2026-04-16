'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background-soft)] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/margros-logo.png" alt="Margros" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="font-display text-xl text-[var(--brand)]">Margros</span>
          </Link>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--brand)] tracking-tight">Reset your password</h1>
          <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-[0_4px_20px_rgba(23,53,43,0.06)] p-8">
          {sent ? (
            <div className="text-center space-y-5">
              <div className="mx-auto h-16 w-16 rounded-full bg-[var(--success-soft)] flex items-center justify-center">
                <Mail className="h-7 w-7 text-[var(--success)]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--brand)]">Check your inbox</h2>
                <p className="mt-2 text-sm text-[var(--foreground-muted)] leading-6">
                  We sent a password reset link to <strong className="text-[var(--brand)]">{email}</strong>. The link expires in 1 hour.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to log in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>

              {error && (
                <p className="text-sm text-[var(--error)] bg-[var(--error-soft)] px-4 py-3 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5 rounded-lg mt-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send reset link
              </button>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--brand)] transition-colors py-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to log in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
