import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-site flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-2xl">Page not found</h1>
      <p className="mt-2 text-ink/60">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="btn-primary mt-6">Return home</Link>
    </div>
  )
}
