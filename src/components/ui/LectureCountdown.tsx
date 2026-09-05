import { useEffect, useState } from 'react'
import type { Lecture } from '@/lib/types'

function getTimeParts(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff <= 0,
  }
}

export function LectureCountdown({ lecture }: { lecture: Lecture }) {
  const targetMs = lecture.lecture_datetime ? new Date(lecture.lecture_datetime).getTime() : null
  const [parts, setParts] = useState(() => (targetMs ? getTimeParts(targetMs) : null))
  const [reminderSet, setReminderSet] = useState(false)
  const [reminderMessage, setReminderMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!targetMs) return
    const interval = setInterval(() => setParts(getTimeParts(targetMs)), 1000)
    return () => clearInterval(interval)
  }, [targetMs])

  if (!targetMs || !parts || parts.done) return null

  async function handleRemindMe() {
    if (!('Notification' in window)) {
      setReminderMessage("Your browser doesn't support notifications.")
      return
    }
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setReminderMessage('Notification permission was not granted.')
      return
    }
    const msUntil = targetMs - Date.now()
    // setTimeout has a practical ceiling (~24 days); beyond that, just confirm intent.
    if (msUntil > 0 && msUntil < 2_147_000_000) {
      setTimeout(() => {
        new Notification('Lecture starting now', { body: lecture.topic })
      }, msUntil)
    }
    setReminderSet(true)
    setReminderMessage('You will be reminded — keep this tab open until then.')
  }

  return (
    <div className="rounded-lg border border-sage-100 bg-white p-6 text-center shadow-subtle">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/40">Next Lecture</p>
      <p className="mt-1 font-display text-lg text-green-deep">{lecture.topic}</p>
      <div className="mt-4 flex justify-center gap-4 sm:gap-6">
        {[
          { label: 'Days', value: parts.days },
          { label: 'Hours', value: parts.hours },
          { label: 'Minutes', value: parts.minutes },
        ].map((unit) => (
          <div key={unit.label}>
            <p className="font-display text-2xl font-semibold text-green sm:text-3xl">{String(unit.value).padStart(2, '0')}</p>
            <p className="text-xs uppercase tracking-wide text-ink/40">{unit.label}</p>
          </div>
        ))}
      </div>
      <button
        onClick={handleRemindMe}
        disabled={reminderSet}
        className="btn-secondary mt-5 !px-4 !py-2 text-sm disabled:opacity-60"
      >
        {reminderSet ? 'Reminder set' : 'Remind Me'}
      </button>
      {reminderMessage && <p className="mt-2 text-xs text-ink/50">{reminderMessage}</p>}
    </div>
  )
}
