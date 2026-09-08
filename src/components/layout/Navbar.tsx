import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const links = [
  { to: '/', label: 'Home' },
  { to: '/daily-prayer', label: 'Daily Prayer' },
  { to: '/qa', label: 'Q&A' },
  { to: '/about', label: 'About' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-sage-100 bg-parchment/95 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <img src="/logo.jpg" alt="Quran Recitation and Lectures Group logo" className="h-10 w-10 rounded-full object-cover" />
          <span className="brand-name text-sm leading-tight sm:text-lg">
            Quran Recitation
            <br className="sm:hidden" /> & Lectures Group
          </span>
        </NavLink>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md text-green-deep"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-sage-100 bg-parchment">
          <div className="container-site flex flex-col py-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-3 text-base font-medium ${isActive ? 'bg-green-light text-green-deep' : 'text-ink/70'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
