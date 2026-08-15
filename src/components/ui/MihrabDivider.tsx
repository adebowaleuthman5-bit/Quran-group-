/**
 * Signature motif: a single-line arch, echoing the mihrab niche and the
 * podium arch in the group's own logo. Used sparingly as a section divider
 * instead of a generic rule or icon.
 */
export function MihrabDivider() {
  return (
    <div className="mihrab-divider" role="presentation" aria-hidden="true">
      <svg width="72" height="28" viewBox="0 0 72 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 27V14C2 6.8 9 1 20 1M70 27V14C70 6.8 63 1 52 1M20 1C31 1 41 1 52 1"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle cx="36" cy="14" r="2" fill="currentColor" />
      </svg>
    </div>
  )
}
