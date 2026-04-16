'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/lib/supabase/types'
import { Loader2, Eye, EyeOff, CheckCircle2, User, Phone, MapPin, GraduationCap, Lock } from 'lucide-react'

interface Props {
  profile: UserProfile
  userEmail: string
}

export default function ProfileForm({ profile, userEmail }: Props) {
  const supabase = createClient()

  // Profile fields
  const [name, setName] = useState(profile.name ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [city, setCity] = useState(profile.city ?? '')
  const [legalName, setLegalName] = useState(profile.legal_name ?? '')
  const [degree, setDegree] = useState(profile.degree ?? '')
  const [fieldOfStudy, setFieldOfStudy] = useState(profile.field_of_study ?? '')
  const [currentStatus, setCurrentStatus] = useState<'student' | 'professional' | ''>(profile.current_status ?? '')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Password fields
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess(false)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('users')
      .update({
        name,
        phone: phone || null,
        city: city || null,
        legal_name: legalName || null,
        degree: degree || null,
        field_of_study: fieldOfStudy || null,
        current_status: currentStatus || null,
      })
      .eq('id', profile.id)

    if (error) {
      setProfileError(error.message)
    } else {
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    }
    setProfileLoading(false)
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    setPasswordLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    }
    setPasswordLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Avatar + email header */}
      <div className="bg-white border border-[var(--border)] rounded-2xl p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-[var(--brand)] text-white text-2xl font-bold flex items-center justify-center shrink-0">
          {name.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <div className="text-lg font-semibold text-[var(--brand)]">{name || 'Your Name'}</div>
          <div className="text-sm text-[var(--foreground-muted)]">{userEmail}</div>
          <div className="text-xs text-[var(--foreground-subtle)] mt-0.5 capitalize">{profile.role}</div>
        </div>
      </div>

      {/* Personal details */}
      <form onSubmit={handleProfileSave} className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-2">
          <User className="h-4 w-4 text-[var(--brand)]" />
          <h2 className="font-semibold text-[var(--brand)]">Personal Details</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Display name <span className="text-[var(--error)]">*</span></label>
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
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Legal name</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="As on government ID"
                className="input-field"
              />
              <p className="text-xs text-[var(--foreground-subtle)] mt-1">Used for certificates</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone number</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> City</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                className="input-field"
              />
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-5">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-4 w-4 text-[var(--brand)]" />
              <span className="text-sm font-semibold text-[var(--brand)]">Academic Background</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Current status</label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value as 'student' | 'professional' | '')}
                  className="input-field"
                >
                  <option value="">Select status</option>
                  <option value="student">Student</option>
                  <option value="professional">Working Professional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Degree</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="B.Tech, MBA, B.Sc…"
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Field of study</label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="Computer Science, Data Science…"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {profileError && (
            <p className="text-sm text-[var(--error)] bg-[var(--error-soft)] px-4 py-3 rounded-lg">{profileError}</p>
          )}
          {profileSuccess && (
            <div className="flex items-center gap-2 text-sm text-[var(--success)] bg-[var(--success-soft)] px-4 py-3 rounded-lg">
              <CheckCircle2 className="h-4 w-4" /> Profile updated successfully
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={profileLoading}
              className="btn-primary px-6 py-2.5 rounded-lg"
            >
              {profileLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </div>
      </form>

      {/* Change password */}
      <form onSubmit={handlePasswordChange} className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-2">
          <Lock className="h-4 w-4 text-[var(--brand)]" />
          <h2 className="font-semibold text-[var(--brand)]">Change Password</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">New password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="input-field pr-10"
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)] hover:text-[var(--foreground)]">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Confirm new password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="input-field pr-10"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)] hover:text-[var(--foreground)]">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {passwordError && (
            <p className="text-sm text-[var(--error)] bg-[var(--error-soft)] px-4 py-3 rounded-lg">{passwordError}</p>
          )}
          {passwordSuccess && (
            <div className="flex items-center gap-2 text-sm text-[var(--success)] bg-[var(--success-soft)] px-4 py-3 rounded-lg">
              <CheckCircle2 className="h-4 w-4" /> Password changed successfully
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={passwordLoading || !newPassword}
              className="btn-primary px-6 py-2.5 rounded-lg"
            >
              {passwordLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Update password
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
