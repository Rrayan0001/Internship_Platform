'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, PlayCircle, FileText, ChevronRight, Award, Loader2, Upload, Clock, Menu, X } from 'lucide-react'

interface Video { id: string; title: string; storage_path: string; duration_seconds: number | null; order_index: number }
interface Assignment { id: string; type: string; prompt: string; options: string[] | null; correct_option: number | null; max_score: number }
interface Week { id: string; week_number: number; title: string; week_videos: Video[]; week_assignments: Assignment[] }
interface Progress { video_id: string; watched: boolean; percent_watched: number }
interface Submission { assignment_id: string; response: string | null; auto_score: number | null; manual_score: number | null; admin_feedback: string | null; file_url: string | null }

interface Props {
  enrollment: { id: string; certificate_status: string }
  course: { id: string; title: string; domain: string }
  weeks: Week[]
  videoProgress: Progress[]
  submissions: Submission[]
  userId: string
}

export default function CoursePlayer({ enrollment, course, weeks, videoProgress, submissions, userId }: Props) {
  const supabase = createClient()
  const videoRef = useRef<HTMLVideoElement>(null)

  const [selectedWeek, setSelectedWeek] = useState(weeks[0] ?? null)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(weeks[0]?.week_videos?.[0] ?? null)
  const [activeTab, setActiveTab] = useState<'videos' | 'assignment'>('videos')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [progress, setProgress] = useState<Record<string, Progress>>(
    Object.fromEntries(videoProgress.map(p => [p.video_id, p]))
  )
  const [subs, setSubs] = useState<Record<string, Submission>>(
    Object.fromEntries(submissions.map(s => [s.assignment_id, s]))
  )
  const [requestingCert, setRequestingCert] = useState(false)
  const [certStatus, setCertStatus] = useState(enrollment.certificate_status)

  // Load signed video URL
  useEffect(() => {
    if (!selectedVideo) return
    setLoadingUrl(true)
    setVideoUrl(null)

    supabase.storage
      .from('videos')
      .createSignedUrl(selectedVideo.storage_path, 3600)
      .then(({ data }) => {
        setVideoUrl(data?.signedUrl ?? null)
        setLoadingUrl(false)
      })
  }, [selectedVideo, supabase.storage])

  // Track video progress
  async function handleTimeUpdate() {
    if (!videoRef.current || !selectedVideo) return
    const pct = (videoRef.current.currentTime / (videoRef.current.duration || 1)) * 100

    if (pct >= 90 && !progress[selectedVideo.id]?.watched) {
      // Mark as watched
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('video_progress')
        .upsert({
          user_id: userId,
          video_id: selectedVideo.id,
          enrollment_id: enrollment.id,
          percent_watched: pct,
          watched: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,video_id' })
        .select()
        .single()

      if (data) {
        setProgress(prev => ({ ...prev, [selectedVideo.id]: data }))
      }
    }
  }

  // MCQ submission
  async function handleMCQSubmit(assignment: Assignment, selectedOption: number) {
    const isCorrect = selectedOption === assignment.correct_option
    const score = isCorrect ? assignment.max_score : 0

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('submissions')
      .upsert({
        user_id: userId,
        enrollment_id: enrollment.id,
        assignment_id: assignment.id,
        response: String(selectedOption),
        auto_score: score,
      }, { onConflict: 'user_id,assignment_id' })
      .select()
      .single()

    if (data) setSubs(prev => ({ ...prev, [assignment.id]: data }))
  }

  // Text/short answer submission
  async function handleTextSubmit(assignment: Assignment, text: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('submissions')
      .upsert({
        user_id: userId,
        enrollment_id: enrollment.id,
        assignment_id: assignment.id,
        response: text,
      }, { onConflict: 'user_id,assignment_id' })
      .select()
      .single()

    if (data) setSubs(prev => ({ ...prev, [assignment.id]: data }))
  }

  // File upload submission
  async function handleFileSubmit(assignment: Assignment, file: File) {
    const path = `${userId}/${enrollment.id}/${assignment.id}/${file.name}`
    const { error: uploadError } = await supabase.storage.from('submissions').upload(path, file, { upsert: true })
    if (uploadError) return

    const { data: urlData } = supabase.storage.from('submissions').getPublicUrl(path)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('submissions')
      .upsert({
        user_id: userId,
        enrollment_id: enrollment.id,
        assignment_id: assignment.id,
        file_url: urlData.publicUrl,
      }, { onConflict: 'user_id,assignment_id' })
      .select()
      .single()

    if (data) setSubs(prev => ({ ...prev, [assignment.id]: data }))
  }

  // Request certificate
  async function handleRequestCertificate() {
    setRequestingCert(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('enrollments')
      .update({ certificate_status: 'requested' })
      .eq('id', enrollment.id)
    setCertStatus('requested')
    setRequestingCert(false)
  }

  const totalVideos = weeks.reduce((acc, w) => acc + w.week_videos.length, 0)
  const watchedCount = Object.values(progress).filter(p => p.watched).length
  const overallProgress = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(v => !v)}
        className="md:hidden fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-[var(--brand)] text-white shadow-lg flex items-center justify-center"
        aria-label="Toggle course menu"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-40
        w-72 bg-white border-r border-[var(--border)] flex flex-col overflow-y-auto flex-shrink-0
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Course title */}
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--brand)] text-sm line-clamp-2">{course.title}</h2>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-[var(--foreground-subtle)] mb-1">
              <span>Progress</span><span>{overallProgress}%</span>
            </div>
            <div className="w-full bg-[var(--background-soft)] rounded-full h-1.5">
              <div className="bg-[var(--brand)] h-1.5 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Week list */}
        <div className="flex-1 overflow-y-auto">
          {weeks.map(week => {
            const weekWatched = week.week_videos.filter(v => progress[v.id]?.watched).length
            const weekComplete = weekWatched === week.week_videos.length && week.week_videos.length > 0
            const isSelected = selectedWeek?.id === week.id

            return (
              <div key={week.id}>
                <button
                  onClick={() => { setSelectedWeek(week); setSelectedVideo(week.week_videos[0] ?? null); setActiveTab('videos') }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[var(--background-soft)] transition-colors ${isSelected ? 'bg-[var(--background-soft)] border-r-2 border-[var(--brand)]' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${weekComplete ? 'bg-[var(--success-soft)] text-[var(--success)]' : isSelected ? 'bg-[var(--brand)] text-[#f3d4b8]' : 'bg-[var(--background-soft)] text-[var(--foreground-subtle)]'}`}>
                    {weekComplete ? '✓' : week.week_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[var(--foreground)] truncate">Week {week.week_number}: {week.title}</div>
                    <div className="text-xs text-[var(--foreground-subtle)]">{weekWatched}/{week.week_videos.length} watched</div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 text-[var(--foreground-subtle)] flex-shrink-0 ${isSelected ? 'rotate-90' : ''}`} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Certificate section */}
        {(certStatus === 'eligible' || certStatus === 'requested' || certStatus === 'issued') && (
          <div className="p-4 border-t border-[var(--border)]">
            {certStatus === 'eligible' && (
              <button
                onClick={handleRequestCertificate}
                disabled={requestingCert}
                className="w-full bg-[var(--brand)] text-[#fbf6ee] text-xs font-medium py-2 rounded-lg hover:bg-[var(--brand-hover)] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {requestingCert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                Request Certificate
              </button>
            )}
            {certStatus === 'requested' && (
              <div className="text-xs text-[var(--foreground-muted)] flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5" /> Certificate requested</div>
            )}
            {certStatus === 'issued' && (
              <div className="text-xs text-[var(--success)] flex items-center gap-1.5 font-medium"><Award className="w-3.5 h-3.5" /> Certificate Issued!</div>
            )}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-[var(--background-soft)]">
        {selectedWeek ? (
          <div>
            {/* Tabs */}
            <div className="border-b border-[var(--border)] bg-white px-4 sm:px-6">
              <div className="flex gap-4 sm:gap-6">
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'videos' ? 'border-[var(--brand)] text-[var(--brand)]' : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
                >
                  Videos
                </button>
                <button
                  onClick={() => setActiveTab('assignment')}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'assignment' ? 'border-[var(--brand)] text-[var(--brand)]' : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
                >
                  Assignment
                  {selectedWeek.week_assignments.some(a => subs[a.id]) && (
                    <span className="ml-1.5 w-1.5 h-1.5 bg-[var(--success)] rounded-full inline-block" />
                  )}
                </button>
              </div>
            </div>

            {activeTab === 'videos' ? (
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-[var(--brand)] mb-4 sm:mb-6">Week {selectedWeek.week_number}: {selectedWeek.title}</h2>

                {/* Video Player */}
                {selectedVideo && (
                  <div className="bg-black rounded-2xl overflow-hidden mb-6 aspect-video flex items-center justify-center">
                    {loadingUrl ? (
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    ) : videoUrl ? (
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        className="w-full h-full"
                        onTimeUpdate={handleTimeUpdate}
                      />
                    ) : (
                      <div className="text-white text-sm opacity-60">Video unavailable</div>
                    )}
                  </div>
                )}

                {/* Video list */}
                <div className="space-y-2">
                  {selectedWeek.week_videos.sort((a, b) => a.order_index - b.order_index).map(video => {
                    const watched = progress[video.id]?.watched
                    const isActive = selectedVideo?.id === video.id
                    return (
                      <button
                        key={video.id}
                        onClick={() => setSelectedVideo(video)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-white border border-[var(--brand)]/30 shadow-sm' : 'bg-white border border-[var(--border)] hover:border-[var(--brand)]/30'}`}
                      >
                        {watched ? (
                          <CheckCircle2 className="w-5 h-5 text-[var(--success)] flex-shrink-0" />
                        ) : (
                          <PlayCircle className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[var(--brand)]' : 'text-[var(--foreground-subtle)]'}`} />
                        )}
                        <span className={`text-sm font-medium ${isActive ? 'text-[var(--brand)]' : 'text-[var(--foreground)]'}`}>{video.title}</span>
                        {video.duration_seconds && (
                          <span className="ml-auto text-xs text-[var(--foreground-subtle)]">{Math.round(video.duration_seconds / 60)}m</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-[var(--brand)] mb-4 sm:mb-6">Week {selectedWeek.week_number} Assessment</h2>
                {selectedWeek.week_assignments.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    No assignment for this week
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedWeek.week_assignments.sort((a, b) => (a as {order_index?: number}).order_index! - (b as {order_index?: number}).order_index!).map((assignment, idx) => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        index={idx}
                        submission={subs[assignment.id] ?? null}
                        onMCQSubmit={(opt) => handleMCQSubmit(assignment, opt)}
                        onTextSubmit={(text) => handleTextSubmit(assignment, text)}
                        onFileSubmit={(file) => handleFileSubmit(assignment, file)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a week to begin
          </div>
        )}
      </div>
    </div>
  )
}

// Assignment Card Component
function AssignmentCard({
  assignment,
  index,
  submission,
  onMCQSubmit,
  onTextSubmit,
  onFileSubmit,
}: {
  assignment: Assignment
  index: number
  submission: Submission | null
  onMCQSubmit: (opt: number) => void
  onTextSubmit: (text: string) => void
  onFileSubmit: (file: File) => void
}) {
  const [selectedOpt, setSelectedOpt] = useState<number | null>(
    submission?.response != null ? Number(submission.response) : null
  )
  const [text, setText] = useState(submission?.response ?? '')
  const [submitted, setSubmitted] = useState(!!submission)
  const [loading, setLoading] = useState(false)

  const typeLabel: Record<string, string> = {
    mcq: 'Multiple Choice',
    dev_task: 'Development Task',
    case_study: 'Case Study',
    short_answer: 'Short Answer',
  }

  async function handleSubmit() {
    setLoading(true)
    if (assignment.type === 'mcq' && selectedOpt !== null) {
      await onMCQSubmit(selectedOpt)
    } else if (assignment.type === 'short_answer') {
      await onTextSubmit(text)
    }
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-7 h-7 bg-[var(--brand)] text-[#f3d4b8] text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">{index + 1}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-[var(--foreground-muted)] bg-[var(--background-soft)] px-2 py-0.5 rounded-full border border-[var(--border)]">{typeLabel[assignment.type]}</span>
            <span className="text-xs text-[var(--foreground-subtle)]">{assignment.max_score} pts</span>
          </div>
          <p className="text-[var(--foreground)] text-sm font-medium">{assignment.prompt}</p>
        </div>
      </div>

      {/* Score/feedback if graded */}
      {submission?.auto_score != null && (
        <div className="mb-4 bg-[var(--success-soft)] border border-green-200 rounded-lg px-3 py-2 text-sm text-[var(--success)]">
          Score: {submission.auto_score}/{assignment.max_score}
        </div>
      )}
      {submission?.manual_score != null && (
        <div className="mb-4 bg-[var(--info-soft)] border border-blue-200 rounded-lg px-3 py-2 text-sm text-[var(--info)]">
          Admin score: {submission.manual_score}/{assignment.max_score}
          {submission.admin_feedback && <p className="mt-1">{submission.admin_feedback}</p>}
        </div>
      )}

      {/* MCQ */}
      {assignment.type === 'mcq' && assignment.options && (
        <div className="space-y-2 mb-4">
          {assignment.options.map((opt, i) => (
            <label key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
              selectedOpt === i
                ? submission
                  ? i === assignment.correct_option ? 'border-green-400 bg-[var(--success-soft)]' : 'border-red-400 bg-[var(--error-soft)]'
                  : 'border-[var(--brand)]/40 bg-[var(--background-soft)]'
                : 'border-[var(--border)] hover:border-[var(--brand)]/30'
            }`}>
              <input
                type="radio"
                name={`mcq-${assignment.id}`}
                value={i}
                checked={selectedOpt === i}
                onChange={() => !submitted && setSelectedOpt(i)}
                disabled={submitted}
                className="accent-[var(--brand)]"
              />
              <span className="text-sm text-[var(--foreground)]">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {/* Short answer */}
      {assignment.type === 'short_answer' && (
        <textarea
          value={text}
          onChange={e => !submitted && setText(e.target.value)}
          disabled={submitted}
          rows={4}
          placeholder="Type your answer here..."
          className="input-field resize-none mb-4 disabled:bg-[var(--background-soft)]"
        />
      )}

      {/* Dev task / Case study - file upload */}
      {(assignment.type === 'dev_task' || assignment.type === 'case_study') && (
        <div className="mb-4">
          {submission?.file_url ? (
            <div className="flex items-center gap-2 text-sm text-[var(--success)] bg-[var(--success-soft)] border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4" />
              File submitted
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 border-2 border-dashed border-[var(--border-strong)] rounded-xl py-6 cursor-pointer hover:border-[var(--brand)]/40 transition-colors">
              <Upload className="w-6 h-6 text-[var(--foreground-subtle)]" />
              <span className="text-sm text-[var(--foreground-muted)]">Click to upload file</span>
              <input
                type="file"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) { onFileSubmit(file); setSubmitted(true) }
                }}
              />
            </label>
          )}
        </div>
      )}

      {/* Submit button */}
      {!submitted && (assignment.type === 'mcq' || assignment.type === 'short_answer') && (
        <button
          onClick={handleSubmit}
          disabled={loading || (assignment.type === 'mcq' && selectedOpt === null) || (assignment.type === 'short_answer' && !text.trim())}
          className="bg-[var(--brand)] text-[#fbf6ee] text-sm font-medium px-5 py-2 rounded-lg hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Submit Answer
        </button>
      )}

      {submitted && !submission?.manual_score && !submission?.auto_score && assignment.type !== 'mcq' && (
        <div className="text-xs text-[var(--foreground-subtle)] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Submitted — awaiting admin review</div>
      )}
    </div>
  )
}
