import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { Loading, EmptyState } from '@/components/ui/States'
import { StatusPill } from '@/components/admin/StatusPill'
import type { Post } from '@/lib/types'

const empty = { title: '', body: '', image_url: '' }

export default function PostsAdmin() {
  const { profile } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Post | null>(null)
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    setPosts((data as Post[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startCreate() {
    setEditing(null)
    setForm(empty)
    setSaveError(null)
    setShowForm(true)
  }

  function startEdit(p: Post) {
    setEditing(p)
    setForm({ title: p.title, body: p.body, image_url: p.image_url ?? '' })
    setSaveError(null)
    setShowForm(true)
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setSaveError(null)
    const path = `posts/${crypto.randomUUID()}-${file.name}`
    const { error } = await supabase.storage.from('site-media').upload(path, file)
    if (error) {
      setSaveError(`Image upload failed: ${error.message}`)
    } else {
      const { data } = supabase.storage.from('site-media').getPublicUrl(path)
      setForm((f) => ({ ...f, image_url: data.publicUrl }))
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSave(e: React.FormEvent, publish?: boolean) {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) {
      setSaveError('Title and post content are required.')
      return
    }
    setSaving(true)
    setSaveError(null)
    const payload: any = {
      title: form.title,
      body: form.body,
      image_url: form.image_url || null,
    }
    if (publish !== undefined) {
      payload.status = publish ? 'published' : 'draft'
      payload.published_at = publish ? new Date().toISOString() : null
    }

    let error
    if (editing) {
      ;({ error } = await supabase.from('posts').update(payload).eq('id', editing.id))
    } else {
      payload.status = publish ? 'published' : 'draft'
      payload.published_at = publish ? new Date().toISOString() : null
      payload.created_by = profile?.id
      ;({ error } = await supabase.from('posts').insert(payload))
    }
    setSaving(false)
    if (error) {
      setSaveError(error.message)
    } else {
      setShowForm(false)
      load()
    }
  }

  async function togglePublish(p: Post) {
    const publish = p.status !== 'published'
    await supabase.from('posts').update({
      status: publish ? 'published' : 'draft',
      published_at: publish ? new Date().toISOString() : null,
    }).eq('id', p.id)
    load()
  }

  async function handleDelete(p: Post) {
    if (!confirm(`Delete the post "${p.title}"? This cannot be undone.`)) return
    await supabase.from('posts').delete().eq('id', p.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl">Posts</h1>
        <button className="btn-primary" onClick={startCreate}>+ New Post</button>
      </div>

      {showForm && (
        <form className="mt-6 space-y-4 rounded-lg border border-sage-100 bg-white p-6 shadow-subtle" onSubmit={(e) => handleSave(e, undefined)}>
          <h2 className="font-display text-lg text-green-deep">{editing ? 'Edit Post' : 'New Post'}</h2>

          <div>
            <label className="field-label">Title *</label>
            <input className="field-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div>
            <label className="field-label">Content *</label>
            <textarea
              rows={8}
              className="field-input"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Write anything here — Arabic text, translation, a reminder, numbers, a Hadith, whatever the post needs."
            />
          </div>

          <div>
            <label className="field-label">Image (optional)</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="field-input" />
            {uploading && <p className="mt-1 text-xs text-ink/50">Uploading…</p>}
            {form.image_url && !uploading && (
              <div className="mt-3">
                <img src={form.image_url} alt="Preview" className="h-32 rounded-md object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, image_url: '' }))}
                  className="mt-1 block text-xs text-clay hover:underline"
                >
                  Remove image
                </button>
              </div>
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
        {loading ? <Loading /> : posts.length === 0 ? (
          <EmptyState title="No posts yet" description="Create your first post above." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-sage-100 bg-white">
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
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium">{p.title}</td>
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
