import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'

interface Counts {
  quran: number
  hadith: number
  adhkar: number
  lectures: number
  pendingQuestions: number
  publishedAnswers: number
  executives: number
}

export default function Dashboard() {
  const { profile } = useAuth()
  const [counts, setCounts] = useState<Counts | null>(null)

  useEffect(() => {
    async function load() {
      const [quran, hadith, adhkar, lectures, pendingQuestions, publishedAnswers, executives] = await Promise.all([
        supabase.from('quran_posts').select('id', { count: 'exact', head: true }),
        supabase.from('hadith_posts').select('id', { count: 'exact', head: true }),
        supabase.from('adhkar').select('id', { count: 'exact', head: true }),
        supabase.from('lectures').select('id', { count: 'exact', head: true }),
        supabase.from('islamic_questions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('question_answers').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('executives').select('id', { count: 'exact', head: true }),
      ])
      setCounts({
        quran: quran.count ?? 0,
        hadith: hadith.count ?? 0,
        adhkar: adhkar.count ?? 0,
        lectures: lectures.count ?? 0,
        pendingQuestions: pendingQuestions.count ?? 0,
        publishedAnswers: publishedAnswers.count ?? 0,
        executives: executives.count ?? 0,
      })
    }
    load()
  }, [])

  const cards = [
    { label: "Qur'an Posts", value: counts?.quran, to: '/admin/quran' },
    { label: 'Hadith Posts', value: counts?.hadith, to: '/admin/hadith' },
    { label: 'Adhkar', value: counts?.adhkar, to: '/admin/adhkar' },
    { label: 'Lectures', value: counts?.lectures, to: '/admin/lectures' },
    { label: 'Pending Questions', value: counts?.pendingQuestions, to: '/admin/questions' },
    { label: 'Published Answers', value: counts?.publishedAnswers, to: '/admin/questions' },
    { label: 'Executives', value: counts?.executives, to: '/admin/executives' },
  ]

  return (
    <div>
      <h1 className="text-xl">Welcome{profile ? `, ${profile.full_name}` : ''}</h1>
      <p className="mt-1 text-sm text-ink/50">Here's an overview of the site's content.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="rounded-lg border border-sage-100 bg-white p-5 shadow-subtle hover:border-green/40">
            <p className="text-2xl font-semibold text-green-deep">{c.value ?? '—'}</p>
            <p className="mt-1 text-sm text-ink/60">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
