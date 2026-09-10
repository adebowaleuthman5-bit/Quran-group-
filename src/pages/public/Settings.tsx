import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useNotificationPreferences } from '@/lib/notificationPreferences'

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-sage-100 bg-surface p-5 shadow-subtle">
      <div className="min-w-0">
        <p className="font-medium text-ink">{label}</p>
        {description && <p className="mt-0.5 text-sm text-ink/50">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-green' : 'bg-sage-200'}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-subtle transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default function Settings() {
  useEffect(() => {
    document.title = 'Settings | Quran Recitation and Lectures Group'
  }, [])

  const { theme, toggleTheme } = useTheme()
  const { prefs, setPreference } = useNotificationPreferences()

  return (
    <div className="container-site py-12">
      <Link to="/more" className="text-sm font-medium text-green hover:underline">← Back to More</Link>

      <header className="mx-auto mt-4 max-w-prose text-center">
        <h1 className="text-2xl">Settings</h1>
      </header>

      <div className="mx-auto mt-8 max-w-prose space-y-8">
        <section>
          <h2 className="text-lg">Appearance</h2>
          <div className="mt-4">
            <ToggleRow
              label="Dark Theme"
              description="Switch the whole site between light and dark"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg">Notifications</h2>
          <p className="mt-1 text-sm text-ink/60">Choose which reminders you'd like to receive.</p>
          <div className="mt-4 space-y-3">
            <ToggleRow
              label="Prayer Time Reminders"
              description="A reminder near each prayer time"
              checked={prefs.prayerReminders}
              onChange={(v) => setPreference('prayerReminders', v)}
            />
            <ToggleRow
              label="Lecture Reminders"
              description="A reminder before lectures you've marked"
              checked={prefs.lectureReminders}
              onChange={(v) => setPreference('lectureReminders', v)}
            />
          </div>
          <p className="mt-4 text-xs text-ink/40">
            These currently use your browser's notification permission and work while a page from this site stays
            open. Full background notifications are coming soon — your preferences here will carry over
            automatically once that's ready.
          </p>
        </section>
      </div>
    </div>
  )
}
