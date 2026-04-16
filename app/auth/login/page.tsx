'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

const STORAGE_KEY = 'margros_recent_emails'
const MAX_SAVED = 5

function getSavedEmails(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveEmail(email: string) {
  const emails = getSavedEmails().filter((e) => e !== email)
  emails.unshift(email)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(emails.slice(0, MAX_SAVED)))
}

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const suggestionRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Pre-fill last used email on mount
  useEffect(() => {
    const saved = getSavedEmails()
    if (saved.length > 0) setEmail(saved[0])
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleEmailChange(value: string) {
    setEmail(value)
    setActiveSuggestion(-1)
    if (value.trim() === '') {
      const all = getSavedEmails()
      setSuggestions(all)
      setShowSuggestions(all.length > 0)
    } else {
      const filtered = getSavedEmails().filter((e) =>
        e.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    }
  }

  function handleEmailFocus() {
    const all = getSavedEmails()
    if (all.length > 0) {
      const filtered = email.trim()
        ? all.filter((e) => e.toLowerCase().includes(email.toLowerCase()))
        : all
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault()
      setEmail(suggestions[activeSuggestion])
      setShowSuggestions(false)
      setActiveSuggestion(-1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Save email to recent list on successful login
    saveEmail(email)

    const { data: profileRaw, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()
    const profile = profileRaw as { role: string } | null

    console.log('[login] user id:', data.user.id)
    console.log('[login] profile:', profile, 'error:', profileError)

    window.location.href = profile?.role === 'admin' ? '/admin' : '/dashboard'
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex bg-[var(--background-soft)]">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-[var(--brand)] flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/margros-logo.png" alt="Margros" width={40} height={40} className="h-10 w-10 object-contain" />
          <span className="font-display text-2xl text-white leading-none">Margros</span>
        </Link>

        <div className="max-w-sm">
          <blockquote className="font-display text-3xl leading-snug text-white mb-6">
            "The structured format is exactly what I needed to actually finish a program."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[var(--accent)] text-[#10261f] font-bold text-sm flex items-center justify-center">
              S
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Simran P.</div>
              <div className="text-xs text-white/50">Data Science graduate</div>
            </div>
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
              <Image src="/margros-logo.png" alt="Margros" width={36} height={36} className="h-9 w-9 object-contain" />
              <span className="font-display text-xl text-[var(--brand)]">Margros</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--brand)] tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">Log in to continue your learning journey.</p>
          </div>

          <div className="bg-white rounded-2xl border border-[var(--border)] shadow-[0_4px_20px_rgba(23,53,43,0.06)] p-8">
            {/* Google */}
            <button
              onClick={handleGoogleLogin}
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
                or continue with email
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email with autocomplete dropdown */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onFocus={handleEmailFocus}
                    onKeyDown={handleKeyDown}
                    placeholder="you@example.com"
                    className="input-field"
                    autoComplete="off"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul
                      ref={suggestionRef}
                      className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-[var(--border)] rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden"
                    >
                      {suggestions.map((s, i) => (
                        <li
                          key={s}
                          onMouseDown={() => {
                            setEmail(s)
                            setShowSuggestions(false)
                            setActiveSuggestion(-1)
                          }}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                            i === activeSuggestion
                              ? 'bg-[var(--background-soft)] text-[var(--brand)]'
                              : 'text-[var(--foreground)] hover:bg-[var(--background-soft)]'
                          }`}
                        >
                          <div className="h-6 w-6 rounded-full bg-[var(--brand)] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {s.charAt(0).toUpperCase()}
                          </div>
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-[var(--foreground)]">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)] hover:text-[var(--foreground)]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-[var(--error)] bg-[var(--error-soft)] px-4 py-3 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5 rounded-lg mt-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Log in
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-semibold text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
