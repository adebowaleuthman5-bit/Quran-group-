import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Loading, EmptyState, ErrorState } from '@/components/ui/States'
import type { IslamicQuestion, QuestionAnswer } from '@/lib/types'

export default function QuestionDetail() {
  const { id } = useParams()
  const [question, setQuestion] = useState<IslamicQuestion | null>(null)
  const [answer, setAnswer] = useState<QuestionAnswer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    supabase
      .from('question_answers')
      .select('*, islamic_questions(*)')
      .eq('question_id', id)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else if (data) {
          setAnswer(data as unknown as QuestionAnswer)
          setQuestion((data as any).islamic_questions as IslamicQuestion)
          document.title = `${(data as any).islamic_questions?.question?.slice(0, 60)} | Quran Recitation and Lectures Group`
        }
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="container-site py-12"><Loading /></div>
  if (error) return <div className="container-site py-12"><ErrorState message={error} /></div>
  if (!question || !answer) {
    return (
      <div className="container-site py-12">
        <EmptyState title="This answer isn't available" description="It may not be published yet, or the link may be incorrect." />
        <div className="mt-6 text-center">
          <Link to="/questions" className="text-sm font-medium text-green hover:underline">← Back to Islamic Questions</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-site py-12">
      <div className="mx-auto max-w-prose">
        <Link to="/questions" className="text-sm font-medium text-green hover:underline">← Back to Islamic Questions</Link>

        <p className="mt-6 text-xs font-medium uppercase tracking-wide text-ink/40">Question</p>
        <h1 className="mt-1 text-xl">{question.question}</h1>

        <p className="mt-8 text-xs font-medium uppercase tracking-wide text-ink/40">Answer</p>
        <div className="mt-2 whitespace-pre-line leading-relaxed text-ink/85">{answer.answer}</div>

        {(answer.quran_references || answer.hadith_references || answer.scholarly_references) && (
          <div className="mt-8 rounded-lg border border-sage-100 bg-sage-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/40">References</p>
            <div className="mt-2 space-y-2 text-sm text-ink/75">
              {answer.quran_references && <p><span className="font-medium">Qur'an:</span> {answer.quran_references}</p>}
              {answer.hadith_references && <p><span className="font-medium">Hadith:</span> {answer.hadith_references}</p>}
              {answer.scholarly_references && <p><span className="font-medium">Scholarly sources:</span> {answer.scholarly_references}</p>}
            </div>
          </div>
        )}

        {answer.published_at && (
          <p className="mt-6 text-xs text-ink/40">Date answered: {new Date(answer.published_at).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  )
}
