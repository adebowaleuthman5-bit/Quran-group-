/**
 * A warm, visible Islamic-motif background: a brown-toned eight-point star
 * lattice, a scattering of small twinkling stars, and a crescent moon —
 * all hand-built from basic SVG shapes (no images), so it stays crisp and
 * adapts automatically to light/dark mode via the site's color tokens.
 *
 * Rendered as an absolutely-positioned first child (not `fixed`), so it
 * naturally sits behind every later sibling without relying on negative
 * z-index — and it stretches to the full height of the page, not just
 * the viewport.
 */
export function IslamicPatternBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full select-none"
      preserveAspectRatio="none"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <pattern id="islamic-star-lattice" width="72" height="72" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
          <g fill="none" stroke="currentColor" strokeWidth="1.1" className="text-clay/[0.16]">
            <rect x="14" y="14" width="44" height="44" />
            <rect x="14" y="14" width="44" height="44" transform="rotate(45 36 36)" />
          </g>
        </pattern>

        <pattern id="islamic-sparkle-stars" width="160" height="160" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <g className="twinkle-stars text-gold/[0.32]" fill="currentColor">
            <path d="M20 6 L23 17 L34 20 L23 23 L20 34 L17 23 L6 20 L17 17 Z" />
            <path d="M100 40 L102 47 L109 49 L102 51 L100 58 L98 51 L91 49 L98 47 Z" />
            <path d="M60 90 L62 97 L69 99 L62 101 L60 108 L58 101 L51 99 L58 97 Z" />
            <path d="M130 110 L133 121 L144 124 L133 127 L130 138 L127 127 L116 124 L127 121 Z" />
          </g>
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#islamic-star-lattice)" />
      <rect width="100%" height="100%" fill="url(#islamic-sparkle-stars)" />

      {/* Crescent moon, upper right */}
      <svg x="80%" y="3%" width="90" height="90" viewBox="0 0 100 100" className="text-gold/[0.4]">
        <path d="M 60 10 A 40 40 0 1 0 60 90 A 32 32 0 1 1 60 10 Z" fill="currentColor" />
      </svg>
    </svg>
  )
}
