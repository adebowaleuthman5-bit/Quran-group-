import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loading, EmptyState } from '@/components/ui/States'
import type { Executive } from '@/lib/types'

const empty = { name: '', position: '', photo_url: '', biography: '', contact_link: '', display_order: '0', active: true }

export default function ExecutivesAdmin() {
  const [rows, setRows] = useState<Executive[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Executive | null>(null)
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('executives').select('*').order('display_order', { ascending: true })
    setRows((data as Executive[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startCreate() { setEditing(null); setForm(empty); setSaveError(null); setShowForm(true) }
  function startEdit(e: Executive) {
    setEditing(e)
    setForm({
      name: e.name, position: e.position, photo_url: e.photo_url ?? '', biography: e.biography ?? '',
      contact_link: e.contact_link ?? '', display_order: e.display_order.toString(), active: e.active,
    })
    setSaveError(null); setShowForm(true)
  }

  async function handleSave(ev: React.FormEvent) {
    ev.preventDefault()
    if (!form.name || !form.position) { setSaveError('Name and position are required.'); return }
    setSaving(true); setSaveError(null)
    const payload = {
      name: form.name, position: form.position, photo_url: form.photo_url || null,
      biography: form.biography || null, contact_link: form.contact_link || null,
      display_order: Number(form.display_order) || 0, active: form.active,
    }
    const { error } = editing
      ? await supabase.from('executives').update(payload).eq('id', editing.id)
      : await supabase.from('executives').insert(payload)
    setSaving(false)
    if (error) setSaveError(error.message)
    else { setShowForm(false); load() }
  }

  async function toggleActive(e: Executive) {
    await supabase.from('executives').update({ active: !e.active }).eq('id', e.id)
    load()
  }

  async function handleDelete(e: Executive) {
    if (!confirm(`Remove ${e.name} from the executives list?`)) return
    await supabase.from('executives').delete().eq('id', e.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl">Executives</h1>
        <button className="btn-primary" onClick={startCreate}>+ Add Executive</button>
      </div>

      {showForm && (
        <form className="mt-6 space-y-4 rounded-lg border border-sage-100 bg-white p-6 shadow-subtle" onSubmit={handleSave}>
          <h2 className="font-display text-lg text-green-deep">{editing ? 'Edit Executive' : 'New Executive'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Name *</label>
              <input className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Position *</label>
              <input className="field-input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="field-label">Photo URL</label>
            <input className="field-input" value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="Upload to Supabase Storage, then paste the public URL" />
          </div>
          <div>
            <label className="field-label">Short Biography</label>
            <textarea rows={3} className="field-input" value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Contact / Social Link</label>
              <input className="field-input" value={form.contact_link} onChange={(e) => setForm({ ...form, contact_link: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Display Order</label>
              <input type="number" className="field-input" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Active (visible on public site)
          </label>
          {saveError && <p className="text-sm text-clay">{saveError}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-ink/50 hover:text-ink">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-6">
        {loading ? <Loading /> : rows.length === 0 ? (
          <EmptyState title="No executives added yet" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((e) => (
              <div key={e.id} className="rounded-lg border border-sage-100 bg-white p-4 shadow-subtle">
                <div className="flex items-center gap-3">
                  <img src={e.photo_url ?? '/logo.jpg'} alt={e.name} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-ink/50">{e.position}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className={`badge ${e.active ? 'badge-sahih' : 'bg-sage-100 text-ink/60'}`}>{e.active ? 'Active' : 'Inactive'}</span>
                  <div className="space-x-3">
                    <button className="text-green hover:underline" onClick={() => startEdit(e)}>Edit</button>
                    <button className="text-ink/60 hover:underline" onClick={() => toggleActive(e)}>{e.active ? 'Deactivate' : 'Activate'}</button>
                    <button className="text-clay hover:underline" onClick={() => handleDelete(e)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
