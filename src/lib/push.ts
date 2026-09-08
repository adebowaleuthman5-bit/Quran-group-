import { supabase } from './supabaseClient'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/**
 * Ensures the device has a saved push subscription, creating one if needed.
 * Returns the subscription's row id in Supabase (used to link lecture
 * reminders to this device), or null if the device declined or push isn't
 * supported.
 */
export async function ensurePushSubscription(coords?: { latitude: number; longitude: number }): Promise<string | null> {
  if (!pushSupported()) return null

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
  if (!vapidPublicKey) {
    console.error('Missing VITE_VAPID_PUBLIC_KEY — push notifications cannot be enabled.')
    return null
  }

  const cachedId = window.localStorage.getItem('push_subscription_id')
  if (cachedId) return cachedId

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
  }

  const json = subscription.toJSON()
  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth: json.keys!.auth,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      },
      { onConflict: 'endpoint' }
    )
    .select('id')
    .single()

  if (error || !data) {
    console.error('Failed to save push subscription:', error?.message)
    return null
  }

  window.localStorage.setItem('push_subscription_id', data.id)
  return data.id
}

export async function addLectureReminder(lectureId: string, coords?: { latitude: number; longitude: number }) {
  const subscriptionId = await ensurePushSubscription(coords)
  if (!subscriptionId) return { ok: false, reason: 'permission_denied_or_unsupported' as const }

  const { error } = await supabase
    .from('lecture_reminders')
    .upsert({ subscription_id: subscriptionId, lecture_id: lectureId }, { onConflict: 'subscription_id,lecture_id' })

  if (error) return { ok: false, reason: 'save_failed' as const }
  return { ok: true as const }
}
