import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { Loading, EmptyState } from '@/components/ui/States'
import { StatusPill } from '@/components/admin/StatusPill'
import { HadithGradeBadge } from '@/components/ui/HadithGradeBadge'
import type { HadithPost, HadithGrade } from '@/lib/types'

const empty = {
  arabic_text: '', translation: '', collection: '', hadith_number: '', grade: 'Sahih' as HadithGrade,
  grader: '', reference: '', source_url: '', explanation: '',
}

export default function HadithAdmin() {
  const { profile } = useAuth()
  const [posts, setPosts] = useState<HadithPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<HadithPost | null>(null)
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('hadith_posts').select('*').order('created_at', { ascending: false })
    setPosts((data as HadithPost[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startCreate() {
    setEditing(null); setForm(empty); setSaveError(null); setShowForm(true)
  }

  function startEdit(p: HadithPost) {
    setEditing(p)
    setForm({
      arabic_text: p.arabic_text ?? '', translation: p.translation, collection: p.collection,
      hadith_number: p.hadith_number ?? '', grade: p.grade, grader: p.grader ?? '',
      reference: p.reference, source_url: p.source_url ?? '', explanation: p.explanation ?? '',
    })
    setSaveError(null); setShowForm(true)
  }

  async function handleSave(e: React.FormEvent, publish?: boolean) {
    e.preventDefault()
    if (!form.translation || !form.collection || !form.reference) {
      setSaveError('Translation, collection, and reference are required.')
      return
    }
    if (publish && !form.reference.trim()) {
      setSaveError('A Hadith cannot be published without a reference/source.')
      return
    }
    setSaving(true)
    setSaveError(null)
    const payload: any = {
      arabic_text: form.arabic_text || null,
      translation: form.translation,
      collection: form.collection,
      hadith_number: form.hadith_number || null,
      grade: form.grade,
      grader: form.grader || null,
      reference: form.reference,
      source_url: form.source_url || null,
      explanation: form.explanation || null,
    }
    if (publish !== undefined) {
      payload.status = publish ? 'published' : 'draft'
      payload.published_at = publish ? new Date().toISOString() : null
    }

    let error
    if (editing) {
      ;({ error } = await supabase.from('hadith_posts').update(payload).eq('id', editing.id))
    } else {
      payload.status = publish ? 'published' : 'draft'
      payload.published_at = publish ? new Date().toISOString() : null
      payload.created_by = profile?.id
      ;({ error } = await supabase.from('hadith_posts').insert(payload))
    }
    setSaving(false)
    if (error) setSaveError(error.message)
    else { setShowForm(false); load() }
  }

  async function togglePublish(p: HadithPost) {
    const publish = p.status !== 'published'
    if (publish && !p.reference?.trim()) {
      alert('This Hadith has no reference/source and cannot be published. Edit it first.')
      return
    }
    await supabase.from('hadith_posts').update({
      status: publish ? 'published' : 'draft',
      published_at: publish ? new Date().toISOString() : null,
    }).eq('id', p.id)
    load()
  }

  async function handleDelete(p: HadithPost) {
    if (!confirm(`Delete this Hadith from ${p.collection}? This cannot be undone.`)) return
    await supabase.from('hadith_posts').delete().eq('id', p.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl">Hadith Posts</h1>
        <button className="btn-primary" onClick={startCreate}>+ New Hadith</button>
      </div>

      {showForm && (
        <form className="mt-6 space-y-4 rounded-lg border border-sage-100 bg-white p-6 shadow-subtle" onSubmit={(e) => handleSave(e, undefined)}>
          <h2 className="font-display text-lg text-green-deep">{editing ? 'Edit Hadith' : 'New Hadith'}</h2>
          <div>
            <label className="field-label">Arabic Text (optional)</label>
            <textarea dir="rtl" rows={2} className="field-input font-arabic text-xl" value={form.arabic_text} onChange={(e) => setForm({ ...form, arabic_text: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Translation *</label>
            <textarea rows={3} className="field-input" value={form.translation} onChange={(e) => setForm({ ...form, translation: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="field-label">Collection *</label>
              <input className="field-input" value={form.collection} onChange={(e) => setForm({ ...form, collection: e.target.value })} placeholder="e.g. Sahih al-Bukhari" />
            </div>
            <div>
              <label className="field-label">Hadith Number</label>
              <input className="field-input" value={form.hadith_number} onChange={(e) => setForm({ ...form, hadith_number: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Grade *</label>
              <select className="field-input" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value as HadithGrade })}>
                <option value="Sahih">Sahih</option>
                <option value="Hasan">Hasan</option>
                <option value="Da'if">Da'if</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Grader / Scholar (optional)</label>
              <input className="field-input" value={form.grader} onChange={(e) => setForm({ ...form, grader: e.target.value })} placeholder="e.g. Al-Albani" />
            </div>
            <div>
              <label className="field-label">Reference *</label>
              <input className="field-input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Required — a Hadith cannot publish without this" />
            </div>
          </div>
          <div>
            <label className="field-label">Source URL (optional)</label>
            <input className="field-input" value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Explanation (optional)</label>
            <textarea rows={2} className="field-input" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
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
        {loading ? <Loading /> : posts.length === 0 ? (
          <EmptyState title="No Hadith posts yet" description="Create your first Hadith above." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-sage-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-sage-100 bg-sage-50 text-xs uppercase text-ink/50">
                <tr>
                  <th className="px-4 py-3">Collection</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium">{p.collection}{p.hadith_number ? ` #${p.hadith_number}` : ''}</td>
                    <td className="px-4 py-3"><HadithGradeBadge grade={p.grade} grader={p.grader} /></td>
                    <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                    <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                      <button className="text-green hover:underline" onClick={() => startEdit(p)}>Edit</button>
                      <button className="text-ink/60 hover:underline" onClick={() => togglePublish(p)}>{p.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                      <button className="text-clay hover:underline" onClick={() => handleDelete(p)}>Delete</button>
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
