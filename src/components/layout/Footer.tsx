import { Link } from 'react-router-dom'
import { useSocialLinks } from '@/lib/hooks'

export function Footer() {
  const { data: social } = useSocialLinks()

  return (
    <footer className="mt-16 border-t border-sage-100 bg-white">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="Group logo" className="h-9 w-9 rounded-full object-cover" />
            <span className="font-display text-sm font-semibold text-green-deep">Quran Recitation &amp; Lectures Group</span>
          </div>
          <p className="mt-3 text-sm text-ink/60">
            Qur'an recitation, authentic Hadith, daily Adhkar, and beneficial Islamic lectures.
          </p>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-green-deep">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-ink/70">
            <li><Link to="/posts" className="hover:text-green">Posts</Link></li>
            <li><Link to="/lectures" className="hover:text-green">Lectures</Link></li>
            <li><Link to="/questions" className="hover:text-green">Ask a Question</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-green-deep">Connect</p>
          <div className="mt-3 flex flex-col gap-2">
            {social?.whatsapp_general && (
              <a href={social.whatsapp_general} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-fit">
                Join Our WhatsApp Group
              </a>
            )}
            <div className="mt-1 flex gap-4 text-sm text-ink/60">
              {social?.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-green">Facebook</a>}
              {social?.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-green">Instagram</a>}
              {social?.tiktok && <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-green">TikTok</a>}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-sage-100 py-5">
        <div className="container-site flex flex-col items-center justify-between gap-2 text-xs text-ink/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Quran Recitation and Lectures Group. All rights reserved.</p>
          <Link to="/admin/login" className="hover:text-ink/70">Admin Login</Link>
        </div>
      </div>
    </footer>
  )
}
