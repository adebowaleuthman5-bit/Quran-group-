import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useSocialLinks, useSiteSettings } from '@/lib/hooks'
import { MihrabDivider } from '@/components/ui/MihrabDivider'
import { ShareButton } from '@/components/ui/ShareButton'
import { LectureCountdown } from '@/components/ui/LectureCountdown'
import { Loading } from '@/components/ui/States'
import type { Post, Lecture, Quiz } from '@/lib/types'

async function fetchLatestByCategory(category: string) {
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .eq('category', category)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as Post | null
}

function FeaturedPost({ label, post }: { label: string; post: Post | null }) {
  return (
    <section className="rounded-lg border border-sage-100 bg-surface p-6 shadow-subtle">
      <h2 className="font-display text-base text-green-deep">{label}</h2>
      {post ? (
        <div className="mt-3">
          <p className="font-medium text-ink">{post.title}</p>
          {post.image_url && (
            <img src={post.image_url} alt={post.title} className="mt-3 w-full rounded-md object-cover" loading="lazy" />
          )}
          <p className="mt-3 whitespace-pre-line leading-relaxed text-ink/80">{post.body}</p>
          <div className="mt-4">
            <ShareButton title={post.title} text={post.body.slice(0, 120)} />
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink/50">Nothing published here yet. Check back soon.</p>
      )}
    </section>
  )
}

