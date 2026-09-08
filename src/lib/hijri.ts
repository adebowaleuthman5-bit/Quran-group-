const HIJRI_MONTHS = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
]

/**
 * Converts a Gregorian date to the Hijri (Islamic) calendar using the
 * standard tabular arithmetic algorithm. This is an approximation used
 * widely for display purposes — it can be off by a day from local moon
 * sighting, which is normal and expected for any calculated Hijri date.
 */
export function gregorianToHijri(date: Date): { day: number; month: number; year: number; label: string } {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  const a = Math.floor((month - 14) / 12)
  let jd =
    Math.floor((1461 * (year + 4800 + a)) / 4) +
    Math.floor((367 * (month - 2 - 12 * a)) / 12) -
    Math.floor((3 * Math.floor((year + 4900 + a) / 100)) / 4) +
    day -
    32075

  let l = jd - 1948440 + 10632
  const n = Math.floor((l - 1) / 10631)
  l = l - 10631 * n + 354
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238)
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29
  const hijriMonth = Math.floor((24 * l) / 709)
  const hijriDay = l - Math.floor((709 * hijriMonth) / 24)
  const hijriYear = 30 * n + j - 30

  return {
    day: hijriDay,
    month: hijriMonth,
    year: hijriYear,
    label: `${hijriDay} ${HIJRI_MONTHS[hijriMonth - 1]} ${hijriYear} AH`,
  }
}
