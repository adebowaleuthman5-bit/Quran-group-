import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useSocialLinks, useSiteSettings } from '@/lib/hooks'
import { MihrabDivider } from '@/components/ui/MihrabDivider'
import { ShareButton } from '@/components/ui/ShareButton'
import { Loading } from '@/components/ui/States'
import type { Post, Lecture, Executive } from '@/lib/types'

export default function Home() {
  const { data: settings } = useSiteSettings()
  const { data: social } = useSocialLinks()

  const [posts, setPosts] = useState<Post[]>([])
  const [lecture, setLecture] = useState<Lecture | null>(null)
  const [executives, setExecutives] = useState<Executive[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [p, l, e] = await Promise.all([
        supabase.from('posts').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(3),
        supabase.from('lectures').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('executives').select('*').eq('active', true).order('display_order', { ascending: true }).limit(3),
      ])
      setPosts((p.data as Post[]) ?? [])
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
          <Loading label="Loading latest posts…" />
        ) : (
          <section aria-labelledby="latest-posts">
            <div className="flex items-center justify-between">
              <h2 id="latest-posts" className="text-lg">Latest Posts</h2>
              <Link to="/posts" className="text-sm font-medium text-green hover:underline">See all posts →</Link>
            </div>

            {posts.length === 0 ? (
              <p className="mt-4 text-sm text-ink/50">No posts have been published yet. Check back soon.</p>
            ) : (
              <div className="mt-4 space-y-8">
                {posts.map((post) => (
                  <article key={post.id} className="rounded-lg border border-sage-100 bg-white p-6 shadow-subtle">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-base font-semibold text-green-deep">{post.title}</h3>
                      <time className="shrink-0 text-xs text-ink/40">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
                      </time>
                    </div>
                    {post.image_url && (
                      <img src={post.image_url} alt={post.title} className="mt-3 w-full rounded-md object-cover" loading="lazy" />
                    )}
                    <p className="mt-3 line-clamp-4 whitespace-pre-line text-ink/80">{post.body}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <Link to="/posts" className="text-sm font-medium text-green hover:underline">Read more</Link>
                      <ShareButton title={post.title} text={post.body.slice(0, 120)} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <MihrabDivider />

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Latest lecture */}
          <section aria-labelledby="latest-lecture">
            <h2 id="latest-lecture" className="text-lg">Latest Lecture</h2>
            {lecture ? (
              <div className="mt-4 rounded-lg border border-sage-100 bg-white p-6 shadow-subtle">
                <p className="font-medium text-ink">{lecture.topic}</p>
                <p className="text-sm text-ink/60">{lecture.speaker}{lecture.lecture_date ? ` · ${lecture.lecture_date}` : ''}</p>
                {lecture.description && <p className="mt-2 line-clamp-3 text-sm text-ink/70">{lecture.description}</p>}
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink/50">No lecture updates yet.</p>
            )}
            <Link to="/lectures" className="mt-3 inline-block text-sm font-medium text-green hover:underline">See upcoming & past lectures →</Link>
          </section>

          {/* About + executives preview */}
          <section aria-labelledby="about-preview">
            <h2 id="about-preview" className="text-lg">About the Group</h2>
            <p className="mt-3 text-ink/70">
              {settings?.about_text ?? 'A community centered on Qur\'an recitation, authentic Hadith, Adhkar, and beneficial Islamic lectures.'}
            </p>
            {executives.length > 0 && (
              <div className="mt-5 grid grid-cols-3 gap-4">
                {executives.map((ex) => (
                  <div key={ex.id} className="text-center">
                    <img src={ex.photo_url ?? '/logo.jpg'} alt={ex.name} className="mx-auto h-14 w-14 rounded-full object-cover" />
                    <p className="mt-2 text-xs font-medium text-ink">{ex.name}</p>
                    <p className="text-xs text-ink/50">{ex.position}</p>
                  </div>
                ))}
              </div>
            )}
            <Link to="/about" className="mt-3 inline-block text-sm font-medium text-green hover:underline">Read more about us →</Link>
          </section>
        </div>
      </div>
    </div>
  )
}