export default function Home() {
  const { data: settings } = useSiteSettings()
  const { data: social } = useSocialLinks()

  const [verse, setVerse] = useState<Post | null>(null)
  const [dua, setDua] = useState<Post | null>(null)
  const [adhkar, setAdhkar] = useState<Post | null>(null)
  const [dailyPosts, setDailyPosts] = useState<Post[]>([])
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [nextLecture, setNextLecture] = useState<Lecture | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [expandedLecture, setExpandedLecture] = useState<string | null>(null)
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [v, d, a, posts, lecturesRes, quizzesRes] = await Promise.all([
        fetchLatestByCategory('verse'),
        fetchLatestByCategory('dua'),
        fetchLatestByCategory('adhkar'),
        supabase.from('posts').select('*').eq('status', 'published').eq('category', 'post').order('published_at', { ascending: false }).limit(3),
        supabase.from('lectures').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(3),
        supabase.from('quizzes').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(4),
      ])
      setVerse(v)
      setDua(d)
      setAdhkar(a)
      setDailyPosts((posts.data as Post[]) ?? [])
      const lectureRows = (lecturesRes.data as Lecture[]) ?? []
      setLectures(lectureRows)
      const upcoming = lectureRows.find(
        (l) => l.lecture_status === 'upcoming' && l.lecture_datetime && new Date(l.lecture_datetime).getTime() > Date.now()
      )
      setNextLecture(upcoming ?? null)
      setQuizzes((quizzesRes.data as Quiz[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-sage-100 bg-green-light/50">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface/40 via-transparent to-surface/60" aria-hidden="true" />
        <div className="container-site relative flex flex-col items-center gap-6 py-14 text-center sm:py-20">
          <img src="/logo.jpg" alt="Quran Recitation and Lectures Group logo" className="h-24 w-24 rounded-full object-cover shadow-subtle sm:h-28 sm:w-28" />
          <div>
            <h1 className="brand-name text-2xl sm:text-4xl">Quran Recitation and Lectures Group</h1>
            <p className="mx-auto mt-3 max-w-prose text-ink/70">
              {settings?.intro_text ?? "A community for Qur'an recitation, authentic Islamic learning, and beneficial lectures."}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {social?.whatsapp_general && (
              <a href={social.whatsapp_general} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                Join Our WhatsApp Group
              </a>
            )}
            <Link to="/qa" className="btn-secondary">Ask an Islamic Question</Link>
          </div>
        </div>
      </section>

      <div className="container-site space-y-10 py-12">
        {loading ? (
          <Loading label="Loading today's content…" />
        ) : (
          <>
            <FeaturedPost label="Today's Verse" post={verse} />
            <FeaturedPost label="Daily Dua" post={dua} />
            <FeaturedPost label="Daily Adhkar" post={adhkar} />

            <MihrabDivider />

            {/* Daily Post feed */}
            <section aria-labelledby="daily-post">
              <h2 id="daily-post" className="text-lg">Daily Post</h2>
              {dailyPosts.length === 0 ? (
                <p className="mt-4 text-sm text-ink/50">No posts have been published yet. Check back soon.</p>
              ) : (
                <div className="mt-4 space-y-6">
                  {dailyPosts.map((post) => (
                    <article key={post.id} className="rounded-lg border border-sage-100 bg-surface p-6 shadow-subtle">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-display text-base font-semibold text-green-deep">{post.title}</h3>
                        <time className="shrink-0 text-xs text-ink/40">
                          {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
                        </time>
                      </div>
                      {post.image_url && (
                        <img src={post.image_url} alt={post.title} className="mt-3 w-full rounded-md object-cover" loading="lazy" />
                      )}
                      <p className="mt-3 whitespace-pre-line leading-relaxed text-ink/80">{post.body}</p>
                      <div className="mt-4">
                        <ShareButton title={post.title} text={post.body.slice(0, 120)} />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <MihrabDivider />

            {/* Lectures Update */}
            <section aria-labelledby="lectures-update">
              <h2 id="lectures-update" className="text-lg">Lectures Update</h2>

              {nextLecture && (
                <div className="mt-4 max-w-sm">
                  <LectureCountdown lecture={nextLecture} />
                </div>
              )}

              {lectures.length === 0 ? (
                <p className="mt-4 text-sm text-ink/50">No lecture updates yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {lectures.map((lec) => (
                    <div key={lec.id} className="rounded-lg border border-sage-100 bg-surface p-5 shadow-subtle">
                      <button
                        onClick={() => setExpandedLecture(expandedLecture === lec.id ? null : lec.id)}
                        className="flex w-full items-center justify-between gap-3 text-left"
                      >
                        <div>
                          <p className="font-medium text-ink">{lec.topic}</p>
                          <p className="text-sm text-ink/60">{lec.speaker}{lec.lecture_date ? ` · ${lec.lecture_date}` : ''}</p>
                        </div>
                        <span className={`badge shrink-0 ${lec.lecture_status === 'upcoming' ? 'badge-sahih' : 'bg-sage-100 text-ink/60'}`}>
                          {lec.lecture_status === 'upcoming' ? 'Upcoming' : 'Completed'}
                        </span>
                      </button>
                      {expandedLecture === lec.id && (
                        <div className="mt-4 border-t border-sage-100 pt-4">
                          {lec.description && <p className="text-sm text-ink/70">{lec.description}</p>}
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <Link to={`/lectures/${lec.id}`} className="btn-secondary !px-3 !py-1.5 text-xs">
                              View full lecture
                            </Link>
                            <ShareButton title={lec.topic} text={lec.description ?? undefined} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <MihrabDivider />

            {/* Quizzes */}
            <section aria-labelledby="quizzes">
              <h2 id="quizzes" className="text-lg">Quizzes</h2>
              {quizzes.length === 0 ? (
                <p className="mt-4 text-sm text-ink/50">No quizzes yet. Check back soon.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {quizzes.map((q) => (
                    <div key={q.id} className="rounded-lg border border-sage-100 bg-surface p-5 shadow-subtle">
                      <button
                        onClick={() => setExpandedQuiz(expandedQuiz === q.id ? null : q.id)}
                        className="w-full text-left"
                      >
                        <p className="font-display text-base text-green-deep">{q.title}</p>
                      </button>
                      {expandedQuiz === q.id && (
                        <div className="mt-3 border-t border-sage-100 pt-3">
                          {q.description && <p className="text-sm text-ink/70">{q.description}</p>}
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <Link to={`/quizzes/${q.id}`} className="btn-primary !px-4 !py-2 text-xs">
                              Start Quiz
                            </Link>
                            <ShareButton title={q.title} text={q.description ?? undefined} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
