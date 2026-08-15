import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Loading, EmptyState, ErrorState } from '@/components/ui/States'
import { MihrabDivider } from '@/components/ui/MihrabDivider'
import type { IslamicQuestion, QuestionAnswer } from '@/lib/types'

const CATEGORIES = ['Aqeedah', 'Fiqh', 'Salah', 'Family', 'General', 'Other']

export default function Questions() {
  useEffect(() => {
    document.title = 'Islamic Questions | Quran Recitation and Lectures Group'
  }, [])

  const [question, setQuestion] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    const { error } = await supabase.from('islamic_questions').insert({
      question: question.trim(),
      submitter_name: name.trim() || null,
      submitter_contact: contact.trim() || null,
      category,
    })
    setSubmitting(false)
    if (error) {
      setSubmitError('Could not submit your question. Please try again.')
    } else {
      setSubmitted(true)
      setQuestion('')
      setName('')
      setContact('')
    }
  }

  return (
    <div className="container-site py-12">
      <header className="mx-auto max-w-prose text-center">
        <h1 className="text-2xl">Islamic Questions</h1>
        <p className="mt-2 text-ink/60">Ask a question and it will be reviewed and answered by the group, in shā' Allāh.</p>
      </header>

      <div className="mx-auto mt-8 max-w-prose rounded-lg border border-sage-100 bg-white p-6 shadow-subtle">
        {submitted ? (
          <div className="py-6 text-center">
            <p className="font-display text-lg text-green-deep">Your question has been received.</p>
            <p className="mt-2 text-sm text-ink/60">It will be reviewed and answered by the group, in shā' Allāh.</p>
            <button className="btn-secondary mt-5" onClick={() => setSubmitted(false)}>Ask another question</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="question" className="field-label">Your question</label>
              <textarea
                id="question"
                required
                rows={4}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="field-input"
                placeholder="Type your Islamic question here…"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="field-label">Name (optional)</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="field-input" />
              </div>
              <div>
                <label htmlFor="contact" className="field-label">Email or phone (optional)</label>
                <input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} className="field-input" />
              </div>
            </div>
            <div>
              <label htmlFor="category" className="field-label">Category</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="field-input">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {submitError && <p className="text-sm text-clay">{submitError}</p>}
            <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
              {submitting ? 'Submitting…' : 'Submit Question'}
            </button>
          </form>
        )}
      </div>

      <MihrabDivider />

      <PublishedAnswers />
    </div>
  )
}

function PublishedAnswers() {
  const [rows, setRows] = useState<{ question: IslamicQuestion; answer: QuestionAnswer }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('question_answers')
      .select('*, islamic_questions(*)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
        } else {
          const mapped = (data ?? [])
            .filter((row: any) => row.islamic_questions)
            .map((row: any) => ({ question: row.islamic_questions as IslamicQuestion, answer: row as QuestionAnswer }))
          setRows(mapped)
        }
        setLoading(false)
      })
  }, [])

  return (
    <section className="mx-auto max-w-prose">
      <h2 className="text-lg">Previously Answered Questions</h2>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} />
      ) : rows.length === 0 ? (
        <EmptyState title="No answers published yet" description="Answered questions will appear here." />
      ) : (
        <ul className="mt-4 divide-y divide-sage-100">
          {rows.map(({ question, answer }) => (
            <li key={question.id} className="py-4">
              <Link to={`/questions/${question.id}`} className="font-medium text-ink hover:text-green">
                {question.question}
              </Link>
              <p className="mt-1 text-xs text-ink/40">
                {question.category ? `${question.category} · ` : ''}Answered {answer.published_at ? new Date(answer.published_at).toLocaleDateString() : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
