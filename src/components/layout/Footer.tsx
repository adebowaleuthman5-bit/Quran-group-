import { Link } from 'react-router-dom'
import { useSocialLinks } from '@/lib/hooks'
import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/ui/SocialIcons'

export function Footer() {
  const { data: social } = useSocialLinks()

  return (
    <footer className="relative mt-16 border-t border-sage-100 bg-surface">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="Group logo" className="h-9 w-9 rounded-full object-cover" />
            <span className="brand-name text-sm">Quran Recitation &amp; Lectures Group</span>
          </div>
          <p className="mt-3 text-sm text-ink/60">
            Qur'an recitation, authentic Hadith, daily Adhkar, and beneficial Islamic lectures.
          </p>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-green-deep">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-ink/70">
            <li><Link to="/" className="hover:text-green">Home</Link></li>
            <li><Link to="/daily-prayer" className="hover:text-green">Daily Prayer</Link></li>
            <li><Link to="/qa" className="hover:text-green">Q&amp;A</Link></li>
            <li><Link to="/about" className="hover:text-green">About</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-green-deep">Connect</p>
          <div className="mt-3 flex flex-col gap-3">
            {social?.whatsapp_general && (
              <a href={social.whatsapp_general} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-fit">
                Join Our WhatsApp Group
              </a>
            )}
            <div className="mt-1 flex gap-3">
              {social?.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-sage-200 text-ink/60 transition-colors hover:border-green hover:text-green"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
              )}
              {social?.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-sage-200 text-ink/60 transition-colors hover:border-green hover:text-green"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              {social?.tiktok && (
                <a
                  href={social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-sage-200 text-ink/60 transition-colors hover:border-green hover:text-green"
                >
                  <TikTokIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-sage-100 py-5">
        <div className="container-site text-center text-xs text-ink/50">
          <p>&copy; {new Date().getFullYear()} Quran Recitation and Lectures Group. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
