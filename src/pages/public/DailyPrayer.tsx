import { useEffect, useState } from 'react'
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan'
import { Loading } from '@/components/ui/States'
import { HijriCalendar } from '@/components/ui/HijriCalendar'
import { getHijriLabel } from '@/lib/hijri'

interface PrayerRow {
  name: string
  time: Date
}

export default function DailyPrayer() {
  const [status, setStatus] = useState<'idle' | 'locating' | 'ready' | 'denied' | 'unsupported'>('idle')
  const [prayers, setPrayers] = useState<PrayerRow[]>([])
  const [sunrise, setSunrise] = useState<Date | null>(null)
  const [remindedFor, setRemindedFor] = useState<Set<string>>(new Set())
  const [reminderMessage, setReminderMessage] = useState<string | null>(null)

  const today = new Date()
  const hijriDate = getHijriLabel(today)
  const gregorianDate = today.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    document.title = 'Daily Prayer | Quran Recitation and Lectures Group'
  }, [])

  function requestLocation() {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported')
      return
    }
    setStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = new Coordinates(position.coords.latitude, position.coords.longitude)
        const params = CalculationMethod.MuslimWorldLeague()
        const times = new AdhanPrayerTimes(coordinates, new Date(), params)
        setSunrise(times.sunrise)
        setPrayers([
          { name: 'Fajr', time: times.fajr },
          { name: 'Dhuhr', time: times.dhuhr },
          { name: 'Asr', time: times.asr },
          { name: 'Maghrib (Sunset)', time: times.maghrib },
          { name: 'Isha', time: times.isha },
        ])
        setStatus('ready')
      },
      () => setStatus('denied')
    )
  }

  useEffect(() => {
    requestLocation()
  }, [])

  async function handleRemind(prayer: PrayerRow) {
    if (!('Notification' in window)) {
      setReminderMessage("Your browser doesn't support notifications.")
      return
    }
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setReminderMessage('Notification permission was not granted.')
      return
    }
    const msUntil = prayer.time.getTime() - Date.now()
    if (msUntil > 0) {
      setTimeout(() => {
        new Notification(`${prayer.name} time`, { body: `It's time for ${prayer.name} prayer.` })
      }, msUntil)
      setRemindedFor((s) => new Set(s).add(prayer.name))
      setReminderMessage(`You'll be reminded for ${prayer.name} — keep this tab open until then.`)
    } else {
      setReminderMessage(`${prayer.name} has already passed for today.`)
    }
  }

  return (
    <div className="container-site py-12">
      <header className="mx-auto max-w-prose text-center">
        <h1 className="text-2xl">Daily Prayer</h1>
        <p className="mt-2 text-ink/60">
          {gregorianDate}
          {hijriDate ? ` · ${hijriDate} AH` : ''}
        </p>
      </header>

      <div className="mx-auto mt-8 max-w-sm">
        {status === 'idle' || status === 'locating' ? (
          <Loading label="Finding your location…" />
        ) : status === 'unsupported' ? (
          <p className="text-center text-sm text-ink/50">Your browser doesn't support location services, so prayer times can't be calculated here.</p>
        ) : status === 'denied' ? (
          <div className="text-center">
            <p className="text-sm text-ink/50">Location access was denied, so prayer times can't be calculated.</p>
            <button onClick={requestLocation} className="btn-secondary mt-4">Try again</button>
          </div>
        ) : (
          <>
            {sunrise && (
              <div className="mb-4 flex items-center justify-between rounded-lg border border-gold/30 bg-gold-light p-4">
                <p className="font-display text-base text-green-deep">Sunrise</p>
                <p className="text-sm text-ink/70">{sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            )}
            <div className="space-y-3">
              {prayers.map((p) => {
                const isPast = p.time.getTime() < Date.now()
                return (
                  <div key={p.name} className="flex items-center justify-between rounded-lg border border-sage-100 bg-surface p-4 shadow-subtle">
                    <div>
                      <p className="font-display text-base text-green-deep">{p.name}</p>
                      <p className="text-sm text-ink/60">{p.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <button
                      onClick={() => handleRemind(p)}
                      disabled={isPast || remindedFor.has(p.name)}
                      className="btn-secondary !px-3 !py-1.5 text-xs disabled:opacity-50"
                    >
                      {remindedFor.has(p.name) ? 'Reminder set' : isPast ? 'Passed' : 'Remind Me'}
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
        {reminderMessage && <p className="mt-4 text-center text-xs text-ink/50">{reminderMessage}</p>}
        <p className="mt-6 text-center text-xs text-ink/40">
          Reminders currently work while this page stays open in your browser. Real device notifications are coming soon.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-sm">
        <HijriCalendar />
      </div>
    </div>
  )
}
