'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const DOMAINS = ['Frontend Development', 'Backend Development', 'Data Science']

interface WeekInput {
  week_number: number
  title: string
}

export default function NewCourseForm() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [domain, setDomain] = useState(DOMAINS[0])
  const [duration, setDuration] = useState('8 weeks')
  const [instructorName, setInstructorName] = useState('')
  const [instructorBio, setInstructorBio] = useState('')
  const [weeks, setWeeks] = useState<WeekInput[]>(
    Array.from({ length: 8 }, (_, i) => ({ week_number: i + 1, title: `Week ${i + 1}` }))
  )

  function updateWeekTitle(index: number, value: string) {
    setWeeks((prev) => prev.map((w, i) => (i === index ? { ...w, title: value } : w)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: course, error: courseError } = await (supabase as any)
      .from('courses')
      .insert({ title, description, domain, duration, instructor_name: instructorName, instructor_bio: instructorBio })
      .select()
      .single()

    if (courseError || !course) {
      setError(courseError?.message ?? 'Failed to create course')
      setLoading(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: weeksError } = await (supabase as any)
      .from('course_weeks')
      .insert(weeks.map((w) => ({ course_id: course.id, week_number: w.week_number, title: w.title })))

    if (weeksError) {
      setError(weeksError.message)
      setLoading(false)
      return
    }

    router.push(`/admin/courses/${course.id}`)
  }

  const labelClass = 'block text-sm font-medium text-[var(--foreground)] mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-white border border-[var(--border)] rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-[var(--brand)]">Course Details</h2>

        <div>
          <label className={labelClass}>Course Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Frontend Development Internship"
            className="input-field"
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what students will learn..."
            className="input-field resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="input-field"
            >
              {DOMAINS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Duration</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Instructor Name</label>
          <input
            type="text"
            required
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
            placeholder="e.g. Dr. Sarah Ahmed"
            className="input-field"
          />
        </div>

        <div>
          <label className={labelClass}>Instructor Bio</label>
          <textarea
            rows={3}
            value={instructorBio}
            onChange={(e) => setInstructorBio(e.target.value)}
            placeholder="Short bio about the instructor..."
            className="input-field resize-none"
          />
        </div>
      </div>

      {/* Week Titles */}
      <div className="bg-white border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-semibold text-[var(--brand)] mb-1">Week Titles</h2>
        <p className="text-sm text-[var(--foreground-muted)] mb-5">
          Set titles for each week. Videos and assignments are added after creating the course.
        </p>
        <div className="space-y-3">
          {weeks.map((week, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-8 h-8 bg-[var(--brand)] text-[#f3d4b8] text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                {week.week_number}
              </span>
              <input
                type="text"
                value={week.title}
                onChange={(e) => updateWeekTitle(idx, e.target.value)}
                className="input-field flex-1"
                placeholder={`Week ${week.week_number} title`}
              />
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-[var(--error)] bg-[var(--error-soft)] px-4 py-3 rounded-lg">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--brand)] text-[#fbf6ee] py-3 rounded-xl font-semibold hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Create Course
      </button>
    </form>
  )
}
