export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink/60">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-sage-300 border-t-green" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-sage-200 bg-white/60 px-6 py-14 text-center">
      <p className="font-display text-lg text-green-deep">{title}</p>
      {description && <p className="mt-2 text-sm text-ink/60">{description}</p>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-clay/20 bg-clay/5 px-6 py-10 text-center">
      <p className="font-medium text-clay">Something went wrong loading this content.</p>
      {message && <p className="mt-1 text-sm text-ink/60">{message}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4">
          Try again
        </button>
      )}
    </div>
  )
}
