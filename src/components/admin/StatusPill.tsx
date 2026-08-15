export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: 'badge-sahih',
    draft: 'bg-sage-100 text-ink/60',
    pending: 'badge-hasan',
    under_review: 'badge-hasan',
    answered: 'badge-sahih',
    rejected: 'badge-daif',
    upcoming: 'badge-sahih',
    completed: 'bg-sage-100 text-ink/60',
  }
  return <span className={`badge ${map[status] ?? 'bg-sage-100 text-ink/60'}`}>{status.replace('_', ' ')}</span>
}
