import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loading, EmptyState, ErrorState } from '@/components/ui/States'
import { ShareButton } from '@/components/ui/ShareButton'
import type { Post } from '@/lib/types'

const PAGE_SIZE = 10

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Posts | Quran Recitation and Lectures Group'
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
        } else {
          const rows = (data as Post[]) ?? []
          setHasMore(rows.length > PAGE_SIZE)
          setPosts(rows.slice(0, PAGE_SIZE))
        }
        setLoading(false)
      })
  }, [page])

  return (
    <div className="container-site py-12">
      <header className="mx-auto max-w-prose text-center">
        <h1 className="text-2xl">Posts</h1>
        <p className="mt-2 text-ink/60">Qur'an recitation, Hadith, Adhkar, and reminders shared by the group.</p>
      </header>

      <div className="mx-auto mt-10 max-w-prose">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} />
        ) : posts.length === 0 ? (
          <EmptyState title="No posts yet" description="Check back soon for new content from the group." />
        ) : (
          <div className="space-y-10">
            {posts.map((post) => (
              <article key={post.id} className="border-b border-sage-100 pb-10 last:border-0">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-semibold text-green-deep">{post.title}</h2>
                  <time className="shrink-0 text-xs text-ink/40">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
                  </time>
                </div>
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="mt-4 w-full rounded-lg object-cover"
                    loading="lazy"
                  />
                )}
                <p className="mt-4 whitespace-pre-line leading-relaxed text-ink/85">{post.body}</p>
                <div className="mt-4">
                  <ShareButton title={post.title} text={post.body.slice(0, 120)} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

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
