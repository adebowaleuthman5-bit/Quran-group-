import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const items = [
  {
    to: '/more/about',
    label: 'About',
    description: 'Our goal, mission, history, executives, and how to reach us',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5.5M12 8v.1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/more/donation',
    label: 'Donation & Support',
    description: 'Ways to support the group',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s-7-4.35-9.5-8.5C.8 9 2 5.5 5.5 5c2-.3 3.5.7 4.5 2.2C11 5.7 12.5 4.7 14.5 5c3.5.5 4.7 4 3 7.5C15 16.65 12 21 12 21Z" />
      </svg>
    ),
  },
  {
    to: '/more/settings',
    label: 'Settings',
    description: 'Dark mode and notification preferences',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 13a7.97 7.97 0 0 0 0-2l2.1-1.6-2-3.4-2.5 1a8 8 0 0 0-1.7-1L15 3h-4l-.3 2.6a8 8 0 0 0-1.7 1l-2.5-1-2 3.4L6.6 11a7.97 7.97 0 0 0 0 2l-2.1 1.6 2 3.4 2.5-1a8 8 0 0 0 1.7 1L11 21h4l.3-2.6a8 8 0 0 0 1.7-1l2.5 1 2-3.4L19.4 13Z" />
      </svg>
    ),
  },
]

export default function More() {
  useEffect(() => {
    document.title = 'More | Quran Recitation and Lectures Group'
  }, [])

  return (
    <div className="container-site py-12">
      <header className="mx-auto max-w-prose text-center">
        <h1 className="text-2xl">More</h1>
      </header>

      <div className="mx-auto mt-8 max-w-prose space-y-3">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-4 rounded-lg border border-sage-100 bg-surface p-5 shadow-subtle transition-colors hover:border-green/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-light text-green-deep">
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{item.label}</p>
              <p className="text-sm text-ink/50">{item.description}</p>
            </div>
            <span className="text-ink/30">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
