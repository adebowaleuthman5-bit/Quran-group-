import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-sage-100 bg-parchment/95 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.jpg" alt="Quran Recitation and Lectures Group logo" className="h-10 w-10 rounded-full object-cover" />
          <span className="brand-name text-sm leading-tight sm:text-lg">
            Quran Recitation
            <br className="sm:hidden" /> & Lectures Group
          </span>
        </Link>

        <ThemeToggle />
      </div>
    </header>
  )
}
