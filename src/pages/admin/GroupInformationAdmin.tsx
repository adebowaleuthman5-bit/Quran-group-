import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loading } from '@/components/ui/States'
import type { GroupInformation } from '@/lib/types'

export default function GroupInformationAdmin() {
  const [row, setRow] = useState<GroupInformation | null>(null)
  const [form, setForm] = useState({ goal: '', mission: '', vision: '', objectives: '', history: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('group_information').select('*').limit(1).maybeSingle().then(({ data }) => {
      const g = data as GroupInformation | null
      setRow(g)
      if (g) {
        setForm({ goal: g.goal ?? '', mission: g.mission ?? '', vision: g.vision ?? '', objectives: g.objectives ?? '', history: g.history ?? '' })
      }
      setLoading(false)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    if (row) {
      await supabase.from('group_information').update(form).eq('id', row.id)
    } else {
      await supabase.from('group_information').insert(form)
    }
    setSaving(false)
    setSaved(true)
  }

  if (loading) return <Loading />

  return (
    <div>
      <h1 className="text-xl">Group Information</h1>
      <p className="mt-1 text-sm text-ink/50">Edits here appear on the public About page.</p>

      <form onSubmit={handleSave} className="mt-6 max-w-2xl space-y-5 rounded-lg border border-sage-100 bg-white p-6 shadow-subtle">
        <div>
          <label className="field-label">Goal</label>
          <textarea rows={4} className="field-input" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Mission</label>
          <textarea rows={3} className="field-input" value={form.mission} onChange={(e) => setForm({ ...form, mission: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Vision</label>
          <textarea rows={3} className="field-input" value={form.vision} onChange={(e) => setForm({ ...form, vision: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Objectives</label>
          <textarea rows={4} className="field-input" value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} placeholder="One objective per line" />
        </div>
        <div>
          <label className="field-label">Group History</label>
          <textarea rows={5} className="field-input" value={form.history} onChange={(e) => setForm({ ...form, history: e.target.value })} />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
          {saved && <span className="text-sm text-green">Saved.</span>}
        </div>
      </form>
    </div>
  )
}
