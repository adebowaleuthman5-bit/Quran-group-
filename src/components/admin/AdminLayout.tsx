import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/quran', label: "Qur'an" },
  { to: '/admin/hadith', label: 'Hadith' },
  { to: '/admin/adhkar', label: 'Adhkar' },
  { to: '/admin/lectures', label: 'Lectures' },
  { to: '/admin/questions', label: 'Islamic Questions' },
  { to: '/admin/executives', label: 'Executives' },
  { to: '/admin/founder', label: 'Founder' },
  { to: '/admin/group-information', label: 'Group Information' },
  { to: '/admin/rules', label: 'Rules' },
  { to: '/admin/social-links', label: 'Social Links' },
  { to: '/admin/settings', label: 'Settings' },
]

export function AdminLayout() {
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-sage-50">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-sage-100 bg-white px-4 lg:hidden">
        <span className="font-display text-sm font-semibold text-green-deep">Admin Dashboard</span>
        <button onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" className="text-green-deep">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-sage-100 bg-white pt-14 transition-transform lg:static lg:translate-x-0 lg:pt-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="hidden items-center gap-2 border-b border-sage-100 px-5 py-5 lg:flex">
          <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded-full object-cover" />
          <span className="font-display text-sm font-semibold text-green-deep">Admin Dashboard</span>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-green-light text-green-deep' : 'text-ink/70 hover:bg-sage-50'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-sage-100 p-4">
          <p className="text-xs text-ink/50">{profile?.full_name}</p>
          <p className="text-xs capitalize text-ink/40">{profile?.role.replace('_', ' ')}</p>
          <button onClick={signOut} className="btn-secondary mt-3 w-full !py-1.5 text-xs">Logout</button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-20 bg-black/20 lg:hidden" onClick={() => setOpen(false)} />}

      <main className="flex-1 px-4 pb-16 pt-20 lg:px-8 lg:pt-8">
        <Outlet />
      </main>
    </div>
  )
}
