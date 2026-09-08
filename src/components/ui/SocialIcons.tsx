interface IconProps {
  className?: string
}

export function FacebookIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.35A21 21 0 0 0 14.2 4.2c-2.15 0-3.62 1.31-3.62 3.72V10.5H8.1v3h2.48V21h2.92Z" />
    </svg>
  )
}

export function InstagramIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TikTokIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15.5 3c.4 2 1.8 3.4 3.8 3.6v2.9c-1.4 0-2.7-.4-3.8-1.2v6.4c0 3-2.4 5.3-5.4 5.3S4.7 17.7 4.7 14.7c0-2.9 2.3-5.3 5.2-5.3.3 0 .6 0 .9.1v3a2.3 2.3 0 1 0 1.7 2.2V3h3Z" />
    </svg>
  )
}

export function WhatsAppIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.3A9 9 0 1 0 12 3Zm0 1.8a7.2 7.2 0 0 1 6.1 11l1 3.4-3.5-1a7.2 7.2 0 1 1-3.6-13.4Zm-2.6 3.7c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2s.9 2.3 1 2.4c.1.2 1.8 2.7 4.3 3.7 2.1.8 2.5.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3-.3-.2-1.5-.8-1.8-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.5-.8-.7-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5-.1-.2-.6-1.6-.9-2.2-.2-.5-.4-.4-.6-.4Z" />
    </svg>
  )
}
