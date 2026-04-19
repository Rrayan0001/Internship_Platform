'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2, CheckCircle2, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import Image from 'next/image'

type Step = 'details' | 'otp'

export default function SignupPage() {
  const supabase = createClient()
  const [step, setStep] = useState<Step>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [alreadyExists, setAlreadyExists] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogleSignup() {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setAlreadyExists(false)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: undefined },
    })

    if (error) {
      // Supabase returns this message for duplicate emails
      if (
        error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('user already exists') ||
        error.message.toLowerCase().includes('email already')
      ) {
        setAlreadyExists(true)
      } else {
        setError(error.message)
      }
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // Supabase silently returns a user with empty identities for existing accounts
      setAlreadyExists(true)
    } else {
      setMessage('A 6-digit verification code has been sent to your email.')
      setStep('otp')
    }
    setLoading(false)
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    })

    if (error) {
      setError(error.message)
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-[var(--background-soft)]">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-[var(--brand)] flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Margros" width={40} height={40} className="h-10 w-10 object-contain" />
          <span className="font-display text-2xl text-white leading-none">Margros</span>
        </Link>

        <div className="max-w-sm space-y-5">
          <h2 className="font-display text-3xl text-white leading-snug">
            Join thousands of learners building real-world skills.
          </h2>
          <div className="space-y-3">
            {[
              'Structured 8-week programs',
              'Graded assignments & feedback',
              'Verified certificates on completion',
            ].map((point) => (
              <div key={point} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-[var(--accent)] shrink-0" />
                <span className="text-sm text-white/75">{point}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/30">© {new Date().getFullYear()} Margros</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Margros" width={36} height={36} className="h-9 w-9 object-contain" />
              <span className="font-display text-xl text-[var(--brand)]">Margros</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--brand)] tracking-tight">
              {step === 'details' ? 'Create your account' : 'Verify your email'}
            </h1>
            <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">
              {step === 'details'
                ? 'Free to sign up. Start learning immediately.'
                : `We sent a code to ${email}`}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[var(--border)] shadow-[0_4px_20px_rgba(23,53,43,0.06)] p-8">
            {step === 'details' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 border border-[var(--border-strong)] rounded-lg py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-soft)] transition-colors disabled:opacity-60 mb-6"
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continue with Google
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border)]" />
                  </div>
                  <div className="relative flex justify-center text-xs text-[var(--foreground-subtle)] bg-white px-3">
                    or sign up with email
                  </div>
                </div>
              </>
            )}

            {step === 'details' ? (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Full name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setAlreadyExists(false) }}
                    placeholder="you@example.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--foreground-subtle)] hover:text-[var(--foreground)]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {alreadyExists && (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                    <span>
                      An account with this email already exists.{' '}
                      <Link href="/auth/login" className="font-semibold underline underline-offset-2 hover:text-amber-900 transition-colors">
                        Log in instead
                      </Link>
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
                  Create account
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {message && (
                  <div className="flex items-start gap-3 bg-[var(--success-soft)] text-[var(--success)] px-4 py-3 rounded-lg text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    {message}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                    Verification code
                  </label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="input-field text-center text-2xl tracking-[0.5em] font-bold"
                  />
                </div>

                {error && (
                  <p className="text-sm text-[var(--error)] bg-[var(--error-soft)] px-4 py-3 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-2.5 rounded-lg"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Verify &amp; continue
                </button>

                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-full text-sm text-[var(--foreground-muted)] hover:text-[var(--brand)] transition-colors py-2"
                >
                  ← Back to details
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
