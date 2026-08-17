import { useState } from 'react'

export function ShareButton({ title, text }: { title: string; text?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch {
        // person cancelled the share sheet — no action needed
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — silently do nothing
    }
  }

  return (
    <button onClick={handleShare} className="btn-secondary !px-3 !py-1.5 text-xs" aria-label="Share this post">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 3.9M15.4 6.6L8.6 10.5" />
      </svg>
      {copied ? 'Link copied' : 'Share'}
    </button>
  )
}
