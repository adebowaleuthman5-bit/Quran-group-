import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { Loading, EmptyState } from '@/components/ui/States'
import { StatusPill } from '@/components/admin/StatusPill'
import type { Quiz, QuizQuestion, QuizOption } from '@/lib/types'

interface QuestionForm {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: QuizOption
}

const emptyQuestion = (): QuestionForm => ({
  question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a',
})

export default function QuizzesAdmin() {
  const { profile } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Quiz | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion()])
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false })
    setQuizzes((data as Quiz[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startCreate() {
    setEditing(null)
    setTitle('')
    setDescription('')
    setQuestions([emptyQuestion()])
    setSaveError(null)
    setShowForm(true)
  }

  async function startEdit(q: Quiz) {
    setEditing(q)
    setTitle(q.title)
    setDescription(q.description ?? '')
    setSaveError(null)
    const { data } = await supabase.from('quiz_questions').select('*').eq('quiz_id', q.id).order('display_order', { ascending: true })
    const rows = (data as QuizQuestion[]) ?? []
    setQuestions(
      rows.length > 0
        ? rows.map((r) => ({
            question_text: r.question_text, option_a: r.option_a, option_b: r.option_b,
            option_c: r.option_c, option_d: r.option_d, correct_option: r.correct_option,
          }))
        : [emptyQuestion()]
    )
    setShowForm(true)
  }

  function updateQuestion(index: number, patch: Partial<QuestionForm>) {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, ...patch } : q)))
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, emptyQuestion()])
  }

  function removeQuestion(index: number) {
    setQuestions((qs) => (qs.length > 1 ? qs.filter((_, i) => i !== index) : qs))
  }

  async function handleSave(e: React.FormEvent, publish?: boolean) {
    e.preventDefault()
    if (!title.trim()) {
      setSaveError('Quiz title is required.')
      return
    }
    const incomplete = questions.some(
      (q) => !q.question_text.trim() || !q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()
    )
    if (incomplete) {
      setSaveError('Every question needs its text and all four options filled in.')
      return
    }
    setSaving(true)
    setSaveError(null)

    const quizPayload: any = { title, description: description || null }
    if (publish !== undefined) {
      quizPayload.status = publish ? 'published' : 'draft'
      quizPayload.published_at = publish ? new Date().toISOString() : null
    }

    let quizId = editing?.id
    let error

    if (editing) {
      ;({ error } = await supabase.from('quizzes').update(quizPayload).eq('id', editing.id))
    } else {
      quizPayload.status = publish ? 'published' : 'draft'
      quizPayload.published_at = publish ? new Date().toISOString() : null
      quizPayload.created_by = profile?.id
      const { data, error: insertError } = await supabase.from('quizzes').insert(quizPayload).select().single()
      error = insertError
      quizId = data?.id
    }

    if (!error && quizId) {
      // Replace all questions for this quiz — simplest way to keep edits consistent
      await supabase.from('quiz_questions').delete().eq('quiz_id', quizId)
      const rows = questions.map((q, i) => ({
        quiz_id: quizId,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
        display_order: i,
      }))
      ;({ error } = await supabase.from('quiz_questions').insert(rows))
    }

    setSaving(false)
    if (error) {
      setSaveError(error.message)
    } else {
      setShowForm(false)
      load()
    }
  }

  async function togglePublish(q: Quiz) {
    const publish = q.status !== 'published'
    await supabase.from('quizzes').update({
      status: publish ? 'published' : 'draft',
      published_at: publish ? new Date().toISOString() : null,
    }).eq('id', q.id)
    load()
  }

  async function handleDelete(q: Quiz) {
    if (!confirm(`Delete the quiz "${q.title}"? This cannot be undone.`)) return
    await supabase.from('quizzes').delete().eq('id', q.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl">Quizzes</h1>
        <button className="btn-primary" onClick={startCreate}>+ New Quiz</button>
      </div>

      {showForm && (
        <form className="mt-6 space-y-6 rounded-lg border border-sage-100 bg-surface p-6 shadow-subtle" onSubmit={(e) => handleSave(e, undefined)}>
          <h2 className="font-display text-lg text-green-deep">{editing ? 'Edit Quiz' : 'New Quiz'}</h2>

          <div>
            <label className="field-label">Quiz Title *</label>
            <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Description (optional)</label>
            <textarea rows={2} className="field-input" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-5">
            <p className="field-label">Questions</p>
            {questions.map((q, i) => (
              <div key={i} className="rounded-md border border-sage-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink/60">Question {i + 1}</p>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(i)} className="text-xs text-clay hover:underline">Remove</button>
                  )}
                </div>
                <input
                  className="field-input mt-2"
                  placeholder="Question text"
                  value={q.question_text}
                  onChange={(e) => updateQuestion(i, { question_text: e.target.value })}
                />
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(['a', 'b', 'c', 'd'] as const).map((letter) => (
                    <div key={letter} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${i}`}
                        checked={q.correct_option === letter}
                        onChange={() => updateQuestion(i, { correct_option: letter })}
                        aria-label={`Option ${letter.toUpperCase()} is correct`}
                      />
                      <input
                        className="field-input"
                        placeholder={`Option ${letter.toUpperCase()}`}
                        value={q[`option_${letter}` as const]}
                        onChange={(e) => updateQuestion(i, { [`option_${letter}`]: e.target.value } as Partial<QuestionForm>)}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-ink/40">Select the radio button next to the correct answer.</p>
              </div>
            ))}
            <button type="button" onClick={addQuestion} className="btn-secondary !px-4 !py-2 text-sm">+ Add Question</button>
          </div>

          {saveError && <p className="text-sm text-clay">{saveError}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="btn-secondary">Save Draft</button>
            <button type="button" disabled={saving} onClick={(e) => handleSave(e as any, true)} className="btn-primary">Publish</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-ink/50 hover:text-ink">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-6">
        {loading ? <Loading /> : quizzes.length === 0 ? (
          <EmptyState title="No quizzes yet" description="Create your first quiz above." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-sage-100 bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-sage-100 bg-sage-50 text-xs uppercase text-ink/50">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {quizzes.map((q) => (
                  <tr key={q.id}>
                    <td className="px-4 py-3 font-medium">{q.title}</td>
                    <td className="px-4 py-3"><StatusPill status={q.status} /></td>
                    <td className="px-4 py-3 text-ink/50">{new Date(q.updated_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                      <button className="text-green hover:underline" onClick={() => startEdit(q)}>Edit</button>
                      <button className="text-ink/60 hover:underline" onClick={() => togglePublish(q)}>{q.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                      <button className="text-clay hover:underline" onClick={() => handleDelete(q)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
