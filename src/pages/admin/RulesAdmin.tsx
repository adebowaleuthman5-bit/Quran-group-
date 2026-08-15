import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loading, EmptyState } from '@/components/ui/States'
import type { GroupRule } from '@/lib/types'

export default function RulesAdmin() {
  const [rules, setRules] = useState<GroupRule[]>([])
  const [loading, setLoading] = useState(true)
  const [newRule, setNewRule] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('group_rules').select('*').order('display_order', { ascending: true })
    setRules((data as GroupRule[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addRule(e: React.FormEvent) {
    e.preventDefault()
    if (!newRule.trim()) return
    const nextOrder = rules.length > 0 ? Math.max(...rules.map((r) => r.display_order)) + 1 : 1
    await supabase.from('group_rules').insert({ rule_text: newRule.trim(), display_order: nextOrder })
    setNewRule('')
    load()
  }

  async function saveEdit(id: string) {
    await supabase.from('group_rules').update({ rule_text: editText }).eq('id', id)
    setEditingId(null)
    load()
  }

  async function toggleActive(r: GroupRule) {
    await supabase.from('group_rules').update({ active: !r.active }).eq('id', r.id)
    load()
  }

  async function remove(r: GroupRule) {
    if (!confirm('Delete this rule?')) return
    await supabase.from('group_rules').delete().eq('id', r.id)
    load()
  }

  async function move(r: GroupRule, direction: -1 | 1) {
    const idx = rules.findIndex((x) => x.id === r.id)
    const swapWith = rules[idx + direction]
    if (!swapWith) return
    await Promise.all([
      supabase.from('group_rules').update({ display_order: swapWith.display_order }).eq('id', r.id),
      supabase.from('group_rules').update({ display_order: r.display_order }).eq('id', swapWith.id),
    ])
    load()
  }

  return (
    <div>
      <h1 className="text-xl">Group Rules</h1>
      <p className="mt-1 text-sm text-ink/50">These appear on the public About page in this order.</p>

      <form onSubmit={addRule} className="mt-6 flex gap-3">
        <input className="field-input" placeholder="Add a new rule…" value={newRule} onChange={(e) => setNewRule(e.target.value)} />
        <button type="submit" className="btn-primary shrink-0">Add</button>
      </form>

      <div className="mt-6">
        {loading ? <Loading /> : rules.length === 0 ? (
          <EmptyState title="No rules added yet" />
        ) : (
          <ul className="space-y-2">
            {rules.map((r, i) => (
              <li key={r.id} className="flex items-center gap-3 rounded-lg border border-sage-100 bg-white p-3 shadow-subtle">
                <div className="flex flex-col">
                  <button className="text-ink/30 hover:text-ink" disabled={i === 0} onClick={() => move(r, -1)}>▲</button>
                  <button className="text-ink/30 hover:text-ink" disabled={i === rules.length - 1} onClick={() => move(r, 1)}>▼</button>
                </div>
                {editingId === r.id ? (
                  <input className="field-input flex-1" value={editText} onChange={(e) => setEditText(e.target.value)} />
                ) : (
                  <span className={`flex-1 text-sm ${r.active ? 'text-ink' : 'text-ink/30 line-through'}`}>{r.rule_text}</span>
                )}
                <div className="flex shrink-0 gap-3 text-xs">
                  {editingId === r.id ? (
                    <>
                      <button className="text-green hover:underline" onClick={() => saveEdit(r.id)}>Save</button>
                      <button className="text-ink/50 hover:underline" onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="text-green hover:underline" onClick={() => { setEditingId(r.id); setEditText(r.rule_text) }}>Edit</button>
                      <button className="text-ink/60 hover:underline" onClick={() => toggleActive(r)}>{r.active ? 'Hide' : 'Show'}</button>
                      <button className="text-clay hover:underline" onClick={() => remove(r)}>Delete</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
