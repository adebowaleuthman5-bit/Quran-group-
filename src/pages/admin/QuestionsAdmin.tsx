import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { Loading, EmptyState } from '@/components/ui/States'
import { StatusPill } from '@/components/admin/StatusPill'
import type { IslamicQuestion, QuestionAnswer, QuestionStatus } from '@/lib/types'

export default function QuestionsAdmin() {
  const { profile } = useAuth()
  const [questions, setQuestions] = useState<IslamicQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<QuestionStatus | 'all'>('all')
  const [active, setActive] = useState<IslamicQuestion | null>(null)
  const [form, setForm] = useState({ answer: '', quran_references: '', hadith_references: '', scholarly_references: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const [{ data: qData }, { data: aData }] = await Promise.all([
      supabase.from('islamic_questions').select('*').order('created_at', { ascending: false }),
      supabase.from('question_answers').select('*'),
    ])
    setQuestions((qData as IslamicQuestion[]) ?? [])
    const map: Record<string, QuestionAnswer> = {}
    ;((aData as QuestionAnswer[]) ?? []).forEach((a) => { map[a.question_id] = a })
    setAnswers(map)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openQuestion(q: IslamicQuestion) {
    setActive(q)
    const existing = answers[q.id]
    setForm({
      answer: existing?.answer ?? '',
      quran_references: existing?.quran_references ?? '',
      hadith_references: existing?.hadith_references ?? '',
      scholarly_references: existing?.scholarly_references ?? '',
    })
    setSaveError(null)
    if (q.status === 'pending') {
      supabase.from('islamic_questions').update({ status: 'under_review' }).eq('id', q.id).then(() => load())
    }
  }

  async function saveAnswer(publish: boolean) {
    if (!active) return
    if (!form.answer.trim()) {
      setSaveError('Please write an answer before saving.')
      return
    }
    setSaving(true)
    setSaveError(null)
    const existing = answers[active.id]
    const payload = {
      question_id: active.id,
      answer: form.answer,
      quran_references: form.quran_references || null,
      hadith_references: form.hadith_references || null,
      scholarly_references: form.scholarly_references || null,
      status: publish ? 'published' as const : 'draft' as const,
      answered_by: profile?.id,
      published_at: publish ? new Date().toISOString() : null,
    }

    let error
    if (existing) {
      ;({ error } = await supabase.from('question_answers').update(payload).eq('id', existing.id))
    } else {
      ;({ error } = await supabase.from('question_answers').insert(payload))
    }
    if (!error) {
      await supabase.from('islamic_questions').update({ status: publish ? 'published' : 'answered' }).eq('id', active.id)
    }
    setSaving(false)
    if (error) {
      setSaveError(error.message)
    } else {
      setActive(null)
      load()
    }
  }

  async function unpublish() {
    if (!active) return
    const existing = answers[active.id]
    if (!existing) return
    await supabase.from('question_answers').update({ status: 'draft', published_at: null }).eq('id', existing.id)
    await supabase.from('islamic_questions').update({ status: 'answered' }).eq('id', active.id)
    setActive(null)
    load()
  }

  async function reject(q: IslamicQuestion) {
    if (!confirm('Mark this question as rejected? It will not be published.')) return
    await supabase.from('islamic_questions').update({ status: 'rejected' }).eq('id', q.id)
    load()
  }

  const filtered = filter === 'all' ? questions : questions.filter((q) => q.status === filter)

  return (
    <div>
      <h1 className="text-xl">Islamic Questions</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['all', 'pending', 'under_review', 'answered', 'published', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${filter === f ? 'bg-green text-white' : 'bg-white text-ink/60 border border-sage-200'}`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          {loading ? <Loading /> : filtered.length === 0 ? (
            <EmptyState title="No questions in this view" />
          ) : (
            <ul className="space-y-3">
              {filtered.map((q) => (
                <li key={q.id} className={`rounded-lg border bg-white p-4 shadow-subtle ${active?.id === q.id ? 'border-green' : 'border-sage-100'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-ink">{q.question}</p>
                    <StatusPill status={q.status} />
                  </div>
                  <p className="mt-1 text-xs text-ink/40">
                    {q.category ? `${q.category} · ` : ''}{new Date(q.created_at).toLocaleDateString()}
                    {q.submitter_name ? ` · ${q.submitter_name}` : ''}
                  </p>
                  <div className="mt-3 flex gap-3 text-xs">
                    <button className="text-green hover:underline" onClick={() => openQuestion(q)}>Review & Answer</button>
                    {q.status !== 'rejected' && <button className="text-clay hover:underline" onClick={() => reject(q)}>Reject</button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {active ? (
            <div className="rounded-lg border border-sage-100 bg-white p-6 shadow-subtle">
              <p className="text-xs font-medium uppercase tracking-wide text-ink/40">Question</p>
              <p className="mt-1 font-medium text-ink">{active.question}</p>
              {active.submitter_contact && <p className="mt-1 text-xs text-ink/40">Contact: {active.submitter_contact}</p>}

              <div className="mt-5 space-y-4">
                <div>
                  <label className="field-label">Answer *</label>
                  <textarea rows={5} className="field-input" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Qur'an References</label>
                  <input className="field-input" value={form.quran_references} onChange={(e) => setForm({ ...form, quran_references: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Hadith References</label>
                  <input className="field-input" value={form.hadith_references} onChange={(e) => setForm({ ...form, hadith_references: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Scholarly / Other References</label>
                  <input className="field-input" value={form.scholarly_references} onChange={(e) => setForm({ ...form, scholarly_references: e.target.value })} />
                </div>
                {saveError && <p className="text-sm text-clay">{saveError}</p>}
                <div className="flex flex-wrap gap-3">
                  <button disabled={saving} onClick={() => saveAnswer(false)} className="btn-secondary">Save Draft</button>
                  <button disabled={saving} onClick={() => saveAnswer(true)} className="btn-primary">Publish Answer</button>
                  {answers[active.id]?.status === 'published' && (
                    <button disabled={saving} onClick={unpublish} className="text-sm text-clay hover:underline">Unpublish</button>
                  )}
                  <button onClick={() => setActive(null)} className="text-sm text-ink/50 hover:text-ink">Close</button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState title="Select a question" description="Choose a question from the list to review and answer it." />
          )}
        </div>
      </div>
    </div>
  )
}
