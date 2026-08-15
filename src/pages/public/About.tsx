import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useGroupInformation } from '@/lib/hooks'
import { Loading } from '@/components/ui/States'
import { MihrabDivider } from '@/components/ui/MihrabDivider'
import type { Executive, Founder, GroupRule } from '@/lib/types'

export default function About() {
  useEffect(() => {
    document.title = 'About | Quran Recitation and Lectures Group'
  }, [])

  const { data: info, loading: infoLoading } = useGroupInformation()
  const [executives, setExecutives] = useState<Executive[]>([])
  const [founder, setFounder] = useState<Founder | null>(null)
  const [rules, setRules] = useState<GroupRule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('executives').select('*').eq('active', true).order('display_order', { ascending: true }),
      supabase.from('founder').select('*').limit(1).maybeSingle(),
      supabase.from('group_rules').select('*').eq('active', true).order('display_order', { ascending: true }),
    ]).then(([ex, fo, ru]) => {
      setExecutives((ex.data as Executive[]) ?? [])
      setFounder(fo.data as Founder | null)
      setRules((ru.data as GroupRule[]) ?? [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="container-site py-12">
      <header className="mx-auto max-w-prose text-center">
        <h1 className="text-2xl">About the Group</h1>
      </header>

      {infoLoading || loading ? (
        <Loading />
      ) : (
        <div className="mx-auto max-w-prose">
          {info?.goal && (
            <section className="mt-10">
              <h2 className="text-lg">Our Goal</h2>
              <p className="mt-2 leading-relaxed text-ink/80">{info.goal}</p>
            </section>
          )}

          {(info?.mission || info?.vision) && (
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {info.mission && (
                <section>
                  <h2 className="text-lg">Mission</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink/80">{info.mission}</p>
                </section>
              )}
              {info.vision && (
                <section>
                  <h2 className="text-lg">Vision</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink/80">{info.vision}</p>
                </section>
              )}
            </div>
          )}

          {info?.objectives && (
            <section className="mt-10">
              <h2 className="text-lg">Objectives</h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-ink/80">{info.objectives}</p>
            </section>
          )}

          {info?.history && (
            <section className="mt-10">
              <h2 className="text-lg">Our History</h2>
              <p className="mt-2 leading-relaxed text-ink/80">{info.history}</p>
            </section>
          )}

          <MihrabDivider />

          {rules.length > 0 && (
            <section>
              <h2 className="text-lg">Group Rules</h2>
              <ol className="mt-4 space-y-3">
                {rules.map((r, i) => (
                  <li key={r.id} className="flex gap-3 text-sm leading-relaxed text-ink/80">
                    <span className="font-display text-green/50">{String(i + 1).padStart(2, '0')}</span>
                    <span>{r.rule_text}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {founder?.name && (
            <>
              <MihrabDivider />
              <section>
                <h2 className="text-lg">Founder</h2>
                <div className="mt-4 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                  <img
                    src={founder.photo_url ?? '/logo.jpg'}
                    alt={founder.name}
                    className="h-24 w-24 rounded-full object-cover shadow-subtle"
                  />
                  <div>
                    <p className="font-display text-lg text-green-deep">{founder.name}</p>
                    {founder.position && <p className="text-sm text-ink/50">{founder.position}</p>}
                    {founder.biography && <p className="mt-2 text-sm text-ink/75">{founder.biography}</p>}
                  </div>
                </div>
              </section>
            </>
          )}

          <MihrabDivider />

          <section>
            <h2 className="text-lg">Meet Our Executives</h2>
            {executives.length === 0 ? (
              <p className="mt-3 text-sm text-ink/50">Executive profiles will appear here soon.</p>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {executives.map((ex) => (
                  <div key={ex.id} className="rounded-lg border border-sage-100 bg-white p-5 text-center shadow-subtle">
                    <img
                      src={ex.photo_url ?? '/logo.jpg'}
                      alt={ex.name}
                      className="mx-auto h-20 w-20 rounded-full object-cover"
                    />
                    <p className="mt-3 font-medium text-ink">{ex.name}</p>
                    <p className="text-xs text-ink/50">{ex.position}</p>
                    {ex.biography && <p className="mt-2 text-sm text-ink/70">{ex.biography}</p>}
                    {ex.contact_link && (
                      <a href={ex.contact_link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-green hover:underline">
                        Contact
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
