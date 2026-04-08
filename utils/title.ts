export type Language = "en" | "en_jp" | "zh" | "ja"

export const LANGUAGE_ORDER: Language[] = ["en", "en_jp", "zh", "ja"]

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  en_jp: "Romaji",
  zh: "中文",
  ja: "日本語",
}

export function resolveTitleByLanguage(
  titles: Partial<Record<Language, string | null | undefined>> | undefined,
  language: string | null | undefined
) {
  const selected = LANGUAGE_ORDER.includes(language as Language) ? (language as Language) : "en"
  const order = [selected, ...LANGUAGE_ORDER.filter(lang => lang !== selected)]
  for (const lang of order) {
    const title = titles?.[lang]
    if (title !== undefined && title !== null && title !== "") {
      return title
    }
  }
  return "??"
}

export function normalizeLanguage(language: string | null | undefined): Language {
  return LANGUAGE_ORDER.includes(language as Language) ? (language as Language) : "en"
}
