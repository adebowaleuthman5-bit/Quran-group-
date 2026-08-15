import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { Loading } from '@/components/ui/States'
import type { SiteSettings } from '@/lib/types'

export default function SettingsAdmin() {
  const { profile } = useAuth()
  const [row, setRow] = useState<SiteSettings | null>(null)
  const [form, setForm] = useState({ site_name: '', intro_text: '', about_text: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('site_settings').select('*').limit(1).maybeSingle().then(({ data }) => {
      const s = data as SiteSettings | null
      setRow(s)
      if (s) setForm({ site_name: s.site_name, intro_text: s.intro_text ?? '', about_text: s.about_text ?? '' })
      setLoading(false)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    if (row) {
      await supabase.from('site_settings').update(form).eq('id', row.id)
    } else {
      await supabase.from('site_settings').insert(form)
    }
    setSaving(false)
    setSaved(true)
  }

  if (loading) return <Loading />

  return (
    <div>
      <h1 className="text-xl">Site Settings</h1>
      <p className="mt-1 text-sm text-ink/50">Signed in as {profile?.full_name} ({profile?.role.replace('_', ' ')})</p>

      <form onSubmit={handleSave} className="mt-6 max-w-xl space-y-4 rounded-lg border border-sage-100 bg-white p-6 shadow-subtle">
        <div>
          <label className="field-label">Site Name</label>
          <input className="field-input" value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Homepage Introduction</label>
          <textarea rows={3} className="field-input" value={form.intro_text} onChange={(e) => setForm({ ...form, intro_text: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Short About Text (homepage preview)</label>
          <textarea rows={3} className="field-input" value={form.about_text} onChange={(e) => setForm({ ...form, about_text: e.target.value })} />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
          {saved && <span className="text-sm text-green">Saved.</span>}
        </div>
      </form>

      {profile?.role === 'super_admin' && (
        <div className="mt-8 max-w-xl rounded-lg border border-sage-100 bg-white p-6 shadow-subtle">
          <h2 className="font-display text-lg text-green-deep">Admin Accounts</h2>
          <p className="mt-2 text-sm text-ink/60">
            To add or remove administrators, create or delete their user in Supabase Authentication, then add or
            update their matching row in the <code className="rounded bg-sage-50 px-1">profiles</code> table with a
            role of <code className="rounded bg-sage-50 px-1">super_admin</code> or <code className="rounded bg-sage-50 px-1">admin</code>.
            See the README for step-by-step instructions.
          </p>
        </div>
      )}
    </div>
  )
}
