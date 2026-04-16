import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BarChart2,
  BookOpen,
  BrainCircuit,
  Clock,
  Code2,
  Cpu,
  PlayCircle,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { Course, UserProfile } from '@/lib/supabase/types'
import Image from 'next/image'

const domainIcons: Record<string, LucideIcon> = {
  'Data Science': BarChart2,
  'Machine Learning': BrainCircuit,
  'Artificial Intelligence': Cpu,
  'Web Development': Code2,
}

const domainPalette: Record<string, { bg: string; text: string; dot: string }> = {
  'Data Science':       { bg: '#e8f5ee', text: '#15603a', dot: '#34a853' },
  'Machine Learning':   { bg: '#fef3e8', text: '#8a3f1d', dot: '#f08242' },
  'Artificial Intelligence': { bg: '#eff3ff', text: '#3730a3', dot: '#6366f1' },
  'Web Development':    { bg: '#f0faf4', text: '#166534', dot: '#22c55e' },
}

const platformFeatures = [
  {
    icon: Zap,
    title: 'Structured 6-8 week training programs',
    desc: 'Every program follows a sprint-based format — weekly modules, graded assignments, and clear milestones built for real skill development.',
  },
  {
    icon: Award,
    title: 'Certificate-backed outcomes',
    desc: 'Complete your training and earn a verified Margros certificate that proves industry-ready skills.',
  },
  {
    icon: Users,
    title: 'Industry-expert trainers',
    desc: 'Train under practitioners actively building and deploying real data, AI, and web systems.',
  },
]

