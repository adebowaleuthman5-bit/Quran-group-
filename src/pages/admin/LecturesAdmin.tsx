import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { Loading, EmptyState } from '@/components/ui/States'
import { StatusPill } from '@/components/admin/StatusPill'
import type { Lecture } from '@/lib/types'

const empty = {
  topic: '', speaker: '', speaker_info: '', lecture_date: '', lecture_time: '', description: '',
  recording_url: '', poster_url: '', test_info: '', lecture_status: 'upcoming' as 'upcoming' | 'completed',
}

export default function LecturesAdmin() {
  const { profile } = useAuth()
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Lecture | null>(null)
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('lectures').select('*').order('created_at', { ascending: false })
    setLectures((data as Lecture[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startCreate() {
    setEditing(null); setForm(empty); setSaveError(null); setShowForm(true)
  }

  function startEdit(l: Lecture) {
    setEditing(l)
    setForm({
      topic: l.topic, speaker: l.speaker, speaker_info: l.speaker_info ?? '', lecture_date: l.lecture_date ?? '',
      lecture_time: l.lecture_time ?? '', description: l.description ?? '', recording_url: l.recording_url ?? '',
      poster_url: l.poster_url ?? '', test_info: l.test_info ?? '', lecture_status: l.lecture_status,
    })
    setSaveError(null); setShowForm(true)
  }

  async function handleSave(e: React.FormEvent, publish?: boolean) {
    e.preventDefault()
    if (!form.topic || !form.speaker) {
      setSaveError('Topic and speaker are required.')
      return
    }
    setSaving(true)
    setSaveError(null)
    const payload: any = {
      topic: form.topic, speaker: form.speaker, speaker_info: form.speaker_info || null,
      lecture_date: form.lecture_date || null, lecture_time: form.lecture_time || null,
      description: form.description || null, recording_url: form.recording_url || null,
      poster_url: form.poster_url || null, test_info: form.test_info || null, lecture_status: form.lecture_status,
    }
    if (publish !== undefined) {
      payload.status = publish ? 'published' : 'draft'
      payload.published_at = publish ? new Date().toISOString() : null
    }
    let error
    if (editing) {
      ;({ error } = await supabase.from('lectures').update(payload).eq('id', editing.id))
    } else {
      payload.status = publish ? 'published' : 'draft'
      payload.published_at = publish ? new Date().toISOString() : null
      payload.created_by = profile?.id
      ;({ error } = await supabase.from('lectures').insert(payload))
    }
    setSaving(false)
    if (error) setSaveError(error.message)
    else { setShowForm(false); load() }
  }

  async function togglePublish(l: Lecture) {
    const publish = l.status !== 'published'
    await supabase.from('lectures').update({
      status: publish ? 'published' : 'draft',
      published_at: publish ? new Date().toISOString() : null,
    }).eq('id', l.id)
    load()
  }

  async function handleDelete(l: Lecture) {
    if (!confirm(`Delete the lecture "${l.topic}"? This cannot be undone.`)) return
    await supabase.from('lectures').delete().eq('id', l.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl">Lectures</h1>
        <button className="btn-primary" onClick={startCreate}>+ New Lecture</button>
      </div>

      {showForm && (
        <form className="mt-6 space-y-4 rounded-lg border border-sage-100 bg-white p-6 shadow-subtle" onSubmit={(e) => handleSave(e, undefined)}>
          <h2 className="font-display text-lg text-green-deep">{editing ? 'Edit Lecture' : 'New Lecture'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Topic *</label>
              <input className="field-input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Speaker *</label>
              <input className="field-input" value={form.speaker} onChange={(e) => setForm({ ...form, speaker: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="field-label">Speaker Info (optional)</label>
            <input className="field-input" value={form.speaker_info} onChange={(e) => setForm({ ...form, speaker_info: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="field-label">Date</label>
              <input type="date" className="field-input" value={form.lecture_date} onChange={(e) => setForm({ ...form, lecture_date: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Time</label>
              <input className="field-input" placeholder="e.g. 8:00 PM" value={form.lecture_time} onChange={(e) => setForm({ ...form, lecture_time: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Status *</label>
              <select className="field-input" value={form.lecture_status} onChange={(e) => setForm({ ...form, lecture_status: e.target.value as 'upcoming' | 'completed' })}>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="field-label">Description</label>
            <textarea rows={3} className="field-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Recording / Audio URL (optional)</label>
              <input className="field-input" value={form.recording_url} onChange={(e) => setForm({ ...form, recording_url: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Poster Image URL (optional)</label>
              <input className="field-input" value={form.poster_url} onChange={(e) => setForm({ ...form, poster_url: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="field-label">Test Info (optional)</label>
            <input className="field-input" value={form.test_info} onChange={(e) => setForm({ ...form, test_info: e.target.value })} />
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
        {loading ? <Loading /> : lectures.length === 0 ? (
          <EmptyState title="No lectures yet" description="Create your first lecture above." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-sage-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-sage-100 bg-sage-50 text-xs uppercase text-ink/50">
                <tr>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Speaker</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {lectures.map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-3 font-medium">{l.topic}</td>
                    <td className="px-4 py-3">{l.speaker}</td>
                    <td className="px-4 py-3"><StatusPill status={l.status} /></td>
                    <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                      <button className="text-green hover:underline" onClick={() => startEdit(l)}>Edit</button>
                      <button className="text-ink/60 hover:underline" onClick={() => togglePublish(l)}>{l.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                      <button className="text-clay hover:underline" onClick={() => handleDelete(l)}>Delete</button>
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
