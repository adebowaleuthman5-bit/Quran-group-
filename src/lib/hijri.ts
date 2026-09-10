const HIJRI_CALENDAR = 'en-u-ca-islamic-umalqura'

export interface HijriDay {
  gregorian: Date
  hijriDay: number
  hijriMonth: number
  hijriYear: number
  isToday: boolean
}

export interface HijriHoliday {
  name: string
  date: Date
}

function getHijriParts(date: Date) {
  const parts = new Intl.DateTimeFormat(HIJRI_CALENDAR, { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return { year: get('year'), month: get('month'), day: get('day') }
}

export function getHijriLabel(date: Date): string {
  return new Intl.DateTimeFormat(HIJRI_CALENDAR, { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

/**
 * Returns every day belonging to the same Hijri month as `reference`,
 * each mapped to its real Gregorian date — enough to draw a month grid.
 * Uses the browser's built-in Umm al-Qura calendar data (ECMA-402 Intl),
 * the same official Islamic calendar used by Saudi Arabia and most
 * reliable Hijri date converters — not a rough arithmetic approximation.
 */
export function getHijriMonthDays(reference: Date): { days: HijriDay[]; monthLabel: string } {
  const { year: refYear, month: refMonth } = getHijriParts(reference)
  const todayParts = getHijriParts(new Date())

  const days: HijriDay[] = []
  // A Hijri month is 29 or 30 days; scanning 40 days either side of the
  // reference date safely covers the full month regardless of where in
  // the month `reference` falls.
  for (let offset = -40; offset <= 40; offset++) {
    const d = new Date(reference)
    d.setDate(d.getDate() + offset)
    const parts = getHijriParts(d)
    if (parts.year === refYear && parts.month === refMonth) {
      days.push({
        gregorian: d,
        hijriDay: parts.day,
        hijriMonth: parts.month,
        hijriYear: parts.year,
        isToday: parts.year === todayParts.year && parts.month === todayParts.month && parts.day === todayParts.day,
      })
    }
  }

  days.sort((a, b) => a.hijriDay - b.hijriDay)
  const monthLabel = new Intl.DateTimeFormat(HIJRI_CALENDAR, { month: 'long', year: 'numeric' }).format(reference)
  return { days, monthLabel }
}

/** Jumps roughly one Hijri month forward/backward from a reference date. */
export function shiftHijriMonth(reference: Date, direction: -1 | 1): Date {
  const d = new Date(reference)
  d.setDate(d.getDate() + direction * 29)
  const { days } = getHijriMonthDays(d)
  return days[Math.floor(days.length / 2)]?.gregorian ?? d
}

const HOLIDAYS: { month: number; day: number; name: string }[] = [
  { month: 1, day: 1, name: 'Islamic New Year (1 Muharram)' },
  { month: 1, day: 10, name: 'Ashura' },
  { month: 3, day: 12, name: 'Mawlid al-Nabi' },
  { month: 7, day: 27, name: "Isra and Mi'raj" },
  { month: 9, day: 1, name: 'Start of Ramadan' },
  { month: 9, day: 27, name: 'Laylatul Qadr (estimated)' },
  { month: 10, day: 1, name: 'Eid al-Fitr' },
  { month: 12, day: 8, name: 'Hajj begins' },
  { month: 12, day: 9, name: 'Day of Arafah' },
  { month: 12, day: 10, name: 'Eid al-Adha' },
]

/**
 * Finds the next occurrence (starting today) of each major Islamic
 * holiday, sorted soonest-first. Uses the same Umm al-Qura calendar as
 * the rest of this module, so the dates stay internally consistent.
 */
export function getUpcomingIslamicHolidays(from: Date = new Date(), scanDays = 380): HijriHoliday[] {
  const results: HijriHoliday[] = []
  const remaining = new Set(HOLIDAYS.map((h) => `${h.month}-${h.day}`))

  for (let offset = 0; offset <= scanDays && remaining.size > 0; offset++) {
    const d = new Date(from)
    d.setDate(d.getDate() + offset)
    const parts = getHijriParts(d)
    const key = `${parts.month}-${parts.day}`
    if (remaining.has(key)) {
      const holiday = HOLIDAYS.find((h) => `${h.month}-${h.day}` === key)!
      results.push({ name: holiday.name, date: d })
      remaining.delete(key)
    }
  }

  return results.sort((a, b) => a.date.getTime() - b.date.getTime())
}
