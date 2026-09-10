import { useEffect, useState } from 'react'

export interface NotificationPreferences {
  prayerReminders: boolean
  lectureReminders: boolean
}

const STORAGE_KEY = 'qrlg_notification_prefs'

const defaults: NotificationPreferences = {
  prayerReminders: false,
  lectureReminders: false,
}

function load(): NotificationPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

export function useNotificationPreferences() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(load)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  }, [prefs])

  async function setPreference(key: keyof NotificationPreferences, value: boolean) {
    if (value && 'Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        // Permission denied — don't silently mark the preference as on.
        return
      }
    }
    setPrefs((p) => ({ ...p, [key]: value }))
  }

  return { prefs, setPreference }
}
