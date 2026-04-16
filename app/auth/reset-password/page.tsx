'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setDone(true)
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
          <h1 className="text-2xl font-bold text-[var(--brand)] tracking-tight">Set new password</h1>
          <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">Choose a strong password for your account.</p>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-2xl shadow-[0_4px_20px_rgba(23,53,43,0.06)] p-8">
          {done ? (
            <div className="text-center space-y-5">
              <div className="mx-auto h-16 w-16 rounded-full bg-[var(--success-soft)] flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-[var(--success)]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--brand)]">Password updated!</h2>
                <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">
                  Your password has been changed successfully.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="block w-full bg-[var(--brand)] text-[#fbf6ee] py-2.5 rounded-lg text-sm font-semibold text-center hover:bg-[var(--brand-hover)] transition-colors"
              >
                Go to log in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">New Password</label>
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
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your new password"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--foreground-subtle)] hover:text-[var(--foreground)]"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
