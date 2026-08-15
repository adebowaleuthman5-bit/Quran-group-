import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loading } from '@/components/ui/States'
import type { SocialLinks } from '@/lib/types'

export default function SocialLinksAdmin() {
  const [row, setRow] = useState<SocialLinks | null>(null)
  const [form, setForm] = useState({
    whatsapp_general: '', whatsapp_executive: '', tiktok: '', facebook: '', instagram: '', email: '', phone: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('social_links').select('*').limit(1).maybeSingle().then(({ data }) => {
      const s = data as SocialLinks | null
      setRow(s)
      if (s) {
        setForm({
          whatsapp_general: s.whatsapp_general ?? '', whatsapp_executive: s.whatsapp_executive ?? '',
          tiktok: s.tiktok ?? '', facebook: s.facebook ?? '', instagram: s.instagram ?? '',
          email: s.email ?? '', phone: s.phone ?? '',
        })
      }
      setLoading(false)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    if (row) {
      await supabase.from('social_links').update(form).eq('id', row.id)
    } else {
      await supabase.from('social_links').insert(form)
    }
    setSaving(false)
    setSaved(true)
  }

  if (loading) return <Loading />

  return (
    <div>
      <h1 className="text-xl">Social &amp; WhatsApp Links</h1>
      <p className="mt-1 text-sm text-ink/50">
        The Executive WhatsApp link is never shown to ordinary visitors — keep it here for internal reference only.
      </p>

      <form onSubmit={handleSave} className="mt-6 max-w-xl space-y-4 rounded-lg border border-sage-100 bg-white p-6 shadow-subtle">
        <div>
          <label className="field-label">General WhatsApp Group Link *</label>
          <input className="field-input" value={form.whatsapp_general} onChange={(e) => setForm({ ...form, whatsapp_general: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Executive WhatsApp Group Link (not public)</label>
          <input className="field-input" value={form.whatsapp_executive} onChange={(e) => setForm({ ...form, whatsapp_executive: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Facebook</label>
            <input className="field-input" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Instagram</label>
            <input className="field-input" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="field-label">TikTok</label>
          <input className="field-input" value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Email (optional)</label>
            <input className="field-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Phone (optional)</label>
            <input className="field-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
          {saved && <span className="text-sm text-green">Saved.</span>}
        </div>
      </form>
    </div>
  )
}
