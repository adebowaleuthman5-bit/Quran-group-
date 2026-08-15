export type ContentStatus = 'draft' | 'published'
export type QuestionStatus = 'pending' | 'under_review' | 'answered' | 'published' | 'rejected'
export type HadithGrade = 'Sahih' | 'Hasan' | "Da'if" | 'Other'
export type AdminRole = 'super_admin' | 'admin'

export interface Profile {
  id: string
  full_name: string
  role: AdminRole
  created_at: string
  updated_at: string
}

export interface QuranPost {
  id: string
  surah_name: string
  surah_number: number | null
  verse_number: string
  arabic_text: string
  translation: string
  translation_source: string
  tafsir: string | null
  reference: string
  source_url: string | null
  status: ContentStatus
  published_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface HadithPost {
  id: string
  arabic_text: string | null
  translation: string
  collection: string
  hadith_number: string | null
  grade: HadithGrade
  grader: string | null
  reference: string
  source_url: string | null
  explanation: string | null
  status: ContentStatus
  published_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Dhikr {
  id: string
  category: 'morning' | 'evening'
  arabic_text: string
  transliteration: string | null
  translation: string
  repetitions: number | null
  reference: string
  explanation: string | null
  audio_url: string | null
  display_order: number
  status: ContentStatus
  published_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Lecture {
  id: string
  topic: string
  speaker: string
  speaker_info: string | null
  lecture_date: string | null
  lecture_time: string | null
  description: string | null
  recording_url: string | null
  poster_url: string | null
  test_info: string | null
  lecture_status: 'upcoming' | 'completed'
  status: ContentStatus
  published_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface IslamicQuestion {
  id: string
  question: string
  submitter_name: string | null
  submitter_contact: string | null
  category: string | null
  status: QuestionStatus
  created_at: string
}

export interface QuestionAnswer {
  id: string
  question_id: string
  answer: string
  quran_references: string | null
  hadith_references: string | null
  scholarly_references: string | null
  status: ContentStatus
  answered_by: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Executive {
  id: string
  name: string
  position: string
  photo_url: string | null
  biography: string | null
  contact_link: string | null
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface Founder {
  id: string
  name: string | null
  photo_url: string | null
  position: string | null
  biography: string | null
  contact_link: string | null
  updated_at: string
}

export interface GroupInformation {
  id: string
  goal: string | null
  mission: string | null
  vision: string | null
  objectives: string | null
  history: string | null
  updated_at: string
}

export interface GroupRule {
  id: string
  rule_text: string
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface SocialLinks {
  id: string
  whatsapp_general: string | null
  whatsapp_executive: string | null
  tiktok: string | null
  facebook: string | null
  instagram: string | null
  email: string | null
  phone: string | null
  updated_at: string
}

export interface SiteSettings {
  id: string
  site_name: string
  intro_text: string | null
  about_text: string | null
  updated_at: string
}
