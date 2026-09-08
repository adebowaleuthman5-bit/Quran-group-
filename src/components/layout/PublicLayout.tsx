import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { IslamicPatternBackground } from '@/components/ui/IslamicPatternBackground'
import { FloatingWhatsApp } from '@/components/ui/FloatingWhatsApp'

export function PublicLayout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <IslamicPatternBackground />
      <Navbar />
      <main className="relative flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}
