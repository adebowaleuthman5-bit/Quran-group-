import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loading, EmptyState, ErrorState } from '@/components/ui/States'
import type { Resource } from '@/lib/types'

function fileKind(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (['pdf'].includes(ext)) return 'PDF'
  if (['mp3', 'wav', 'm4a', 'ogg'].includes(ext)) return 'Audio'
  if (['doc', 'docx'].includes(ext)) return 'Document'
  if (['ppt', 'pptx'].includes(ext)) return 'Slides'
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'Image'
  return 'File'
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Resource Library | Quran Recitation and Lectures Group'
  }, [])

  useEffect(() => {
    supabase
      .from('resources')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setResources((data as Resource[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="container-site py-12">
      <header className="mx-auto max-w-prose text-center">
        <h1 className="text-2xl">Islamic Resource Library</h1>
        <p className="mt-2 text-ink/60">Articles, lecture notes, and educational resources shared by the group.</p>
      </header>

      <div className="mx-auto mt-10 max-w-prose">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} />
        ) : resources.length === 0 ? (
          <EmptyState title="No resources yet" description="Check back soon for new material." />
        ) : (
          <div className="space-y-4">
            {resources.map((r) => (
              <a
                key={r.id}
                href={r.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-lg border border-sage-100 bg-white p-5 shadow-subtle transition-colors hover:border-green/40"
              >
                <span className="badge bg-green-light text-green-deep shrink-0">{fileKind(r.file_name)}</span>
                <div className="min-w-0">
                  <p className="font-medium text-ink">{r.title}</p>
                  {r.description && <p className="mt-1 text-sm text-ink/60">{r.description}</p>}
                  <p className="mt-1 text-xs text-ink/40">
                    {r.file_name}
                    {r.published_at ? ` · ${new Date(r.published_at).toLocaleDateString()}` : ''}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
