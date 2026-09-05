import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Loading, EmptyState, ErrorState } from '@/components/ui/States'
import type { Quiz } from '@/lib/types'

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Quizzes | Quran Recitation and Lectures Group'
  }, [])

  useEffect(() => {
    supabase
      .from('quizzes')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setQuizzes((data as Quiz[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="container-site py-12">
      <header className="mx-auto max-w-prose text-center">
        <h1 className="text-2xl">Islamic Quizzes</h1>
        <p className="mt-2 text-ink/60">Test and strengthen your Islamic knowledge.</p>
      </header>

      <div className="mx-auto mt-10 max-w-prose">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} />
        ) : quizzes.length === 0 ? (
          <EmptyState title="No quizzes yet" description="Check back soon." />
        ) : (
          <div className="space-y-4">
            {quizzes.map((q) => (
              <Link
                key={q.id}
                to={`/quizzes/${q.id}`}
                className="block rounded-lg border border-sage-100 bg-white p-5 shadow-subtle transition-colors hover:border-green/40"
              >
                <h2 className="font-display text-lg text-green-deep">{q.title}</h2>
                {q.description && <p className="mt-1 text-sm text-ink/70">{q.description}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
