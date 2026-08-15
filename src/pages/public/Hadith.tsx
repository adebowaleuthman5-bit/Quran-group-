import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loading, EmptyState, ErrorState } from '@/components/ui/States'
import { MihrabDivider } from '@/components/ui/MihrabDivider'
import { HadithGradeBadge } from '@/components/ui/HadithGradeBadge'
import type { HadithPost } from '@/lib/types'

const PAGE_SIZE = 8

export default function Hadith() {
  const [posts, setPosts] = useState<HadithPost[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Hadith | Quran Recitation and Lectures Group'
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    let query = supabase
      .from('hadith_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

    if (search.trim()) {
      query = query.or(`translation.ilike.%${search}%,collection.ilike.%${search}%`)
    }

    query.then(({ data, error }) => {
      if (error) {
        setError(error.message)
      } else {
        const rows = (data as HadithPost[]) ?? []
        setHasMore(rows.length > PAGE_SIZE)
        setPosts(rows.slice(0, PAGE_SIZE))
      }
      setLoading(false)
    })
  }, [page, search])

  return (
    <div className="container-site py-12">
      <header className="mx-auto max-w-prose text-center">
        <h1 className="text-2xl">Hadith</h1>
        <p className="mt-2 text-ink/60">Every Hadith is shown with its collection, reference, and authenticity grade.</p>
      </header>

      <div className="mx-auto mt-6 max-w-md">
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          placeholder="Search by collection or text…"
          className="field-input"
          aria-label="Search Hadith posts"
        />
      </div>

      <MihrabDivider />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} />
      ) : posts.length === 0 ? (
        <EmptyState title="No Hadith found" description="Try a different search, or check back soon for new posts." />
      ) : (
        <div className="mx-auto max-w-prose space-y-10">
          {posts.map((post) => (
            <article key={post.id} className="border-b border-sage-100 pb-10 last:border-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-green-deep">
                  {post.collection}{post.hadith_number ? ` #${post.hadith_number}` : ''}
                </h2>
                <HadithGradeBadge grade={post.grade} grader={post.grader} />
              </div>
              {post.arabic_text && <p className="arabic-text mt-4 text-xl">{post.arabic_text}</p>}
              <p className="mt-4 leading-relaxed text-ink/85">{post.translation}</p>
              {post.explanation && (
                <div className="mt-4 rounded-md bg-sage-50 p-4 text-sm text-ink/75">
                  <p className="mb-1 font-medium text-ink/60">Explanation</p>
                  {post.explanation}
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink/40">
                <span>Reference: {post.reference}</span>
                {post.source_url && (
                  <a href={post.source_url} target="_blank" rel="noopener noreferrer" className="btn-secondary !px-3 !py-1 text-xs">
                    View Source
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="mt-8 flex justify-center gap-3">
          <button className="btn-secondary" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Previous
          </button>
          <button className="btn-secondary" disabled={!hasMore} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  )
}
