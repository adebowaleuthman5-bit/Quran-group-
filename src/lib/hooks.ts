import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { SocialLinks, SiteSettings, GroupInformation } from '@/lib/types'

export function useSocialLinks() {
  const [data, setData] = useState<SocialLinks | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('social_links')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setData(data as SocialLinks | null)
        setLoading(false)
      })
  }, [])

  return { data, loading }
}

export function useSiteSettings() {
  const [data, setData] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setData(data as SiteSettings | null)
        setLoading(false)
      })
  }, [])

  return { data, loading }
}

export function useGroupInformation() {
  const [data, setData] = useState<GroupInformation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('group_information')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setData(data as GroupInformation | null)
        setLoading(false)
      })
  }, [])

  return { data, loading }
}
