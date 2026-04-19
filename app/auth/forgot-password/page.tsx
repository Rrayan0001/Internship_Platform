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
  const [isGoogleAccount, setIsGoogleAccount] = useState(false)

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setIsGoogleAccount(false)

    // Probe if this is a Google-only account before sending reset email
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })

    // If OTP works with no error, user has no password → Google account
    if (!otpError) {
      setIsGoogleAccount(true)
      setLoading(false)
      return
    }

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
            <Image src="/logo.png" alt="Margros" width={36} height={36} className="h-9 w-9 object-contain" />
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
                  onChange={(e) => { setEmail(e.target.value); setIsGoogleAccount(false); setError('') }}
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>

              {isGoogleAccount && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
                  <svg className="h-4 w-4 shrink-0 mt-0.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>
                    This account was created with Google and doesn&apos;t have a password.{' '}
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="font-semibold underline underline-offset-2 hover:text-amber-900 transition-colors"
                    >
                      Sign in with Google instead
                    </button>
                  </span>
                </div>
              )}

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
