export function anilistDateToString(date: { year?: number; month?: number; day?: number }) {
  const { year, month, day } = date
  if (!year || !month || !day) return
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
}

/**
 * Robust fetch wrapper with exponential backoff for rate-limits (429) and upstream server errors (500-504)
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  baseDelay = 1500
): Promise<Response> {
  const defaultHeaders = {
    "User-Agent": "Mozilla/5.0 Animeland/1.0 (DatabaseSyncBot; +https://animeland.local)",
    ...((options.headers as any) || {}),
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetch(url, { ...options, headers: defaultHeaders })

      // Handle 429 Rate Limit
      if (resp.status === 429) {
        let delay: number | null = null

        // 1. Check Retry-After header (seconds or HTTP-date)
        const retryAfterHeader = resp.headers.get("Retry-After")
        if (retryAfterHeader) {
          const seconds = Number(retryAfterHeader)
          if (!isNaN(seconds) && seconds > 0) {
            delay = (seconds + 0.5) * 1000
          } else {
            const parsedDate = Date.parse(retryAfterHeader)
            if (!isNaN(parsedDate)) {
              const diff = parsedDate - Date.now()
              if (diff > 0 && diff < 60000) {
                delay = diff + 1000
              }
            }
          }
        }

        // 2. Check Rate-Limit-Reset headers if Retry-After not present
        if (!delay) {
          const resetHeader =
            resp.headers.get("X-RateLimit-Reset") ||
            resp.headers.get("RateLimit-Reset") ||
            resp.headers.get("x-ratelimit-reset")

          if (resetHeader) {
            const resetVal = Number(resetHeader)
            if (!isNaN(resetVal) && resetVal > 0) {
              if (resetVal > 1e9) {
                // Unix epoch timestamp in seconds
                const diff = resetVal * 1000 - Date.now()
                if (diff > 0 && diff < 60000) {
                  delay = diff + 1000
                }
              } else {
                // Relative seconds
                delay = (resetVal + 0.5) * 1000
              }
            }
          }
        }

        // 3. Fall back to exponential backoff with jitter if headers not provided
        if (!delay) {
          delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 500
        }

        console.log(`[Rate Limit 429] Waiting ${(delay / 1000).toFixed(1)}s (Attempt ${attempt}/${maxRetries})...`)
        await new Promise(r => setTimeout(r, delay))
        continue
      }

      // Handle 500-504 Server Errors (Gateway Timeout / Service Unavailable)
      if (resp.status >= 500 && resp.status <= 504) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 500
        console.log(
          `[Server Error ${resp.status}] Waiting ${(delay / 1000).toFixed(1)}s (Attempt ${attempt}/${maxRetries})...`
        )
        await new Promise(r => setTimeout(r, delay))
        continue
      }

      return resp
    } catch (err) {
      if (attempt === maxRetries) throw err
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 500
      console.log(`[Network Error] Retrying in ${(delay / 1000).toFixed(1)}s (Attempt ${attempt}/${maxRetries})...`)
      await new Promise(r => setTimeout(r, delay))
    }
  }

  throw new Error(`Failed request after ${maxRetries} retries: ${url}`)
}

/**
 * Calculates Dice coefficient similarity between two strings (0.0 to 1.0)
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0
  const s1 = str1.replace(/\s+/g, "").toLowerCase()
  const s2 = str2.replace(/\s+/g, "").toLowerCase()
  if (s1 === s2) return 1.0
  if (s1.length < 2 || s2.length < 2) return 0

  const bigrams1 = new Map<string, number>()
  for (let i = 0; i < s1.length - 1; i++) {
    const bigram = s1.substring(i, i + 2)
    bigrams1.set(bigram, (bigrams1.get(bigram) || 0) + 1)
  }

  let intersection = 0
  for (let i = 0; i < s2.length - 1; i++) {
    const bigram = s2.substring(i, i + 2)
    const count = bigrams1.get(bigram) || 0
    if (count > 0) {
      bigrams1.set(bigram, count - 1)
      intersection++
    }
  }

  return (2.0 * intersection) / (s1.length + s2.length - 2)
}
