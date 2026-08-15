import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loading, EmptyState, ErrorState } from '@/components/ui/States'
import { MihrabDivider } from '@/components/ui/MihrabDivider'
import type { Lecture } from '@/lib/types'

export default function Lectures() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all')
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Lectures | Quran Recitation and Lectures Group'
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    let query = supabase.from('lectures').select('*').eq('status', 'published').order('lecture_date', { ascending: false })
    if (filter !== 'all') query = query.eq('lecture_status', filter)
    query.then(({ data, error }) => {
      if (error) setError(error.message)
      else setLectures((data as Lecture[]) ?? [])
      setLoading(false)
    })
  }, [filter])

  return (
    <div className="container-site py-12">
      <header className="mx-auto max-w-prose text-center">
        <h1 className="text-2xl">Lectures</h1>
        <p className="mt-2 text-ink/60">Beneficial lectures delivered through WhatsApp voice notes and recordings.</p>
      </header>

      <div className="mx-auto mt-6 flex max-w-sm rounded-md border border-sage-200 bg-white p-1">
        {(['all', 'upcoming', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-sm px-3 py-2 text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-green text-white' : 'text-ink/60 hover:bg-sage-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <MihrabDivider />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} />
      ) : lectures.length === 0 ? (
        <EmptyState title="No lectures found" description="Check back soon for updates." />
      ) : (
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {lectures.map((lec) => (
            <article key={lec.id} className="overflow-hidden rounded-lg border border-sage-100 bg-white shadow-subtle">
              {lec.poster_url && (
                <img src={lec.poster_url} alt={lec.topic} className="h-40 w-full object-cover" loading="lazy" />
              )}
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`badge ${lec.lecture_status === 'upcoming' ? 'badge-sahih' : 'bg-sage-100 text-ink/60'}`}>
                    {lec.lecture_status === 'upcoming' ? 'Upcoming' : 'Completed'}
                  </span>
                  {lec.lecture_date && <time className="text-xs text-ink/40">{lec.lecture_date}{lec.lecture_time ? ` · ${lec.lecture_time}` : ''}</time>}
                </div>
                <h2 className="mt-2 font-display text-lg text-green-deep">{lec.topic}</h2>
                <p className="text-sm text-ink/60">{lec.speaker}</p>
                {lec.description && <p className="mt-2 text-sm text-ink/70">{lec.description}</p>}
                {lec.test_info && (
                  <p className="mt-2 rounded-md bg-gold-light px-3 py-2 text-xs text-ink/70">Test: {lec.test_info}</p>
                )}
                {lec.recording_url && (
                  <a href={lec.recording_url} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-4 w-fit !px-4 !py-2 text-xs">
                    Listen to recording
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
