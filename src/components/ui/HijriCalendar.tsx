import { useState } from 'react'
import { getHijriMonthDays, shiftHijriMonth, getUpcomingIslamicHolidays } from '@/lib/hijri'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getGregorianMonthGrid(reference: Date) {
  const year = reference.getFullYear()
  const month = reference.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startWeekday = firstDay.getDay()
  const today = new Date()

  const cells: { day: number; isToday: boolean }[] = []
  for (let i = 0; i < startWeekday; i++) cells.push({ day: 0, isToday: false })
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      isToday: d === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
    })
  }
  const monthLabel = firstDay.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  return { cells, monthLabel }
}

export function HijriCalendar() {
  const [tab, setTab] = useState<'hijri' | 'gregorian'>('hijri')
  const [reference, setReference] = useState(new Date())

  const { days, monthLabel: hijriLabel } = getHijriMonthDays(reference)
  const { cells, monthLabel: gregorianLabel } = getGregorianMonthGrid(reference)
  const holidays = getUpcomingIslamicHolidays()

  const leadingBlanks = days.length > 0 ? days[0].gregorian.getDay() : 0

  function goPrev() {
    setReference((r) => (tab === 'hijri' ? shiftHijriMonth(r, -1) : new Date(r.getFullYear(), r.getMonth() - 1, 15)))
  }
  function goNext() {
    setReference((r) => (tab === 'hijri' ? shiftHijriMonth(r, 1) : new Date(r.getFullYear(), r.getMonth() + 1, 15)))
  }

  return (
    <div className="rounded-lg border border-sage-100 bg-surface p-5 shadow-subtle">
      <div className="flex rounded-md border border-sage-200 p-1">
        {(['hijri', 'gregorian'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-sm py-2 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-green text-white' : 'text-ink/60 hover:bg-sage-50'
            }`}
          >
            {t === 'hijri' ? 'Hijri' : 'Gregorian'}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button onClick={goPrev} aria-label="Previous month" className="flex h-8 w-8 items-center justify-center rounded-md text-ink/60 hover:bg-sage-50">
          ‹
        </button>
        <p className="font-display text-sm font-semibold text-green-deep">{tab === 'hijri' ? hijriLabel : gregorianLabel}</p>
        <button onClick={goNext} aria-label="Next month" className="flex h-8 w-8 items-center justify-center rounded-md text-ink/60 hover:bg-sage-50">
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-ink/40">
        {WEEKDAY_LABELS.map((w, i) => (
          <div key={i}>{w}</div>
        ))}
      </div>

      {tab === 'hijri' ? (
        <div className="mt-1 grid grid-cols-7 gap-1 text-center text-sm">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {days.map((d) => (
            <div
              key={d.hijriDay}
              className={`flex h-8 items-center justify-center rounded-full ${
                d.isToday ? 'bg-green text-white font-semibold' : 'text-ink/80'
              }`}
            >
              {d.hijriDay}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-1 grid grid-cols-7 gap-1 text-center text-sm">
          {cells.map((c, i) => (
            <div
              key={i}
              className={`flex h-8 items-center justify-center rounded-full ${
                c.day === 0 ? '' : c.isToday ? 'bg-green text-white font-semibold' : 'text-ink/80'
              }`}
            >
              {c.day || ''}
            </div>
          ))}
        </div>
      )}

      {tab === 'hijri' && (
        <div className="mt-5 border-t border-sage-100 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/40">Upcoming Islamic Dates</p>
          <ul className="mt-3 space-y-2">
            {holidays.slice(0, 5).map((h) => (
              <li key={h.name} className="flex items-center justify-between text-sm">
                <span className="text-ink/80">{h.name}</span>
                <span className="text-ink/50">{h.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
