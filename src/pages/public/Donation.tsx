import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '@/lib/hooks'
import { Loading, EmptyState } from '@/components/ui/States'

export default function Donation() {
  useEffect(() => {
    document.title = 'Donation & Support | Quran Recitation and Lectures Group'
  }, [])

  const { data: settings, loading } = useSiteSettings()

  return (
    <div className="container-site py-12">
      <Link to="/more" className="text-sm font-medium text-green hover:underline">← Back to More</Link>

      <header className="mx-auto mt-4 max-w-prose text-center">
        <h1 className="text-2xl">Donation &amp; Support</h1>
      </header>

      <div className="mx-auto mt-8 max-w-prose">
        {loading ? (
          <Loading />
        ) : settings?.donation_text ? (
          <div className="whitespace-pre-line rounded-lg border border-gold/30 bg-gold-light p-6 leading-relaxed text-ink/80">
            {settings.donation_text}
          </div>
        ) : (
          <EmptyState title="No donation details yet" description="Check back soon for ways to support the group." />
        )}
      </div>
    </div>
  )
}
