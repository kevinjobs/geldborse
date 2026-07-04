/**
 * IP geolocation via ip-api.com (free, no API key, 45 req/min).
 * Returns "City, Country" or null on failure.
 */

export async function getLocationFromIP(ip: string): Promise<string | null> {
  // Skip private/local IPs
  if (
    ip === "unknown" ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.")
  ) {
    return null
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city`,
      { signal: controller.signal }
    )
    clearTimeout(timeout)

    if (!res.ok) return null

    const data = await res.json()
    if (data.status !== "success") return null

    const parts = [data.city, data.regionName, data.country].filter(Boolean)
    return parts.length > 0 ? parts.join(", ") : null
  } catch {
    return null
  }
}
