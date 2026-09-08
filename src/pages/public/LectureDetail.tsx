import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Loading, EmptyState, ErrorState } from '@/components/ui/States'
import { LectureCountdown } from '@/components/ui/LectureCountdown'
import { ShareButton } from '@/components/ui/ShareButton'
import type { Lecture } from '@/lib/types'

export default function LectureDetail() {
  const { id } = useParams()
  const [lecture, setLecture] = useState<Lecture | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    supabase
      .from('lectures')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else {
          setLecture(data as Lecture | null)
          if (data) document.title = `${(data as Lecture).topic} | Quran Recitation and Lectures Group`
        }
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="container-site py-12"><Loading /></div>
  if (error) return <div className="container-site py-12"><ErrorState message={error} /></div>
  if (!lecture) {
    return (
      <div className="container-site py-12">
        <EmptyState title="This lecture isn't available" description="It may not be published yet, or the link may be incorrect." />
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm font-medium text-green hover:underline">← Back to Home</Link>
        </div>
      </div>
    )
  }

  const isUpcoming = lecture.lecture_status === 'upcoming' && lecture.lecture_datetime && new Date(lecture.lecture_datetime).getTime() > Date.now()

  return (
    <div className="container-site py-12">
      <div className="mx-auto max-w-prose">
        <Link to="/" className="text-sm font-medium text-green hover:underline">← Back to Home</Link>

        {isUpcoming && (
          <div className="mt-6">
            <LectureCountdown lecture={lecture} />
          </div>
        )}

        {lecture.poster_url && (
          <img src={lecture.poster_url} alt={lecture.topic} className="mt-6 w-full rounded-lg object-cover" />
        )}

        <div className="mt-6 flex items-center gap-2">
          <span className={`badge ${lecture.lecture_status === 'upcoming' ? 'badge-sahih' : 'bg-sage-100 text-ink/60'}`}>
            {lecture.lecture_status === 'upcoming' ? 'Upcoming' : 'Completed'}
          </span>
          {lecture.lecture_date && (
            <time className="text-xs text-ink/40">{lecture.lecture_date}{lecture.lecture_time ? ` · ${lecture.lecture_time}` : ''}</time>
          )}
        </div>

        <h1 className="mt-2 text-2xl">{lecture.topic}</h1>
        <p className="mt-1 text-ink/60">{lecture.speaker}</p>
        {lecture.speaker_info && <p className="mt-1 text-sm text-ink/50">{lecture.speaker_info}</p>}

        {lecture.description && <p className="mt-4 whitespace-pre-line leading-relaxed text-ink/80">{lecture.description}</p>}

        {lecture.test_info && (
          <p className="mt-4 rounded-md bg-gold-light px-4 py-3 text-sm text-ink/70">Test: {lecture.test_info}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {lecture.recording_url && (
            <a href={lecture.recording_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              Listen to recording
            </a>
          )}
          <ShareButton title={lecture.topic} text={lecture.description ?? undefined} />
        </div>
      </div>
    </div>
  )
}
