import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { Loading, EmptyState } from '@/components/ui/States'
import { StatusPill } from '@/components/admin/StatusPill'
import type { Resource } from '@/lib/types'

const empty = { title: '', description: '', file_url: '', file_name: '' }

export default function ResourcesAdmin() {
  const { profile } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Resource | null>(null)
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false })
    setResources((data as Resource[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startCreate() {
    setEditing(null)
    setForm(empty)
    setSaveError(null)
    setShowForm(true)
  }

  function startEdit(r: Resource) {
    setEditing(r)
    setForm({ title: r.title, description: r.description ?? '', file_url: r.file_url, file_name: r.file_name })
    setSaveError(null)
    setShowForm(true)
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setSaveError(null)
    const path = `resources/${crypto.randomUUID()}-${file.name}`
    const { error } = await supabase.storage.from('site-media').upload(path, file)
    if (error) {
      setSaveError(`File upload failed: ${error.message}`)
    } else {
      const { data } = supabase.storage.from('site-media').getPublicUrl(path)
      setForm((f) => ({ ...f, file_url: data.publicUrl, file_name: file.name }))
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSave(e: React.FormEvent, publish?: boolean) {
    e.preventDefault()
    if (!form.title.trim() || !form.file_url) {
      setSaveError('Title and a file are required.')
      return
    }
    setSaving(true)
    setSaveError(null)
    const payload: any = {
      title: form.title,
      description: form.description || null,
      file_url: form.file_url,
      file_name: form.file_name,
    }
    if (publish !== undefined) {
      payload.status = publish ? 'published' : 'draft'
      payload.published_at = publish ? new Date().toISOString() : null
    }

    let error
    if (editing) {
      ;({ error } = await supabase.from('resources').update(payload).eq('id', editing.id))
    } else {
      payload.status = publish ? 'published' : 'draft'
      payload.published_at = publish ? new Date().toISOString() : null
      payload.created_by = profile?.id
      ;({ error } = await supabase.from('resources').insert(payload))
    }
    setSaving(false)
    if (error) {
      setSaveError(error.message)
    } else {
      setShowForm(false)
      load()
    }
  }

  async function togglePublish(r: Resource) {
    const publish = r.status !== 'published'
    await supabase.from('resources').update({
      status: publish ? 'published' : 'draft',
      published_at: publish ? new Date().toISOString() : null,
    }).eq('id', r.id)
    load()
  }

  async function handleDelete(r: Resource) {
    if (!confirm(`Delete the resource "${r.title}"? This cannot be undone.`)) return
    await supabase.from('resources').delete().eq('id', r.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl">Resource Library</h1>
        <button className="btn-primary" onClick={startCreate}>+ New Resource</button>
      </div>

      {showForm && (
        <form className="mt-6 space-y-4 rounded-lg border border-sage-100 bg-white p-6 shadow-subtle" onSubmit={(e) => handleSave(e, undefined)}>
          <h2 className="font-display text-lg text-green-deep">{editing ? 'Edit Resource' : 'New Resource'}</h2>

          <div>
            <label className="field-label">Title *</label>
            <input className="field-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div>
            <label className="field-label">Description (optional)</label>
            <textarea rows={3} className="field-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <label className="field-label">File * (PDF, audio, document — any type)</label>
            <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="field-input" />
            {uploading && <p className="mt-1 text-xs text-ink/50">Uploading…</p>}
            {form.file_name && !uploading && (
              <p className="mt-2 text-sm text-ink/70">Attached: {form.file_name}</p>
            )}
          </div>

          {saveError && <p className="text-sm text-clay">{saveError}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving || uploading} className="btn-secondary">Save Draft</button>
            <button type="button" disabled={saving || uploading} onClick={(e) => handleSave(e as any, true)} className="btn-primary">Publish</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-ink/50 hover:text-ink">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-6">
        {loading ? <Loading /> : resources.length === 0 ? (
          <EmptyState title="No resources yet" description="Add your first resource above." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-sage-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-sage-100 bg-sage-50 text-xs uppercase text-ink/50">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {resources.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium">{r.title}</td>
                    <td className="px-4 py-3 text-ink/60">{r.file_name}</td>
                    <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                    <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                      <button className="text-green hover:underline" onClick={() => startEdit(r)}>Edit</button>
                      <button className="text-ink/60 hover:underline" onClick={() => togglePublish(r)}>{r.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                      <button className="text-clay hover:underline" onClick={() => handleDelete(r)}>Delete</button>
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
