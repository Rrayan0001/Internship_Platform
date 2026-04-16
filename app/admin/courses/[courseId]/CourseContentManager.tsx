'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload, Plus, Trash2, Loader2, Video, FileText } from 'lucide-react'

interface Video { id: string; title: string; storage_path: string; duration_seconds: number | null; order_index: number }
interface Assignment { id: string; type: string; prompt: string; options: string[] | null; correct_option: number | null; max_score: number }
interface Week { id: string; week_number: number; title: string; week_videos: Video[]; week_assignments: Assignment[] }

export default function CourseContentManager({ courseId, weeks }: { courseId: string; weeks: Week[] }) {
  // suppress unused variable warning
  void courseId
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(weeks[0] ?? null)
  const [tab, setTab] = useState<'videos' | 'assignments'>('videos')

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Week selector */}
      <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] text-sm font-semibold text-[var(--brand)]">Weeks</div>
        <div className="divide-y divide-[var(--border)]">
          {weeks.map((week) => (
            <button
              key={week.id}
              onClick={() => setSelectedWeek(week)}
              className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                selectedWeek?.id === week.id
                  ? 'bg-[var(--background-soft)] text-[var(--brand)] font-medium border-r-2 border-[var(--brand)]'
                  : 'text-[var(--foreground-muted)] hover:bg-[var(--background-soft)]'
              }`}
            >
              <div>Week {week.week_number}: {week.title}</div>
              <div className="text-xs text-[var(--foreground-subtle)] mt-0.5">
                {week.week_videos?.length ?? 0} videos · {week.week_assignments?.length ?? 0} questions
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content manager */}
      {selectedWeek && (
        <div className="lg:col-span-2">
          <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="border-b border-[var(--border)] px-5 flex">
              <button
                onClick={() => setTab('videos')}
                className={`py-3.5 text-sm font-medium mr-6 border-b-2 transition-colors ${
                  tab === 'videos'
                    ? 'border-[var(--brand)] text-[var(--brand)]'
                    : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                }`}
              >
                Videos ({selectedWeek.week_videos?.length ?? 0})
              </button>
              <button
                onClick={() => setTab('assignments')}
                className={`py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'assignments'
                    ? 'border-[var(--brand)] text-[var(--brand)]'
                    : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                }`}
              >
                Assignments ({selectedWeek.week_assignments?.length ?? 0})
              </button>
            </div>

            <div className="p-5">
              {tab === 'videos' ? (
                <VideoManager weekId={selectedWeek.id} videos={selectedWeek.week_videos ?? []} />
              ) : (
                <AssignmentManager weekId={selectedWeek.id} assignments={selectedWeek.week_assignments ?? []} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VideoManager({ weekId, videos }: { weekId: string; videos: Video[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !title.trim()) {
      alert('Please enter a video title first')
      return
    }

    setUploading(true)
    const path = `${weekId}/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage.from('videos').upload(path, file)
    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('week_videos').insert({
      week_id: weekId,
      title: title.trim(),
      storage_path: path,
      order_index: videos.length,
    } as any)

    setTitle('')
    setUploading(false)
    router.refresh()
  }

  async function handleDelete(videoId: string, storagePath: string) {
    await supabase.storage.from('videos').remove([storagePath])
    await supabase.from('week_videos').delete().eq('id', videoId)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {videos.sort((a, b) => a.order_index - b.order_index).map((video) => (
        <div key={video.id} className="flex items-center gap-3 bg-[var(--background-soft)] border border-[var(--border)] rounded-xl px-4 py-3">
          <Video className="w-4 h-4 text-[var(--brand)] flex-shrink-0" />
          <span className="text-sm text-[var(--foreground)] flex-1">{video.title}</span>
          {video.duration_seconds && (
            <span className="text-xs text-[var(--foreground-subtle)]">{Math.round(video.duration_seconds / 60)}m</span>
          )}
          <button
            onClick={() => handleDelete(video.id, video.storage_path)}
            className="text-[var(--error)] hover:opacity-70 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Upload new */}
      <div className="border-2 border-dashed border-[var(--border-strong)] rounded-xl p-5">
        <div className="mb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video title (required before upload)"
            className="input-field"
          />
        </div>
        <label className={`flex items-center justify-center gap-2 cursor-pointer text-sm font-medium transition-colors ${uploading ? 'text-[var(--foreground-subtle)]' : 'text-[var(--brand)] hover:text-[var(--brand-hover)]'}`}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload Video'}
          <input type="file" accept="video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
    </div>
  )
}

function AssignmentManager({ weekId, assignments }: { weekId: string; assignments: Assignment[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'mcq' | 'dev_task' | 'case_study' | 'short_answer'>('mcq')
  const [prompt, setPrompt] = useState('')
  const [maxScore, setMaxScore] = useState(100)
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctOption, setCorrectOption] = useState(0)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from('week_assignments').insert({
      week_id: weekId,
      type,
      prompt,
      max_score: maxScore,
      options: type === 'mcq' ? options.filter((o) => o.trim()) : null,
      correct_option: type === 'mcq' ? correctOption : null,
      order_index: assignments.length,
    } as any)

    setPrompt('')
    setOptions(['', '', '', ''])
    setCorrectOption(0)
    setShowForm(false)
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    await supabase.from('week_assignments').delete().eq('id', id)
    router.refresh()
  }

  const typeLabel: Record<string, string> = {
    mcq: 'MCQ',
    dev_task: 'Dev Task',
    case_study: 'Case Study',
    short_answer: 'Short Answer',
  }

  return (
    <div className="space-y-4">
      {assignments.map((a, idx) => (
        <div key={a.id} className="bg-[var(--background-soft)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="w-6 h-6 bg-[var(--brand)] text-[#f3d4b8] text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            {idx + 1}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold text-[var(--foreground-muted)] bg-white border border-[var(--border)] px-2 py-0.5 rounded-full">
                {typeLabel[a.type]}
              </span>
              <span className="text-xs text-[var(--foreground-subtle)]">{a.max_score} pts</span>
            </div>
            <p className="text-sm text-[var(--foreground)]">{a.prompt}</p>
          </div>
          <button
            onClick={() => handleDelete(a.id)}
            className="text-[var(--error)] hover:opacity-70 transition-opacity flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleAdd} className="border border-[var(--border)] rounded-xl p-4 space-y-4 bg-[var(--background-soft)]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="input-field"
              >
                <option value="mcq">MCQ</option>
                <option value="short_answer">Short Answer</option>
                <option value="dev_task">Dev Task</option>
                <option value="case_study">Case Study</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1">Max Score</label>
              <input
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1">Question / Prompt</label>
            <textarea
              required
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter the question..."
              className="input-field resize-none"
            />
          </div>

          {type === 'mcq' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[var(--foreground-muted)]">Options</label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={correctOption === i}
                    onChange={() => setCorrectOption(i)}
                    className="accent-[var(--brand)]"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => setOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))}
                    placeholder={`Option ${i + 1}`}
                    className="input-field flex-1"
                  />
                </div>
              ))}
              <p className="text-xs text-[var(--foreground-subtle)]">Select the radio button next to the correct answer</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 bg-[var(--brand)] text-[#fbf6ee] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Add Question
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors px-2"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <FileText className="w-4 h-4" />
          Add Question
        </button>
      )}
    </div>
  )
}
