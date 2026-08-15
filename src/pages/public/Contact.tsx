import { useEffect } from 'react'
import { useSocialLinks } from '@/lib/hooks'
import { Loading } from '@/components/ui/States'

export default function Contact() {
  useEffect(() => {
    document.title = 'Contact | Quran Recitation and Lectures Group'
  }, [])

  const { data: social, loading } = useSocialLinks()

  return (
    <div className="container-site py-12">
      <header className="mx-auto max-w-prose text-center">
        <h1 className="text-2xl">Contact Us</h1>
        <p className="mt-2 text-ink/60">Reach the group through WhatsApp or our official social media pages.</p>
      </header>

      {loading ? (
        <Loading />
      ) : (
        <div className="mx-auto mt-10 max-w-md space-y-4">
          {social?.whatsapp_general && (
            <a href={social.whatsapp_general} target="_blank" rel="noopener noreferrer" className="btn-whatsapp block w-full text-center">
              Join Our WhatsApp Group
            </a>
          )}

          <div className="rounded-lg border border-sage-100 bg-white p-5 shadow-subtle">
            <p className="text-sm font-medium text-ink/60">Follow us</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              {social?.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-green hover:underline">Facebook</a>}
              {social?.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-green hover:underline">Instagram</a>}
              {social?.tiktok && <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="text-green hover:underline">TikTok</a>}
              {!social?.facebook && !social?.instagram && !social?.tiktok && (
                <p className="text-ink/40">Social media links will be added soon.</p>
              )}
            </div>
          </div>

          {(social?.email || social?.phone) && (
            <div className="rounded-lg border border-sage-100 bg-white p-5 shadow-subtle">
              <p className="text-sm font-medium text-ink/60">Direct contact</p>
              <div className="mt-3 space-y-1 text-sm text-ink/80">
                {social.email && <p>Email: <a href={`mailto:${social.email}`} className="text-green hover:underline">{social.email}</a></p>}
                {social.phone && <p>Phone: {social.phone}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
