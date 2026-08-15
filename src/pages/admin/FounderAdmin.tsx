import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loading } from '@/components/ui/States'
import type { Founder } from '@/lib/types'

export default function FounderAdmin() {
  const [row, setRow] = useState<Founder | null>(null)
  const [form, setForm] = useState({ name: '', photo_url: '', position: '', biography: '', contact_link: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('founder').select('*').limit(1).maybeSingle().then(({ data }) => {
      const f = data as Founder | null
      setRow(f)
      if (f) {
        setForm({
          name: f.name ?? '', photo_url: f.photo_url ?? '', position: f.position ?? '',
          biography: f.biography ?? '', contact_link: f.contact_link ?? '',
        })
      }
      setLoading(false)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const payload = {
      name: form.name || null, photo_url: form.photo_url || null, position: form.position || null,
      biography: form.biography || null, contact_link: form.contact_link || null,
    }
    if (row) {
      await supabase.from('founder').update(payload).eq('id', row.id)
    } else {
      await supabase.from('founder').insert(payload)
    }
    setSaving(false)
    setSaved(true)
  }

  if (loading) return <Loading />

  return (
    <div>
      <h1 className="text-xl">Founder</h1>
      <p className="mt-1 text-sm text-ink/50">This information appears on the public About page. Leave fields blank to hide the founder section.</p>

      <form onSubmit={handleSave} className="mt-6 max-w-xl space-y-4 rounded-lg border border-sage-100 bg-white p-6 shadow-subtle">
        <div>
          <label className="field-label">Name</label>
          <input className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Position / Title</label>
          <input className="field-input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Photo URL</label>
          <input className="field-input" value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Biography</label>
          <textarea rows={4} className="field-input" value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Contact / Social Link</label>
          <input className="field-input" value={form.contact_link} onChange={(e) => setForm({ ...form, contact_link: e.target.value })} />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
          {saved && <span className="text-sm text-green">Saved.</span>}
        </div>
      </form>
    </div>
  )
}
