import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/posts', label: 'Posts' },
  { to: '/lectures', label: 'Lectures' },
  { to: '/questions', label: 'Questions' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-sage-100 bg-parchment/95 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <img src="/logo.jpg" alt="Quran Recitation and Lectures Group logo" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-display text-sm font-semibold leading-tight text-green-deep sm:text-base">
            Quran Recitation
            <br className="sm:hidden" /> & Lectures Group
          </span>
        </NavLink>

        <nav className="hidden lg:flex lg:items-center lg:gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-green-light text-green-deep' : 'text-ink/70 hover:bg-sage-50 hover:text-ink'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/admin/login" className="ml-2 rounded-md border border-sage-200 px-3 py-2 text-sm font-medium text-ink/60 hover:bg-sage-50">
            Admin Login
          </NavLink>
        </nav>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md text-green-deep lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-sage-100 bg-parchment lg:hidden">
          <div className="container-site flex flex-col py-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-3 text-sm font-medium ${isActive ? 'bg-green-light text-green-deep' : 'text-ink/70'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <NavLink to="/admin/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-sm font-medium text-ink/50">
              Admin Login
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  )
}
