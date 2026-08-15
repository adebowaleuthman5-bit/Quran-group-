import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loading, EmptyState, ErrorState } from '@/components/ui/States'
import { MihrabDivider } from '@/components/ui/MihrabDivider'
import type { Dhikr } from '@/lib/types'

export default function Adhkar() {
  const [category, setCategory] = useState<'morning' | 'evening'>('morning')
  const [items, setItems] = useState<Dhikr[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Adhkar | Quran Recitation and Lectures Group'
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    supabase
      .from('adhkar')
      .select('*')
      .eq('status', 'published')
      .eq('category', category)
      .order('display_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setItems((data as Dhikr[]) ?? [])
        setLoading(false)
      })
  }, [category])

  return (
    <div className="container-site py-12">
      <header className="mx-auto max-w-prose text-center">
        <h1 className="text-2xl">Daily Adhkar</h1>
        <p className="mt-2 text-ink/60">Remembrance of Allah for the morning and evening.</p>
      </header>

      <div className="mx-auto mt-6 flex max-w-xs rounded-md border border-sage-200 bg-white p-1">
        {(['morning', 'evening'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-1 rounded-sm px-4 py-2 text-sm font-medium capitalize transition-colors ${
              category === c ? 'bg-green text-white' : 'text-ink/60 hover:bg-sage-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <MihrabDivider />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState title={`No ${category} Adhkar yet`} description="Check back soon." />
      ) : (
        <div className="mx-auto max-w-prose space-y-8">
          {items.map((dhikr, i) => (
            <article key={dhikr.id} className="rounded-lg border border-sage-100 bg-white p-6 shadow-subtle">
              <p className="text-xs font-medium text-ink/40">Dhikr {i + 1}</p>
              <p className="arabic-text mt-3">{dhikr.arabic_text}</p>
              {dhikr.transliteration && <p className="mt-3 text-sm italic text-ink/60">{dhikr.transliteration}</p>}
              <p className="mt-3 leading-relaxed text-ink/85">{dhikr.translation}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink/50">
                {dhikr.repetitions && <span className="badge bg-green-light text-green-deep">Repeat {dhikr.repetitions}×</span>}
                <span>Reference: {dhikr.reference}</span>
              </div>
              {dhikr.explanation && <p className="mt-3 text-sm text-ink/70">{dhikr.explanation}</p>}
              {dhikr.audio_url && (
                <audio controls className="mt-4 w-full">
                  <source src={dhikr.audio_url} />
                </audio>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
