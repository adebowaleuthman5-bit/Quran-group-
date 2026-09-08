import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Loading, EmptyState, ErrorState } from '@/components/ui/States'
import type { Quiz, QuizQuestion, QuizOption } from '@/lib/types'

export default function QuizTake() {
  const { id } = useParams()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, QuizOption>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('quizzes').select('*').eq('id', id).eq('status', 'published').maybeSingle(),
      supabase.from('quiz_questions').select('*').eq('quiz_id', id).order('display_order', { ascending: true }),
    ]).then(([q, qs]) => {
      if (q.error) setError(q.error.message)
      setQuiz(q.data as Quiz | null)
      setQuestions((qs.data as QuizQuestion[]) ?? [])
      if (q.data) document.title = `${(q.data as Quiz).title} | Quran Recitation and Lectures Group`
      setLoading(false)
    })
  }, [id])

  function selectAnswer(questionId: string, option: QuizOption) {
    setAnswers((a) => ({ ...a, [questionId]: option }))
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id])
  const score = questions.filter((q) => answers[q.id] === q.correct_option).length

  if (loading) return <div className="container-site py-12"><Loading /></div>
  if (error) return <div className="container-site py-12"><ErrorState message={error} /></div>
  if (!quiz || questions.length === 0) {
    return (
      <div className="container-site py-12">
        <EmptyState title="This quiz isn't available" description="It may not be published yet, or the link may be incorrect." />
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm font-medium text-green hover:underline">← Back to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-site py-12">
      <div className="mx-auto max-w-prose">
        <Link to="/" className="text-sm font-medium text-green hover:underline">← Back to Home</Link>

        <h1 className="mt-4 text-xl">{quiz.title}</h1>
        {quiz.description && <p className="mt-2 text-ink/60">{quiz.description}</p>}

        {submitted ? (
          <div className="mt-8 rounded-lg border border-sage-100 bg-surface p-8 text-center shadow-subtle">
            <p className="text-sm font-medium uppercase tracking-wide text-ink/40">Your Score</p>
            <p className="mt-2 font-display text-4xl font-semibold text-green-deep">{score} / {questions.length}</p>
            <button
              onClick={() => { setSubmitted(false); setAnswers({}) }}
              className="btn-secondary mt-6"
            >
              Retake Quiz
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {questions.map((q, i) => (
              <div key={q.id} className="rounded-lg border border-sage-100 bg-surface p-6 shadow-subtle">
                <p className="font-medium text-ink">{i + 1}. {q.question_text}</p>
                <div className="mt-4 space-y-2">
                  {(['a', 'b', 'c', 'd'] as const).map((letter) => (
                    <label key={letter} className="flex items-center gap-3 rounded-md border border-sage-100 px-3 py-2 text-sm hover:bg-sage-50">
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === letter}
                        onChange={() => selectAnswer(q.id, letter)}
                      />
                      {q[`option_${letter}` as const]}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => setSubmitted(true)}
              disabled={!allAnswered}
              className="btn-primary w-full disabled:opacity-50"
            >
              {allAnswered ? 'Submit Quiz' : `Answer all questions to submit (${Object.keys(answers).length}/${questions.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
