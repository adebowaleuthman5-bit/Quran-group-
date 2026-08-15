import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { Loading, EmptyState } from '@/components/ui/States'
import { StatusPill } from '@/components/admin/StatusPill'
import type { QuranPost } from '@/lib/types'

const empty = {
  surah_name: '', surah_number: '', verse_number: '', arabic_text: '', translation: '',
  translation_source: '', tafsir: '', reference: '', source_url: '',
}

export default function QuranAdmin() {
  const { profile } = useAuth()
  const [posts, setPosts] = useState<QuranPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<QuranPost | null>(null)
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('quran_posts').select('*').order('created_at', { ascending: false })
    setPosts((data as QuranPost[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startCreate() {
    setEditing(null)
    setForm(empty)
    setSaveError(null)
    setShowForm(true)
  }

  function startEdit(p: QuranPost) {
    setEditing(p)
    setForm({
      surah_name: p.surah_name, surah_number: p.surah_number?.toString() ?? '', verse_number: p.verse_number,
      arabic_text: p.arabic_text, translation: p.translation, translation_source: p.translation_source,
      tafsir: p.tafsir ?? '', reference: p.reference, source_url: p.source_url ?? '',
    })
    setSaveError(null)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent, publish?: boolean) {
    e.preventDefault()
    if (!form.surah_name || !form.verse_number || !form.arabic_text || !form.translation || !form.translation_source || !form.reference) {
      setSaveError('Surah, verse number, Arabic text, translation, translation source, and reference are required.')
      return
    }
    setSaving(true)
    setSaveError(null)
    const payload: any = {
      surah_name: form.surah_name,
      surah_number: form.surah_number ? Number(form.surah_number) : null,
      verse_number: form.verse_number,
      arabic_text: form.arabic_text,
      translation: form.translation,
      translation_source: form.translation_source,
      tafsir: form.tafsir || null,
      reference: form.reference,
      source_url: form.source_url || null,
    }
    if (publish !== undefined) {
      payload.status = publish ? 'published' : 'draft'
      payload.published_at = publish ? new Date().toISOString() : null
    }

    let error
    if (editing) {
      ;({ error } = await supabase.from('quran_posts').update(payload).eq('id', editing.id))
    } else {
      payload.status = publish ? 'published' : 'draft'
      payload.published_at = publish ? new Date().toISOString() : null
      payload.created_by = profile?.id
      ;({ error } = await supabase.from('quran_posts').insert(payload))
    }
    setSaving(false)
    if (error) {
      setSaveError(error.message)
    } else {
      setShowForm(false)
      load()
    }
  }

  async function togglePublish(p: QuranPost) {
    const publish = p.status !== 'published'
    await supabase.from('quran_posts').update({
      status: publish ? 'published' : 'draft',
      published_at: publish ? new Date().toISOString() : null,
    }).eq('id', p.id)
    load()
  }

  async function handleDelete(p: QuranPost) {
    if (!confirm(`Delete this Qur'an post (${p.surah_name} ${p.verse_number})? This cannot be undone.`)) return
    await supabase.from('quran_posts').delete().eq('id', p.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl">Qur'an Posts</h1>
        <button className="btn-primary" onClick={startCreate}>+ New Post</button>
      </div>

      {showForm && (
        <form className="mt-6 space-y-4 rounded-lg border border-sage-100 bg-white p-6 shadow-subtle" onSubmit={(e) => handleSave(e, undefined)}>
          <h2 className="font-display text-lg text-green-deep">{editing ? 'Edit Qur\'an Post' : 'New Qur\'an Post'}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="field-label">Surah Name *</label>
              <input className="field-input" value={form.surah_name} onChange={(e) => setForm({ ...form, surah_name: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Surah Number</label>
              <input type="number" className="field-input" value={form.surah_number} onChange={(e) => setForm({ ...form, surah_number: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Verse Number *</label>
              <input className="field-input" value={form.verse_number} onChange={(e) => setForm({ ...form, verse_number: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="field-label">Arabic Text *</label>
            <textarea dir="rtl" rows={3} className="field-input font-arabic text-xl" value={form.arabic_text} onChange={(e) => setForm({ ...form, arabic_text: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Translation *</label>
            <textarea rows={3} className="field-input" value={form.translation} onChange={(e) => setForm({ ...form, translation: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Translation Source *</label>
              <input className="field-input" value={form.translation_source} onChange={(e) => setForm({ ...form, translation_source: e.target.value })} placeholder="e.g. Saheeh International" />
            </div>
            <div>
              <label className="field-label">Reference *</label>
              <input className="field-input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. Qur'an 2:255" />
            </div>
          </div>
          <div>
            <label className="field-label">Tafsir / Reflection (optional)</label>
            <textarea rows={2} className="field-input" value={form.tafsir} onChange={(e) => setForm({ ...form, tafsir: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Source URL (optional)</label>
            <input className="field-input" value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} />
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
          <EmptyState title="No Qur'an posts yet" description="Create your first post above." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-sage-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-sage-100 bg-sage-50 text-xs uppercase text-ink/50">
                <tr>
                  <th className="px-4 py-3">Surah / Verse</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium">{p.surah_name} {p.verse_number}</td>
                    <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                    <td className="px-4 py-3 text-ink/50">{new Date(p.updated_at).toLocaleDateString()}</td>
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
