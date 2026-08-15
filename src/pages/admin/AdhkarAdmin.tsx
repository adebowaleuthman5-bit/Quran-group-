import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { Loading, EmptyState } from '@/components/ui/States'
import { StatusPill } from '@/components/admin/StatusPill'
import type { Dhikr } from '@/lib/types'

const empty = {
  category: 'morning' as 'morning' | 'evening', arabic_text: '', transliteration: '', translation: '',
  repetitions: '1', reference: '', explanation: '', audio_url: '', display_order: '0',
}

export default function AdhkarAdmin() {
  const { profile } = useAuth()
  const [items, setItems] = useState<Dhikr[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Dhikr | null>(null)
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('adhkar').select('*').order('category').order('display_order')
    setItems((data as Dhikr[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startCreate() {
    setEditing(null); setForm(empty); setSaveError(null); setShowForm(true)
  }

  function startEdit(d: Dhikr) {
    setEditing(d)
    setForm({
      category: d.category, arabic_text: d.arabic_text, transliteration: d.transliteration ?? '',
      translation: d.translation, repetitions: d.repetitions?.toString() ?? '1', reference: d.reference,
      explanation: d.explanation ?? '', audio_url: d.audio_url ?? '', display_order: d.display_order?.toString() ?? '0',
    })
    setSaveError(null); setShowForm(true)
  }

  async function handleSave(e: React.FormEvent, publish?: boolean) {
    e.preventDefault()
    if (!form.arabic_text || !form.translation || !form.reference) {
      setSaveError('Arabic text, translation, and reference are required.')
      return
    }
    setSaving(true)
    setSaveError(null)
    const payload: any = {
      category: form.category, arabic_text: form.arabic_text, transliteration: form.transliteration || null,
      translation: form.translation, repetitions: Number(form.repetitions) || 1, reference: form.reference,
      explanation: form.explanation || null, audio_url: form.audio_url || null, display_order: Number(form.display_order) || 0,
    }
    if (publish !== undefined) {
      payload.status = publish ? 'published' : 'draft'
      payload.published_at = publish ? new Date().toISOString() : null
    }
    let error
    if (editing) {
      ;({ error } = await supabase.from('adhkar').update(payload).eq('id', editing.id))
    } else {
      payload.status = publish ? 'published' : 'draft'
      payload.published_at = publish ? new Date().toISOString() : null
      payload.created_by = profile?.id
      ;({ error } = await supabase.from('adhkar').insert(payload))
    }
    setSaving(false)
    if (error) setSaveError(error.message)
    else { setShowForm(false); load() }
  }

  async function togglePublish(d: Dhikr) {
    const publish = d.status !== 'published'
    await supabase.from('adhkar').update({
      status: publish ? 'published' : 'draft',
      published_at: publish ? new Date().toISOString() : null,
    }).eq('id', d.id)
    load()
  }

  async function handleDelete(d: Dhikr) {
    if (!confirm('Delete this Dhikr? This cannot be undone.')) return
    await supabase.from('adhkar').delete().eq('id', d.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl">Adhkar</h1>
        <button className="btn-primary" onClick={startCreate}>+ New Dhikr</button>
      </div>

      {showForm && (
        <form className="mt-6 space-y-4 rounded-lg border border-sage-100 bg-white p-6 shadow-subtle" onSubmit={(e) => handleSave(e, undefined)}>
          <h2 className="font-display text-lg text-green-deep">{editing ? 'Edit Dhikr' : 'New Dhikr'}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="field-label">Category *</label>
              <select className="field-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as 'morning' | 'evening' })}>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            <div>
              <label className="field-label">Repetitions</label>
              <input type="number" min={1} className="field-input" value={form.repetitions} onChange={(e) => setForm({ ...form, repetitions: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Display Order</label>
              <input type="number" className="field-input" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="field-label">Arabic Text *</label>
            <textarea dir="rtl" rows={2} className="field-input font-arabic text-xl" value={form.arabic_text} onChange={(e) => setForm({ ...form, arabic_text: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Transliteration (optional)</label>
            <input className="field-input" value={form.transliteration} onChange={(e) => setForm({ ...form, transliteration: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Translation *</label>
            <textarea rows={2} className="field-input" value={form.translation} onChange={(e) => setForm({ ...form, translation: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Reference *</label>
              <input className="field-input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Audio URL (optional)</label>
              <input className="field-input" value={form.audio_url} onChange={(e) => setForm({ ...form, audio_url: e.target.value })} />
            </div>
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
        {loading ? <Loading /> : items.length === 0 ? (
          <EmptyState title="No Adhkar yet" description="Create your first Dhikr above." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-sage-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-sage-100 bg-sage-50 text-xs uppercase text-ink/50">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Translation</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {items.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 capitalize">{d.category}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{d.translation}</td>
                    <td className="px-4 py-3"><StatusPill status={d.status} /></td>
                    <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                      <button className="text-green hover:underline" onClick={() => startEdit(d)}>Edit</button>
                      <button className="text-ink/60 hover:underline" onClick={() => togglePublish(d)}>{d.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                      <button className="text-clay hover:underline" onClick={() => handleDelete(d)}>Delete</button>
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