const stats = [
  { value: '6-8W', label: 'Program length' },
  { value: '4', label: 'Career tracks' },
  { value: '100%', label: 'Certificate path' },
]

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>
}) {
  const supabase = await createClient()
  const { domain } = await searchParams

  const coursesQuery = supabase.from('courses').select('*').order('created_at', { ascending: false })
  const { data: coursesRaw } = domain
    ? await coursesQuery.eq('domain', domain)
    : await coursesQuery
  const courses = (coursesRaw ?? []) as Course[]

  const { data: allCoursesRaw } = await supabase.from('courses').select('domain')
  const allCourseDomains = (allCoursesRaw ?? []) as Array<{ domain: string }>
  const domains = [...new Set(allCourseDomains.map((c) => c.domain).filter(Boolean))]

  const { data: { user } } = await supabase.auth.getUser()
  let profile: UserProfile | null = null
  let navUser = null
  
  if (user) {
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
    profile = data as UserProfile | null
    
    navUser = profile || {
      id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
      role: 'student',
      email: user.email || ''
    } as any
  }

  const domainList = domains.length > 0 ? domains : Object.keys(domainIcons)

  return (
    <div className="min-h-screen bg-white text-[var(--foreground)]">
      <Navbar user={navUser} />

      <main>
        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="bg-[var(--brand)] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-16 lg:pb-28">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left copy */}
              <div>
                <h1 className="font-display text-5xl sm:text-6xl lg:text-[5rem] leading-[1.05] tracking-[-0.03em] text-white">
                  Your professional{' '}
                  <span className="text-[var(--accent)]">training</span>{' '}
                  starts here.
                </h1>

                <p className="mt-6 text-lg leading-8 text-white/75 max-w-xl">
                  Margros delivers structured 6-8 week training programs in data, AI, machine learning, and
                  web development — hands-on, outcome-driven, and built for the industry.
                </p>

                <div className="mt-8 sm:mt-10 flex flex-wrap gap-3">
                  <a
                    href="#courses"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent)] text-[#10261f] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    Explore programs
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/15 transition-colors"
                  >
                    Start for free
                    <PlayCircle className="h-4 w-4" />
                  </Link>
                </div>

                {/* Mini stats */}
                <div className="mt-8 sm:mt-12 flex flex-wrap gap-6 sm:gap-8">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <div className="text-3xl font-bold text-white tracking-tight">{s.value}</div>
                      <div className="mt-0.5 text-xs font-medium text-white/55 uppercase tracking-widest">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right hero image */}
              <div className="relative flex items-end justify-center pt-2 lg:pt-0">
                <div className="absolute bottom-0 left-1/2 h-1/2 w-3/4 -translate-x-1/2 rounded-full bg-[var(--accent)]/15 blur-3xl" />
                <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[1.5rem] shadow-2xl sm:rounded-[2rem] lg:max-w-lg">
                  <Image
                    src="/hero.png"
                    alt="Student learning on Margros"
                    width={580}
                    height={440}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ────────────────────────────────────────────── */}
        <section className="border-b border-[var(--border)] bg-[var(--background-soft)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm font-medium text-[var(--foreground-muted)]">
                Industry-grade training. Structured delivery. Real outcomes.
              </p>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-4 sm:gap-8">
                {[
                  { value: `${courses.length || '0'}+`, label: 'Programs live' },
                  { value: `${domainList.length}`, label: 'Career tracks' },
                  { value: '8 weeks', label: 'Per program' },
                  { value: '100%', label: 'Certificate path' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-xl font-bold text-[var(--brand)] leading-none">{s.value}</div>
                    <div className="text-[11px] text-[var(--foreground-subtle)] mt-1 uppercase tracking-widest">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PLATFORM FEATURES ────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="section-label mb-3">Why Margros</p>
              <h2 className="font-display text-4xl sm:text-5xl leading-tight tracking-[-0.03em] text-[var(--brand)]">
                Training that builds real capability.
              </h2>
              <p className="mt-4 text-base leading-7 text-[var(--foreground-muted)]">
                We combine structured eight-week training programs with hands-on projects and expert mentorship — built to produce job-ready professionals.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {platformFeatures.map((f) => (
                <div
                  key={f.title}
                  className="border border-[var(--border)] rounded-2xl p-6 sm:p-8 hover:border-[var(--brand)]/30 hover:shadow-[0_8px_30px_rgba(23,53,43,0.07)] transition-all duration-200"
                >
                  <div className="h-11 w-11 rounded-xl bg-[var(--brand)] text-[#f3d4b8] flex items-center justify-center mb-5">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--brand)] mb-2">{f.title}</h3>
                  <p className="text-sm leading-7 text-[var(--foreground-muted)]">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COURSE CATALOGUE ─────────────────────────────────────── */}
        <section id="courses" className="bg-[var(--brand)] py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 sm:mb-10">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#f3d4b8]">Program library</p>
                <h2 className="font-display text-4xl sm:text-5xl leading-tight tracking-[-0.03em] text-white">
                  {domain
                    ? `${domain} programs`
                    : 'Browse all programs'}
                </h2>
                <p className="mt-3 text-base text-white/70 max-w-lg">
                  Explore hands-on training tracks across data science, machine learning, AI, and web development.
                </p>
              </div>

              {/* Inline stat pill */}
              <div className="flex items-center gap-6 shrink-0 rounded-2xl border border-white/15 bg-white/8 px-6 py-4 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{String(courses.length).padStart(2, '0')}</div>
                  <div className="text-[11px] uppercase tracking-widest text-white/45 mt-0.5">Programs</div>
                </div>
                <div className="w-px h-8 bg-white/15" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{String(domainList.length).padStart(2, '0')}</div>
                  <div className="text-[11px] uppercase tracking-widest text-white/45 mt-0.5">Tracks</div>
                </div>
              </div>
            </div>

            {/* Domain filter pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              <Link
                  href="/#courses"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    !domain
                      ? 'bg-[var(--accent)] text-[#10261f] border-transparent'
                      : 'bg-white/8 text-white/70 border-white/12 hover:border-white/25 hover:text-white'
                  }`}
                >
                All programs
              </Link>
              {domainList.map((d) => (
                <Link
                  key={d}
                  href={`/?domain=${encodeURIComponent(d)}#courses`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    domain === d
                      ? 'bg-[var(--accent)] text-[#10261f] border-transparent'
                      : 'bg-white/8 text-white/70 border-white/12 hover:border-white/25 hover:text-white'
                  }`}
                >
                  {d}
                </Link>
              ))}
            </div>

            {/* Course grid */}
            {courses.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course) => {
                  const Icon = domainIcons[course.domain] ?? BookOpen
                  const palette = domainPalette[course.domain] ?? { bg: '#f0f4f2', text: '#17352b', dot: '#17352b' }

                  return (
                    <Link key={course.id} href={`/courses/${course.id}`} className="group block">
                      <article className="h-full overflow-hidden rounded-2xl border border-white/12 bg-white/8 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-[var(--accent)]/50 hover:shadow-[0_18px_55px_rgba(0,0,0,0.22)]">
                        {/* Card header strip */}
                        <div
                          className="h-2 w-full"
                          style={{ background: palette.dot }}
                        />

                        <div className="p-6">
                          {/* Domain badge */}
                          <div
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
                            style={{ background: palette.bg, color: palette.text }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {course.domain}
                          </div>

                          <h3 className="text-lg font-semibold leading-snug text-white group-hover:text-[#f3d4b8] mb-3 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm leading-6 text-white/65 line-clamp-3 mb-6">
                            {course.description}
                          </p>

                          {/* Meta row */}
                          <div className="flex items-center gap-4 pt-5 border-t border-white/12">
                            <div className="flex items-center gap-1.5 text-xs text-white/45">
                              <Users className="h-3.5 w-3.5" />
                              {course.instructor_name}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-white/45">
                              <Clock className="h-3.5 w-3.5" />
                              {course.duration}
                            </div>
                            <div className="ml-auto flex items-center gap-1 text-xs font-semibold text-[#f3d4b8] group-hover:gap-2 transition-all">
                              View <ArrowRight className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  )
                })}
              </div>
            ) : (
              /* Empty state */
              <div className="rounded-3xl border border-white/12 bg-white/8 p-12 text-center backdrop-blur-sm">
                <div className="mx-auto w-20 h-20 mb-6">
                  <Image
                    src="/logo.png"
                    alt="Margros"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <h3 className="font-display text-3xl text-white mb-3">
                  Programs launching soon.
                </h3>
                <p className="text-sm leading-7 text-white/65 max-w-md mx-auto mb-8">
                  Our first cohort of programs is being prepared. Sign up now to be the first to know when they go live.
                </p>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent)] text-[#10261f] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <p className="section-label mb-3">The Margros flow</p>
                <h2 className="font-display text-4xl sm:text-5xl leading-tight tracking-[-0.03em] text-[var(--brand)] mb-5">
                  Three steps to industry readiness.
                </h2>
                <p className="text-base leading-7 text-[var(--foreground-muted)]">
                  Our training programs are built around clear progression — from choosing a track to earning a verified certificate that proves your capability.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: '01',
                    title: 'Choose your training track',
                    copy: 'Pick from data science, ML, AI, or web development. Each track is purpose-built with no filler — only what the industry demands.',
                  },
                  {
                    step: '02',
                    title: 'Train in structured weekly sprints',
                    copy: 'Each week combines video modules, hands-on exercises, and direct feedback from expert trainers.',
                  },
                  {
                    step: '03',
                    title: 'Earn a verified certificate',
                    copy: 'Complete your training, pass assessments, and receive a Margros certificate that proves real-world readiness.',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex gap-5 border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--brand)]/30 transition-colors"
                  >
                    <div className="text-2xl font-bold text-[var(--accent)] shrink-0 leading-none mt-0.5 w-8">
                      {item.step}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--brand)] mb-1">{item.title}</div>
                      <p className="text-sm leading-6 text-[var(--foreground-muted)]">{item.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ───────────────────────────────────────────── */}
        <section
          className="relative py-28 overflow-hidden"
          style={{
            backgroundImage: 'url(/banner.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundAttachment: 'fixed',
          }}
        >
          {/* Dark overlay across the full section */}
          <div className="absolute inset-0 bg-[var(--brand)]/70" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="section-label text-[var(--accent)] mb-4">Get started</p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-[-0.03em] text-white mb-6">
              Ready to get trained for what matters?
            </h2>
            <p className="text-white/70 text-base leading-7 max-w-xl mx-auto mb-10">
              Join Margros today — free to sign up, structured to train, built to produce professionals.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[var(--accent)] text-[#10261f] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#courses"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/15 transition-colors"
              >
                Browse programs
              </a>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer className="bg-white border-t border-[var(--border)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Margros" width={28} height={28} className="h-7 w-7 object-contain" />
              <span className="font-display text-base text-[var(--brand)]">Margros</span>
            </div>
            <p className="text-xs text-[var(--foreground-subtle)]">
              © {new Date().getFullYear()} Margros PVT LTD. All rights reserved.
            </p>
            <nav className="flex items-center gap-5 text-xs text-[var(--foreground-muted)]">
              <Link href="/#courses" className="hover:text-[var(--brand)] transition-colors">Programs</Link>
              <Link href="/auth/login" className="hover:text-[var(--brand)] transition-colors">Log in</Link>
              <a href="mailto:margrosmarketing@gmail.com" className="hover:text-[var(--brand)] transition-colors">Contact</a>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  )
}
