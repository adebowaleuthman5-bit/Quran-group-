import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useSocialLinks, useSiteSettings } from '@/lib/hooks'
import { MihrabDivider } from '@/components/ui/MihrabDivider'
import { HadithGradeBadge } from '@/components/ui/HadithGradeBadge'
import { Loading } from '@/components/ui/States'
import type { QuranPost, HadithPost, Dhikr, Lecture, Executive } from '@/lib/types'

export default function Home() {
  const { data: settings } = useSiteSettings()
  const { data: social } = useSocialLinks()

  const [quran, setQuran] = useState<QuranPost | null>(null)
  const [hadith, setHadith] = useState<HadithPost | null>(null)
  const [morningDhikr, setMorningDhikr] = useState<Dhikr | null>(null)
  const [lecture, setLecture] = useState<Lecture | null>(null)
  const [executives, setExecutives] = useState<Executive[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [q, h, a, l, e] = await Promise.all([
        supabase.from('quran_posts').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('hadith_posts').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('adhkar').select('*').eq('status', 'published').eq('category', 'morning').order('display_order', { ascending: true }).limit(1).maybeSingle(),
        supabase.from('lectures').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('executives').select('*').eq('active', true).order('display_order', { ascending: true }).limit(3),
      ])
      setQuran(q.data as QuranPost | null)
      setHadith(h.data as HadithPost | null)
      setMorningDhikr(a.data as Dhikr | null)
      setLecture(l.data as Lecture | null)
      setExecutives((e.data as Executive[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-sage-100 bg-white">
        <div className="container-site flex flex-col items-center gap-6 py-14 text-center sm:py-20">
          <img src="/logo.jpg" alt="Quran Recitation and Lectures Group logo" className="h-24 w-24 rounded-full object-cover shadow-subtle sm:h-28 sm:w-28" />
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">Quran Recitation and Lectures Group</h1>
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
            <Link to="/questions" className="btn-secondary">Ask an Islamic Question</Link>
          </div>
        </div>
      </section>

      <div className="container-site py-12">
        {loading ? (
          <Loading label="Loading today's content…" />
        ) : (
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Qur'an of the Day */}
            <section aria-labelledby="quran-of-day" className="rounded-lg border border-sage-100 bg-white p-6 shadow-subtle">
              <h2 id="quran-of-day" className="text-lg">Qur'an of the Day</h2>
              {quran ? (
                <div className="mt-4">
                  <p className="text-sm font-medium text-green">{quran.surah_name} {quran.verse_number}</p>
                  <p className="arabic-text mt-3">{quran.arabic_text}</p>
                  <p className="mt-3 text-ink/80">{quran.translation}</p>
                  <p className="mt-2 text-xs text-ink/50">{quran.translation_source}</p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink/50">No verse has been published yet. Check back soon.</p>
              )}
              <Link to="/quran" className="mt-4 inline-block text-sm font-medium text-green hover:underline">Browse all Qur'an posts →</Link>
            </section>

            {/* Hadith of the Day */}
            <section aria-labelledby="hadith-of-day" className="rounded-lg border border-sage-100 bg-white p-6 shadow-subtle">
              <h2 id="hadith-of-day" className="text-lg">Hadith of the Day</h2>
              {hadith ? (
                <div className="mt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-ink/70">{hadith.collection}{hadith.hadith_number ? ` #${hadith.hadith_number}` : ''}</span>
                    <HadithGradeBadge grade={hadith.grade} grader={hadith.grader} />
                  </div>
                  {hadith.arabic_text && <p className="arabic-text mt-3 text-xl">{hadith.arabic_text}</p>}
                  <p className="mt-3 text-ink/80">{hadith.translation}</p>
                  <p className="mt-2 text-xs text-ink/50">{hadith.reference}</p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink/50">No Hadith has been published yet. Check back soon.</p>
              )}
              <Link to="/hadith" className="mt-4 inline-block text-sm font-medium text-green hover:underline">Browse all Hadith →</Link>
            </section>

            {/* Adhkar preview */}
            <section aria-labelledby="adhkar-preview" className="rounded-lg border border-sage-100 bg-white p-6 shadow-subtle">
              <h2 id="adhkar-preview" className="text-lg">Morning Adhkar</h2>
              {morningDhikr ? (
                <div className="mt-4">
                  <p className="arabic-text text-xl">{morningDhikr.arabic_text}</p>
                  <p className="mt-3 text-ink/80">{morningDhikr.translation}</p>
                  {morningDhikr.repetitions && <p className="mt-1 text-xs text-ink/50">Repeat {morningDhikr.repetitions}×</p>}
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink/50">Adhkar will appear here once published.</p>
              )}
              <Link to="/adhkar" className="mt-4 inline-block text-sm font-medium text-green hover:underline">Read morning & evening Adhkar →</Link>
            </section>

            {/* Latest lecture */}
            <section aria-labelledby="latest-lecture" className="rounded-lg border border-sage-100 bg-white p-6 shadow-subtle">
              <h2 id="latest-lecture" className="text-lg">Latest Lecture</h2>
              {lecture ? (
                <div className="mt-4">
                  <p className="font-medium text-ink">{lecture.topic}</p>
                  <p className="text-sm text-ink/60">{lecture.speaker}{lecture.lecture_date ? ` · ${lecture.lecture_date}` : ''}</p>
                  {lecture.description && <p className="mt-2 line-clamp-3 text-sm text-ink/70">{lecture.description}</p>}
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink/50">No lecture updates yet.</p>
              )}
              <Link to="/lectures" className="mt-4 inline-block text-sm font-medium text-green hover:underline">See upcoming & past lectures →</Link>
            </section>
          </div>
        )}

        <MihrabDivider />

        {/* About + executives preview */}
        <div className="grid gap-10 lg:grid-cols-2">
          <section aria-labelledby="about-preview">
            <h2 id="about-preview" className="text-lg">About the Group</h2>
            <p className="mt-3 text-ink/70">
              {settings?.about_text ?? 'A community centered on Qur\'an recitation, authentic Hadith, Adhkar, and beneficial Islamic lectures.'}
            </p>
            <Link to="/about" className="mt-3 inline-block text-sm font-medium text-green hover:underline">Read more about us →</Link>
          </section>

          <section aria-labelledby="executives-preview">
            <h2 id="executives-preview" className="text-lg">Meet the Executives</h2>
            {executives.length > 0 ? (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {executives.map((ex) => (
                  <div key={ex.id} className="text-center">
                    <img
                      src={ex.photo_url ?? '/logo.jpg'}
                      alt={ex.name}
                      className="mx-auto h-16 w-16 rounded-full object-cover"
                    />
                    <p className="mt-2 text-xs font-medium text-ink">{ex.name}</p>
                    <p className="text-xs text-ink/50">{ex.position}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink/50">Executive profiles will appear here soon.</p>
            )}
            <Link to="/about" className="mt-4 inline-block text-sm font-medium text-green hover:underline">Meet the full team →</Link>
          </section>
        </div>
      </div>
    </div>
  )
}
