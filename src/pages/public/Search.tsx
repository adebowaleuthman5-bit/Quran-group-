import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Loading, EmptyState } from '@/components/ui/States'
import type { Post, IslamicQuestion, QuestionAnswer } from '@/lib/types'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const [term, setTerm] = useState(params.get('q') ?? '')
  const [posts, setPosts] = useState<Post[]>([])
  const [answers, setAnswers] = useState<{ question: IslamicQuestion; answer: QuestionAnswer }[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    document.title = 'Search | Quran Recitation and Lectures Group'
  }, [])

  useEffect(() => {
    const q = params.get('q')
    if (q && q.trim()) runSearch(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runSearch(query: string) {
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setSearched(true)
    setParams({ q })

    const [postsRes, answersRes] = await Promise.all([
      supabase.from('posts').select('*').eq('status', 'published').or(`title.ilike.%${q}%,body.ilike.%${q}%`).limit(15),
      supabase
        .from('question_answers')
        .select('*, islamic_questions(*)')
        .eq('status', 'published')
        .limit(50),
    ])

    setPosts((postsRes.data as Post[]) ?? [])

    const lowerQ = q.toLowerCase()
    const matchedAnswers = ((answersRes.data ?? []) as any[])
      .filter((row) => row.islamic_questions)
      .map((row) => ({ question: row.islamic_questions as IslamicQuestion, answer: row as QuestionAnswer }))
      .filter(
        ({ question, answer }) =>
          question.question.toLowerCase().includes(lowerQ) || answer.answer.toLowerCase().includes(lowerQ)
      )
    setAnswers(matchedAnswers)
    setLoading(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    runSearch(term)
  }

  const totalResults = posts.length + answers.length

  return (
    <div className="container-site py-12">
      <header className="mx-auto max-w-prose text-center">
        <h1 className="text-2xl">Search</h1>
        <p className="mt-2 text-ink/60">Search posts and published Islamic Q&amp;A.</p>
      </header>

      <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md gap-2">
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search…"
          className="field-input"
          aria-label="Search"
        />
        <button type="submit" className="btn-primary shrink-0">Search</button>
      </form>

      <div className="mx-auto mt-10 max-w-prose">
        {loading ? (
          <Loading />
        ) : !searched ? (
          <p className="text-center text-sm text-ink/40">Enter a search term above.</p>
        ) : totalResults === 0 ? (
          <EmptyState title="No results found" description="Try a different search term." />
        ) : (
          <div className="space-y-10">
            {posts.length > 0 && (
              <section>
                <h2 className="text-lg">Posts</h2>
                <div className="mt-4 space-y-4">
                  {posts.map((post) => (
                    <Link key={post.id} to="/posts" className="block rounded-lg border border-sage-100 bg-white p-4 shadow-subtle hover:border-green/40">
                      <p className="font-medium text-ink">{post.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-ink/60">{post.body}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {answers.length > 0 && (
              <section>
                <h2 className="text-lg">Islamic Q&amp;A</h2>
                <div className="mt-4 space-y-4">
                  {answers.map(({ question, answer }) => (
                    <Link key={question.id} to={`/questions/${question.id}`} className="block rounded-lg border border-sage-100 bg-white p-4 shadow-subtle hover:border-green/40">
                      <p className="font-medium text-ink">{question.question}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-ink/60">{answer.answer}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
