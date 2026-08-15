import type { HadithGrade } from '@/lib/types'

const gradeClass: Record<HadithGrade, string> = {
  Sahih: 'badge-sahih',
  Hasan: 'badge-hasan',
  "Da'if": 'badge-daif',
  Other: 'badge-other',
}

export function HadithGradeBadge({ grade, grader }: { grade: HadithGrade; grader?: string | null }) {
  return (
    <span className={gradeClass[grade]} title={grader ? `Graded by ${grader}` : undefined}>
      {grade}
    </span>
  )
}
