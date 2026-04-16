'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  submissionId: string
  maxScore: number
  response: string | null
  fileUrl: string | null
}

export default function GradingPanel({ submissionId, maxScore, response, fileUrl }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function handleGrade(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('submissions')
      .update({
        manual_score: Number(score),
        admin_feedback: feedback,
        graded_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
    setLoading(false)
    router.refresh()
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs font-medium text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors"
      >
        Grade this submission
      </button>
    )
  }

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-4 mt-2">
      {response && (
        <div className="mb-3 bg-[var(--background-soft)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--foreground)] max-h-32 overflow-y-auto">
          <div className="text-xs font-medium text-[var(--foreground-subtle)] mb-1">Student Response:</div>
          {response}
        </div>
      )}
      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors mb-3"
        >
          <ExternalLink className="w-3.5 h-3.5" /> View submitted file
        </a>
      )}
      <form onSubmit={handleGrade} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1">
            Score (max {maxScore})
          </label>
          <input
            type="number"
            min={0}
            max={maxScore}
            required
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="input-field"
            placeholder={`0 – ${maxScore}`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1">Feedback</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            placeholder="Write feedback for the student..."
            className="input-field resize-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 bg-[var(--brand)] text-[#fbf6ee] text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Submit Grade
          </button>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors px-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
